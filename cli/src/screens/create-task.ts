import prompts, { PromptObject } from 'prompts';
import { getTasks, createTask} from '../requests';
import { Task } from '../common';
import { renderError, renderTableOfTasks } from '../components';
import { promptConfig } from '../common';


const createTaskScreen: PromptObject[] = [
    {
        type: 'text',
        name: 'slug',
        message: 'What is the task slug? (e.g. some-new-task)',
        initial: "some-new-task",
    },
    {
        type: 'text',
        name: 'dependsOn',
        message: 'Which task does it depend on? (enter that task slug or leave blank)',
        initial: "",
    },
    {
        type: 'number',
        name: 'secondsElapsedSince',
        message: 'How many seconds do you want to wait for?',
        initial: 0,
    }
]


export const createTaskScreen__route = async () => {
    const tasks = await getTasks();

    // read slug and validate it
    const { slug } = await prompts(createTaskScreen[0] as PromptObject, promptConfig);
    if(!slug || slug.trim().length === 0) {
        renderError("invalid slug");
        return;
    }

    // if slug entered is already in the system, throw an error
    if(tasks && tasks.find((task: Task) => task.slug === slug)) {
        renderError("task already exists");
        return;
    }

    // handle the other prompts in this screen
    const { dependsOn, secondsElapsedSince } = await prompts(createTaskScreen.slice(1), promptConfig);
    const dependencies = [];
    if (dependsOn && dependsOn.trim().length > 0){
        dependencies.push(secondsElapsedSince ? {dependsOn, secondsElapsedSince}: {dependsOn})
    }    
    
    // create task
    const createdTask = await createTask({
        slug,
        dependencies
    })

    if(createdTask) {
        console.log("task created");
        renderTableOfTasks(await getTasks());
    }
}