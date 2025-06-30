import { Hono } from "hono";
import { trimSlashes } from "../utils";
import { CustomRoute } from "./extra";

/**
 * Apply the specified CustomRoutes to the Hono application 
 * @param app the hono app
 * @param routes a list of CustomRoute objects
*/
export const applyRoutes = (app: Hono, routes: Array<CustomRoute>) => {
    routes.map(r => {
        const { method, path, handler } = r;
        const route = `/${trimSlashes(path)}`;
        app[method](route, handler);
        console.log(`[ROUTER] -> adding route: ${method} \t${route}`);
    });
}