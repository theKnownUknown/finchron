import { Matter, Task } from "../common";

export const renderTableOfTasks = (tasks: Task[] | undefined) => {
    if(!tasks) return;
    
    if(tasks.length === 0) {
        renderError(`No items found`);
        return;
    }
    
    // using console.table to render the tasks
    // might need a wide screen terminal to see the full table
    console.table(
        tasks.map((task) => ({
            ...task,
            dependencies: JSON.stringify(task.dependencies),
        }))
    );
}

export const renderTableOfMatters = (matters: Matter[] | undefined) => {
    if(!matters) return;
    
    if(matters.length === 0) {
        renderError("No items found");
        return;
    }

    // show matter details for just one matter
    if (matters.length === 1 && matters[0]){
        const {id, createdAt, meta, events} = matters[0];
        console.log("\n-----")
        console.log("Showing details for matter id:", id);
        console.log("-> created on:", createdAt);
        console.log("-> matter name:", meta?.name ?? "");
        console.log("-> Events:\n");
        console.table(events);
        return;
    }
    
    // showing details for several matters
    console.table(
        matters.map((matter) => {
            const {id, createdAt, meta} = matter;
            return {
                id,
                createdAt,
                name: meta?.name ?? ""
            };
        })
    )
}

export const renderError = (error: any) => {
    console.error(`\n⚠️  -> Error:`, error?.message || error);
}