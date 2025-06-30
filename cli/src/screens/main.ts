import prompts, { PromptObject } from 'prompts';
import { getTasks } from '../requests';
import { createTaskScreen__route } from './create-task';
import { renderTableOfTasks } from './components';

const mainScreen: PromptObject = {
    type: 'select',
    name: 'mainScreen__action',
    message: 'What would you like to do?',
    choices: [
      { title: 'View all tasks', value: "get_tasks" },
      { title: 'Create a new task', value: 'create_task' },
      { title: 'Quit', value: 'exit'}
    ]
};

export const mainScreen__route = async () => {
    const response = await prompts(mainScreen);
    switch(response["mainScreen__action"]){
        case "get_tasks": 
            renderTableOfTasks(await getTasks());
            break;

        case "create_task":
            await createTaskScreen__route();
            break;

        case "exit": 
            process.exit(1);
            break;
    }
}
