import prompts, { PromptObject } from "prompts";
import { promptConfig } from "../common";
import { renderError } from "../components";
import { getMatterById, getTask, runTaskOnMatter } from "../requests";

export const runTaskScreen: PromptObject[] = [
    {
        type: 'text',
        name: 'slug',
        message: 'What is the slug of the task you want to run?',
    },
    {
        type: 'text',
        name: 'matterId',
        message: 'What is the ID of the matter?'
    }
]

export const runTaskScreen__route = async () => {
    const { slug, matterId } = await prompts(runTaskScreen, promptConfig);
    if(!await getTask(slug)) {
        renderError(`slug: ${slug} not found`);
        return;
    }

    if(!await getMatterById(matterId)){
        renderError(`matter with ID: ${matterId} not found`);
        return;
    }

    const resp = await runTaskOnMatter(matterId, slug);
    if(resp){
        const {type, createdAt} = resp;
        console.log(`Status: ${type} | CreatedAt: ${createdAt}`);
    }
}