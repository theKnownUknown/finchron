import { Task } from "../common";

export const renderTableOfTasks = (tasks: Task[] | undefined) => {
    // nothing to render here, just return
    if(!tasks || tasks.length === 0) return;
    
    // using console.table to render the tasks
    // might need a wide screen terminal to see the full table
    console.table(
        tasks.map((task: { dependencies: any; }) => ({
            ...task,
            dependencies: JSON.stringify(task.dependencies),
        }))
    );
}

export const renderError = (error: any) => {
    console.error(`\n⚠️  -> Error:`, error?.message || error);
}