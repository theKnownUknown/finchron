import axios from 'axios';
import dotenv from 'dotenv';
import { renderError } from '../components';
import { Task } from '../common';

dotenv.config();

// verify if the BASE_URL was set correctly
const baseUrl = process.env["BASE_URL"];
if(!baseUrl) throw new Error("BASE_URL must be defined in .env");

// common error handler
const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        const {message, cause, code, response} = error;
        renderError(`${message} (status code: ${code} | cause: ${cause})`);
        if(response?.data) console.table(response.data);
    } 
    else if(error instanceof Error) renderError(`⚠️ error: ${error?.message}`);
    else renderError(`⚠️ unknown error occurred: ${error}`);
    return undefined;
}

export async function getTasks() {
    try{
        return (await axios.get<Task[]>(`${baseUrl}/tasks`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

export async function createTask(task: Task) {
    try{
        return (await axios.post(`${baseUrl}/task`, task)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}