/**
 * all API endpoints that fall under "/matters" 
*/
import { Context } from "hono";
import { CustomRoute, ErrorResponse, errorToResponse } from "../extra";
import { CreateMatterInput, CreateMatterSchema, Orchestrator } from "../../orchestrator";

export const routePost_matter : CustomRoute = {
    method: "post",
    path: "/matter",
    schema: CreateMatterSchema,
    handler: async (c: Context) => {
        try {
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const body = await c.req.json();
            const parsed: CreateMatterInput = CreateMatterSchema.parse(body);
            const id = orchestrator.createMatter(parsed);
            return c.json({ id });
        } 
        catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routeGet_matters: CustomRoute = {
    method: "get",
    path: "/matters",
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const matters = orchestrator.matters;
            return c.json(matters)
        }
        catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routeGet_matter: CustomRoute = {
    method: "get",
    path: "/matters/:matterId",
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const matterId = c.req.param("matterId");
            return c.json(orchestrator.getMatterById(matterId));
        }
        catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}

export const routePost_matter_runTask: CustomRoute = {
    method: "post",
    path: "/matters/:matterId/run/:taskSlug",
    handler: async (c: Context) => {
        try{
            const orchestrator = c.get('orchestrator') as Orchestrator;
            const matterId = c.req.param("matterId");
            const taskSlug = c.req.param("taskSlug");
            return c.json(orchestrator.runTaskOnMatter(matterId, taskSlug));
        }
        catch(err: unknown){
            const {error, statusCode}: ErrorResponse = errorToResponse(err);
            return c.json({ error }, statusCode);
        }
    }
}