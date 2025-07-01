import prompts, { PromptObject } from "prompts";
import { getTask } from "../requests";
import { promptConfig } from "../common";
import { renderError, renderTableOfTasks } from "../components";

export const getTaskScreen: PromptObject = {
    type: 'text',
    name: 'slug',
    message: 'What is the slug of the task?',
}

export const getTaskScreen__route = async () => {
    const { slug } = await prompts(getTaskScreen, promptConfig);
    if(!slug || slug.trim().length === 0) {
        renderError("invalid slug");
        return;
    }

    const taskDetails = await getTask(slug);
    if (taskDetails) renderTableOfTasks([taskDetails]);
}