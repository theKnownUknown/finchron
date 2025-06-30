import { Hono } from 'hono';
import { Orchestrator } from './orchestrator';
import { orchestrationMiddleware } from './router/extra';
import { routeGet_task, routeGet_tasks, routePost_task, routePut_task_dependency } from './router/routes/tasks';
import { applyRoutes } from './router';
import { serve } from '@hono/node-server';
import { routeGet_matter, routeGet_matters, routePost_matter, routePost_matter_runTask } from './router/routes/matters';

// create a simple hono web app
const app = new Hono();

const port = Number(process.env["PORT"]) || 3000;

// apply the orchestration middleware, this will dump the orchestrator
// into every execution context inside the route
app.use('*', orchestrationMiddleware(new Orchestrator()));

// define the application routes and apply those routes to
// this hono application
applyRoutes(app, [
  routePost_task,               // POST /task
  routeGet_tasks,               // GET  /tasks
  routeGet_task,                // GET  /tasks/:slug
  routePut_task_dependency,     // POST /tasks/:slug/dependency
  routePost_matter,             // POST /matter
  routeGet_matters,             // GET  /matters
  routeGet_matter,              // GET  /matters/:matterId
  routePost_matter_runTask,     // POST /matters/:matterId/run/:taskSlug
]);

// the hono app is ready, serve it on the specified port
serve({ fetch: app.fetch, port}, (info) => console.log(`🏁 Server is now running on port: ${info.port}`));
