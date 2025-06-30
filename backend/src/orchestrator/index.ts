import { Task, TaskDependencySchema, Dependency } from "./task";
import { TaskStore } from "../stores/task-store";
import { z } from "zod";
import { EventStore } from "../stores/event-store";
import { mint } from "../utils";
import { EventType, Event } from "./event";
import assert from "assert";
import { seedWithDefaultTasks } from "./seeder";

/**
 * This is the core orchestrator that powers the application. It has the following components:
 * - a task store
 * - an event store
 * - a bunch of operations that can be performed on these
 * - finally, all the schemas that will be used to validate the inputs to these operations
 * 
 * This orchestrator is operated upon by the api endpoints that are exposed to the client.
 * Think of it as the primary "Controller" for the application
*/

export const CreateTaskSchema = z.object({
    slug: z.string(),
    dependencies: z.array(TaskDependencySchema).min(0),
    name: z.optional(z.string()),
    isDefault: z.optional(z.boolean().default(false))
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const CreateMatterSchema = z.object({
    name: z.string().optional(),
    descr: z.string().optional(),
});

export type CreateMatterInput = z.infer<typeof CreateMatterSchema>;

/**
 * some custom errors that we'll need for this orchestrator 
*/
export class NotFoundError extends Error {
    constructor(message?: string){
        super (message ?? "object not found");
        this.name = "not_found";
    }
}

export class Orchestrator {
    private _tasks: TaskStore = new TaskStore();
    private _matters: EventStore = new EventStore();

    /**
     * will use the constructor to seed the task store with
     * the default tasks 
    */
    constructor(){
        seedWithDefaultTasks().map(task => {
            task.isDefault = true;
            this._tasks.add(task);
        });
    }
    
    /**
     * create a new task
     * @param actionType the type of action this task will perform
     * @param dependencies the dependencies for this task
     * @param isDefaultTask if this task should be associated with every matter by default
    */
    createTask({slug, dependencies, isDefault, name}: CreateTaskInput){

        // check if the listed dependencies are valid and actually exist 
        // in the current task store. A listed dependency "must" exist before
        // a task can be made dependent on it :P
        dependencies.map(({dependsOn}) => {
            if(!this._tasks.get(dependsOn)) {
                throw new Error(`dependency: ${dependsOn} does not exist. Create it before using it as a dependency`);   
            }
        });

        // create and add a new task
        this._tasks.add(new Task(
            slug,
            dependencies, 
            isDefault,
            name, 
        ));

        console.log(`[ORCH] -> created task ${slug} | ${name}`);
    }

    /**
     * update a dependency for a given task
     * @param slug slug of the task
     * @param newDep the dependency object being updated/created
     * @returns the updated Task
     */
    upsertDependencyToTask(slug: string, newDep: Dependency){
        const task = this.getTaskBySlug(slug);
        let depExists = false;

        // check if the dependency being assigned is the task itself
        // reject this --- no can do.
        if(newDep.dependsOn === slug) throw new Error("task cannot depend on itself");
        
        // scan the current dependencies to see if something
        // needs to be updated?
        for(let i = 0; i < task.dependencies.length; i++){
            const currDep = task.dependencies[i];
            if(currDep?.dependsOn === newDep.dependsOn){
                // yes, update this dep here!
                depExists = true;
                task.dependencies[i] = newDep;
                break;
            }
        }

        // this is a brand new dependency, needs to be 
        // added since it isn't already there
        if(!depExists){
            task.dependencies.push(newDep);
        }

        return task;
    }

    /**
     * delete a dependency from a task
     * @param slug slug for the Task
     * @param depToDel dependency to delete
     * @returns the updated state of the Task
     */
    deleteDependencyFromTask(slug: string, depToDel: Dependency){
        const task = this.getTaskBySlug(slug);
        let depExists = false;
        
        // check if the dependency being assigned is the task itself
        // reject this --- no can do.
        if(depToDel.dependsOn === slug) throw new Error("task cannot delete itself");

        // look for this dependency in the task, if you find it, delete it
        for(let i = 0; i < task.dependencies.length; i++){
            const currDep = task.dependencies[i];
            if(currDep?.dependsOn === depToDel.dependsOn){
                // found it, removing it and then cleanup
                depExists = true;
                delete task.dependencies[i];
                task.dependencies = task.dependencies.filter(Boolean);
                break;
            }
        }  

        if(!depExists) {
            throw new NotFoundError(`dependency: ${depToDel.dependsOn} was not found on this task`);
        }

        return task;
    }

    /**
     * find a Task in the store using its slug
     * @param slug the task to look for
     * @returns Task
     */
    getTaskBySlug(slug: string){
        const task = this._tasks.get(slug);
        if(!task) throw new NotFoundError(`task with ${slug} not found`);
        return task;
    }

    /**
     * get a list of all tasks in the task store 
    */
    get tasks(){
        const tasks = this._tasks.slugs;
        return tasks.map(slug => this._tasks.get(slug));
    }

    /**
     * create a matter entry in the event store
     * @param param {name, descr} for the matter to create 
     * @returns the id of the matter
    */
    createMatter({name, descr}: CreateMatterInput) {
        // mint a matter ID
        const id = mint("mtr");

        // create an event `type=CREATED` against this matter ID
        // in the event store
        this._matters.save(new Event(
            id,
            EventType.CREATED,
            { name: name ?? '', descr: descr ?? "" }
        ));

        //@todo:
        //attach default tasks to this matter 

        return id;
    }

    /**
     * get matter details by id
     * @param matterId uid of the matter
     * @returns a shortened version of the "matter" - created event basically
     */
    getMatterById(matterId: string){
        const eventsForMatter = this._matters.get(matterId);
        if(!eventsForMatter || eventsForMatter.length === 0) {
            throw new NotFoundError(`matter ${matterId} not found`);
        }
        
        assert(eventsForMatter[0]);
        assert(eventsForMatter[0].type === EventType.CREATED);

        const partial = {
            id: matterId,
            createdAt: eventsForMatter[0].createdAt,
            meta: eventsForMatter[0].meta
        };

        return {
            ...partial,
            events: eventsForMatter.slice(1)
        };
    }

    /**
     * get all the matters currently tracked in the event store
    */
    get matters(){
        const mattersIds = this._matters.ids;
        return mattersIds.flatMap(mId => this.getMatterById(mId));
    }
    
    /**
     * run a given task on the specified matter, checks task dependencies before 
     * executing. Tags the matter with an event representing the task run
     * @param matterId matter ID to run the task on
     * @param taskSlug the slug of the task to run
     * @returns Event representing the run (success / failure)
     */
    runTaskOnMatter(matterId: string, taskSlug: string){

        // a little utility to mock task execution.
        // in reality, this would be a different (async) action based on `taskSlug`
        const __mockExecute = (mockStatus = "") =>{ 
            console.log(`[TASK_EXEC] task ${taskSlug} running on ${matterId}...${mockStatus}`);
        }

        // a little helper to tag completions / failures on matters
        const tagMatterWithEvent = (eventType: EventType) => {
            __mockExecute(eventType === EventType.TASK_COMPLETED ? "Completed" : "Not Ready");
            const statusEvent = new Event(matterId, eventType, {}, taskSlug);
            this._matters.save(statusEvent);
            return statusEvent;
        }
        
        // get the matter, the task to run on this matter and also
        // get create a 'mapping of completed tasks and their timestamps'
        const matter = this.getMatterById(matterId);
        const taskToRun = this.getTaskBySlug(taskSlug);
        const mapTaskCompleteAndWhen: Record<string, Date> = {};
        
        // identify all the tasks that were 'completed' on this matter
        // save all this in the map of <task: lastTimeStampOfAction>
        matter.events
            .filter(e => e.type === EventType.TASK_COMPLETED)
            .map(e => {
                const { slug, createdAt } = e;
                if(slug) mapTaskCompleteAndWhen[slug] = createdAt;
            });
        
        
        // if the task to run has dependencies, first figure out if all those are met
        // if they aren't met, mark failure, else mark success
        if(taskToRun.dependencies.length > 0){

            // yuk, but its okay. Verbose dependency resolution logic here
            // this array `areDependenciesMet` will contain a boolean status
            // of every dependency to run this task
            const areDependenciesMet = taskToRun.dependencies.map(dep => {
                const {dependsOn, secondsElapsedSince} = dep;
                if(!(dependsOn in mapTaskCompleteAndWhen)) return false;
                if(!secondsElapsedSince) return true;
                const lastRunTimeStamp = (mapTaskCompleteAndWhen[dependsOn] as Date)?.getTime();
                const secondsSinceLastRun = (new Date().getTime() - lastRunTimeStamp) / 1000;
                return (secondsSinceLastRun >= secondsElapsedSince);
            });

            // if there is any `false` in this list, dependencies are not completely met
            // and the task execution should fail
            return tagMatterWithEvent(
                areDependenciesMet.includes(false) ? 
                    EventType.TASK_FAILED:
                    EventType.TASK_COMPLETED
            );
        }
        else {
            // no deps on this task, lets add an event to this matter for this task's completion
            return tagMatterWithEvent(EventType.TASK_COMPLETED);
        }
    }
}