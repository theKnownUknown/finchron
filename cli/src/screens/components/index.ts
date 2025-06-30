import { Task } from "../../requests";

export const renderTableOfTasks = (tasks: Task[] | undefined) => {
    tasks = (!tasks || tasks.length === 0) ? [{slug: "No tasks found", dependencies: []}] : tasks;
    
    console.table(
        tasks.map((task: { dependencies: any; }) => ({
            ...task,
            dependencies: JSON.stringify(task.dependencies),
        }))
    );
}

export const renderError = (error: any) => {
    console.error(`⚠️  -> Error: ${error?.message || error}`);
}