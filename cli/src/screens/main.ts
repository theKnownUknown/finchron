import prompts, { PromptObject } from 'prompts';
import { getMatters, getTasks } from '../requests';
import { createTaskScreen__route } from './create-task';
import { renderTableOfMatters, renderTableOfTasks } from '../components';
import { promptConfig } from '../common';
import { getTaskScreen__route } from './get-task';
import { upsertTaskScreen__route } from './upsert-task';
import { createMatterScreen__route } from './create-matter';
import { getMatterScreen__route } from './get-matter';
import { runTaskScreen__route } from './run-task';

const mainScreen: PromptObject = {
    type: 'select',
    name: 'mainScreen__action',
    message: 'What would you like to do?',
    choices: [
      { title: 'Create a new task', value: 'create_task' },
      { title: 'View all tasks', value: 'get_tasks' },
      { title: 'View a specific task', value: 'get_task'},
      { title: 'Update/Add a dependency for a task', value: 'upsert_task'},
      { title: 'Create a new matter', value: 'create_matter'},
      { title: 'View all matters', value: 'get_matters'},
      { title: 'View audit trail for a matter', value: 'get_matter'},
      { title: 'Run a task on a matter', value: 'run_task'},
      { title: 'Quit', value: 'exit'}
    ]
};

export const mainScreen__route = async () => {
    const response = await prompts(mainScreen, promptConfig);
    
    switch(response["mainScreen__action"]){
        case "get_tasks": 
            renderTableOfTasks(await getTasks());
            break;

        case "get_task":
            await getTaskScreen__route();
            break;

        case "create_task":
            await createTaskScreen__route();
            break;

        case "upsert_task":
            await upsertTaskScreen__route();
            break;

        case "get_matters":
            renderTableOfMatters(await getMatters());
            break;

        case "create_matter":
            await createMatterScreen__route();
            break;

        case "get_matter":
            await getMatterScreen__route();
            break;

        case "run_task":
            await runTaskScreen__route();
            break;

        case "exit": 
            process.exit(1);
            break;
    }
}
