import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// verify if the BASE_URL was set correctly
const baseUrl = process.env["BASE_URL"];
if(!baseUrl) throw new Error("BASE_URL must be defined in .env");

// custom types
export type Task = {
    slug: string;
    dependencies: Array<{dependsOn: string, secondsElapsedSince?: number}>;
};

// common error handler
const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const data = error.response?.data;
        console.table({ statusCode, data });
    } 
    else if(error instanceof Error){
        console.error("⚠️ error:", error?.message);
    }
    else {
        console.error("⚠️ unknown error occurred", error);
    }

    return undefined;
}

/**
 * display a table of tasks in the system 
*/
export async function getTasks() {
    try{
        return (await axios.get<Task[]>(`${baseUrl}/tasks`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

/**
 * create a task on the backend
 * @param task 
 */
export async function createTask(task: Task) {
    try{
        return (await axios.post(`${baseUrl}/task`, task)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}