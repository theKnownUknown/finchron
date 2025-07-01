import prompts, { PromptObject } from "prompts";
import { promptConfig } from "../common";
import { renderError, renderTableOfMatters } from "../components";
import { createMatter, getMatterById } from "../requests";

export const createMatterScreen: PromptObject = {
    type: 'text',
    name: 'name',
    message: 'Lets give this matter a name:',
}

export const createMatterScreen__route = async () => {
    const { name } = await prompts(createMatterScreen, promptConfig);
    if(!name || name.trim().length === 0) {
        renderError("invalid name");
        return;
    }

    const resp = await createMatter(name);
    if(resp && "id" in resp){
        const matter = await getMatterById(resp.id);
        if(matter) renderTableOfMatters([matter]);
    }
}