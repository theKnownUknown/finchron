/**
 * This module contains 'extras' (i didn't know where else to put these) that assist
 * in managing routes for the hono web app. 
*/
import { Context } from "hono";
import { NotFoundError, Orchestrator } from "../orchestrator";
import { MiddlewareHandler } from "hono";
import { ZodError, ZodType } from "zod";

/**
 * update this middleware if you wanna squeeze stuff into the 
 * application context for easy access within the endpoints 
*/
export const orchestrationMiddleware = (orchestrator: Orchestrator): MiddlewareHandler => {
    return async (c, next) => {
        c.set('orchestrator', orchestrator);
        await next();
    }
}

/**
 * a simple route / endpoint abstraction for our router 
*/
export type CustomRoute = {
    method: "get" | "post" | "put" | "delete",
    path: string,
    schema?: ZodType,
    handler: (c: Context) => Promise<any>
};

/**
 * the supported error codes for relaying errors back over HTTP
 * update this list as you need to use more 
*/
export enum HTTPStatusCodes {
    SYSTEM_ERR = 500,
    BAD_REQ = 400,
    NOT_FOUND = 404
};

/**
 * custom error handling response object
 * all the errors raised or thrown by code paths in the app
 * can be reduced to a simple error response that is good for
 * conveying http errors 
*/
export type ErrorResponse = {
    error: unknown,
    statusCode: HTTPStatusCodes
};

/**
 * helper to manage error handling for our routes
 * @param err error object as thrown 
 * @returns ErrorResponse that can be sent back
 */
export const errorToResponse = (err: unknown) : ErrorResponse => {

    // for the stacktrace
    console.error(`⚠️ An error has occurred.`, err);
    
    // handle schema validation errors
    if(err instanceof ZodError){
        return {
            error: err?.message ?? "schema_validation_error",
            statusCode: HTTPStatusCodes.BAD_REQ
        }
    }

    // some resource was not found
    if(err instanceof NotFoundError){
        return {
            error: err?.message ?? "resource_not_found",
            statusCode: HTTPStatusCodes.NOT_FOUND
        }
    }

    if (err instanceof Error){
        return {
            error: err?.message ?? "unexpected_error",
            statusCode: HTTPStatusCodes.SYSTEM_ERR
        }
    }

    return {
        error: (
            err && 
            typeof err === "object" && 
            err !== null && 
            "message" in err
        ) ? (err as any).message : "unknown_error",
        statusCode: HTTPStatusCodes.SYSTEM_ERR
    };
}