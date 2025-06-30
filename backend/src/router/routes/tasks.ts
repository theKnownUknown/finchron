/**
 * all API endpoints and method that fall under "/tasks" 
*/
import { Context } from "hono";
import { CustomRoute, ErrorResponse, errorToResponse } from "../extra";
import { CreateTaskInput, CreateTaskSchema, Orchestrator } from "../../orchestrator";
import { Dependency, TaskDependencySchema } from "../../orchestrator/task";

export const routePost_task : CustomRoute = {
    method: "post",
    path: "/task",
    schema: CreateTaskSchema,
    handler: async (c: Context) => {
        try {
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const body = await c.req.json();
            const parsed: CreateTaskInput = CreateTaskSchema.parse(body);
            orchestrator.createTask(parsed);
            return c.json({success: "ok"});
        } 
        catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routeGet_tasks: CustomRoute = {
    method: "get",
    path: "/tasks",
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const currentTasksInSystem = orchestrator.tasks;
            return c.json(currentTasksInSystem);
        } catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routeGet_task: CustomRoute = {
    method: "get",
    path: "/tasks/:slug",
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const slug = c.req.param('slug');
            return c.json(orchestrator.getTaskBySlug(slug));
        } catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routePut_task_dependency: CustomRoute = {
    method: "put",
    path: "/tasks/:slug/dependency",
    schema: TaskDependencySchema,
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const slug = c.req.param('slug');
            const body = await c.req.json();
            const parsed = TaskDependencySchema.parse(body) as Dependency;
            const updatedTask = orchestrator.upsertDependencyToTask(slug, parsed);
            return c.json(updatedTask);
            
        } catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routeDel_task_dependency: CustomRoute = {
    method: "delete",
    path: "/tasks/:slug/dependency",
    schema: TaskDependencySchema,
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const slug = c.req.param('slug');
            const body = await c.req.json();
            const parsed = TaskDependencySchema.parse(body) as Dependency;
            const updatedTask = orchestrator.deleteDependencyFromTask(slug, parsed);
            return c.json(updatedTask);
            
        } catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}