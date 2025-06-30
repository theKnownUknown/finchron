import {z} from "zod";

/**
 * A task can trigger an action and consequently depends on other tasks for its own
 * execution. Here's the schema we'll use to track dependencies. 
 * 
 * - a task generally depends on another task
 * - it may additionally need to check on how long ago that task was executed
*/
export const TaskDependencySchema = z.object({
    dependsOn: z.string(),
    secondsElapsedSince: z.optional(z.number())
});

export type Dependency = z.infer<typeof TaskDependencySchema>;


/**
 * This is the Task class. A task can be uniquely identified by its slug
*/
export class Task {
    public readonly createdAt = new Date();
    public readonly slug: string;
    public readonly name?: string;
    public dependencies: Array<Dependency>;
    public isDefault: boolean;
    
    constructor(
        slug: string,
        dependencies: Array<Dependency>, 
        isDefault?: boolean,
        name?: string,
    ) {
        // some checks
        // - the task should not be dependent on itself
        dependencies.map(({dependsOn}) => {
            if(dependsOn === slug) throw new Error(`task cannot depend on itself`);
        });

        // assign the task properties
        this.slug = slug;
        this.dependencies = dependencies;
        this.isDefault = isDefault ?? false;
        this.name = name ?? "";
    }
}
