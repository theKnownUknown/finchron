import axios from 'axios';
import dotenv from 'dotenv';
import { renderError } from '../components';
import { Task } from '../common';

dotenv.config();

// verify if the BASE_URL was set correctly
const baseUrl = process.env["BASE_URL"];
if(!baseUrl) throw new Error("BASE_URL must be defined in .env");

// create an axios client
export const axiosClient = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

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

// GET /tasks
export async function getTasks() {
    try{
        return (await axiosClient.get<Task[]>(`/tasks`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// GET /tasks/:slug
export async function getTask(slug: string){
    try{
        return (await axiosClient.get<Task>(`/tasks/${slug}`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// POST /task
export async function createTask(task: Task) {
    try{
        return (await axiosClient.post(`/task`, task)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}