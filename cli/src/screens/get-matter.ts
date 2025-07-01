import prompts, { PromptObject } from "prompts";
import { getMatterById } from "../requests";
import { promptConfig } from "../common";
import { renderError, renderTableOfMatters } from "../components";

export const getMatterScreen: PromptObject = {
    type: 'text',
    name: 'matterId',
    message: 'Enter the ID of the matter:',
}

export const getMatterScreen__route = async () => {
    const { matterId } = await prompts(getMatterScreen, promptConfig);
    if(!matterId || matterId.trim().length === 0) {
        renderError("invalid ID");
        return;
    }

    const matterDetails = await getMatterById(matterId);
    if (matterDetails) renderTableOfMatters([matterDetails]);
}