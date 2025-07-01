import axios from 'axios';
import dotenv from 'dotenv';
import { renderError } from '../components';
import { Dependency, Event, Matter, Task } from '../common';

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
        return (await axiosClient.post<{success: string}>(`/task`, task)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// PUT /task/:slug/dependency
export async function upsertDependency(slug: string, dep: Dependency) {
    try{
        return (await axiosClient.put<Task>(`/tasks/${slug}/dependency`, dep)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// POST /matter
export async function createMatter(name: string){
    try{
        return (await axiosClient.post<{id: string}>(`/matter`, {name})).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// GET /matters
export async function getMatters(){
    try{
        return (await axiosClient.get<Matter[]>(`/matters`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// GET /matter/:matterId
export async function getMatterById(matterId: string){
    try{
        return (await axiosClient.get<Matter>(`/matters/${matterId}`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}

// POST /matters/:matterId/run/:slug
export async function runTaskOnMatter(matterId: string, slug: string){
    try{
        return (await axiosClient.post<Event>(`/matters/${matterId}/run/${slug}`)).data;
    } catch(error: unknown){
        return handleError(error);
    }
}