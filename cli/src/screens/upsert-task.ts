import prompts, { PromptObject } from "prompts"
import { getTaskScreen } from "./get-task"
import { renderError, renderTableOfTasks } from "../components";
import { upsertDependency } from "../requests";
import { promptConfig } from "../common";

const upsertDependencyScreen: PromptObject[] = [
    {
        type: 'text',
        name: 'dependsOn',
        message: 'What is the name of the dependency?',
        initial: "some-new-dependency",
    },
    {
        type: 'number',
        name: 'secondsElapsedSince',
        message: 'How many seconds do you want to wait for?',
        initial: 0,
    }
]

export const upsertTaskScreen__route = async () => {
    const { slug } = await prompts(getTaskScreen, promptConfig);
    if(!slug || slug.trim().length === 0) {
        renderError("invalid slug");
        return;
    }

    const {
        dependsOn, 
        secondsElapsedSince
    } = await prompts(upsertDependencyScreen, promptConfig);

    const updatedTask = await upsertDependency(slug, {dependsOn, secondsElapsedSince});
    if(updatedTask) renderTableOfTasks([updatedTask]);

}