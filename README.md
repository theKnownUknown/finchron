# Getting Started
## Watch the loom
[![loom video here]](https://www.loom.com/share/643df2f670824c96a20b0dbd4aabf0cb?sid=643aea4a-a73e-4110-8b85-fca6d0474f63)

## Pre-requisites
Install node v22.13.0 or higher

## Getting Started
The project contains two folders:
- backend
- cli

Open two terminals, one to run each of the entities above

---

### Terminal #1 - Setting up and running the backend
```sh
$ cd backend

# install dependencies
[backend]$ npm install

----

# run tests
[backend]$ npm run tests

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        16.034 s, estimated 17 s

----

# build & run the server 
[backend]$ npm run build && npm run start

> finchron@1.0.0 start
> node dist/index.js

[ROUTER] -> adding route: post  /task
[ROUTER] -> adding route: get   /tasks
[ROUTER] -> adding route: get   /tasks/:slug
[ROUTER] -> adding route: put   /tasks/:slug/dependency
[ROUTER] -> adding route: post  /matter
[ROUTER] -> adding route: get   /matters
[ROUTER] -> adding route: get   /matters/:matterId
[ROUTER] -> adding route: post  /matters/:matterId/run/:taskSlug
🏁 Server is now running on port: 3000
```

** A postman collection has been provided in the `./backend` folder as well to play around with the server

---

### Terminal #2 - Setting up and running the cli

```sh
$ cd cli

---

# install dependencies
[cli]$ npm install

---

# run the cli
[cli]$ npm run dev

--------------------
? What would you like to do? › - Use arrow-keys. Return to submit.
❯   Create a new task
    View all tasks
    View a specific task
    Update/Add a dependency for a task
    Create a new matter
    View all matters
    View audit trail for a matter
    Run a task on a matter
    Quit
```

# Overview

## Stack
Typescript... yeah, that's it.
- on the backend, I'm using `honoJs` as a lightweight api server
- on the cli, I'm using `promptsJs` to build the cli

## Caveat
The backend code is mostly focused on implementing the core abstractions. For simplicity, I'm using in-memory storage. If I was building an actual system, those abstractions would be implemented over a real db (e.g. DynamoDB). So this _will not_ scale, but that's not the point of this project.

## Backend

Consists of the following pieces:
- api server
    - `./backend/src/index.ts` -> main entrypoint
    - `./backend/src/router/*` -> api endpoints and router logic
    - all the endpoints do is provide a web API over the orchestrator

- orchestrator
    - `./backend/src/orchestrator/index.ts` -> entrypoint 
    - this is the main controller where all the logic to create tasks and matters and run tasks on matters resides
    - the orchestrator implements two stores, one to manage tasks and another to manage matters

- stores
    - `./backend/src/stores/event-store.ts` -> event store abstraction
    - `./backend/src/stores/task-store.ts` -> task store
    - `EventStore` implements the event sourcing pattern to express matters. Each matter is a series of events in time against a `matterId`
    - `TaskStore` impements a more relational mapping of tasks as objects. Each tag is uniquely identified by a `slug`. They also include `dependencies` 
    - task executions are 'simulated' through a `__mockExecute(..)` in the orchestrator, but in reality, I would propose that each task maps its `slug` to a specific `Action`. For now, the mock will do.

### How does data from through the backend?

Client makes REST API calls -> API server -> Orchestrator -> Task or Event Store -> saves task / event objects

### Are there tests?

Yes, in `./backend` run:
```sh
npm install
npm run test:watch
```

(this runs the tests in `--watch` mode, and spits out all the logs)

You can find the tests at `./backend/tests/`. These test:
- the `EventStore`
- the `TaskStore`
- the `Orchestrator` ---> this is the meat and potatoes!!

All the core logic around creating matters and tasks, managing dependencies and running specific tasks on matters is included in the `orchestrator.test.ts` file.

## CLI

This tool is built in Typescript using `promptsJs` as the interface driver for the CLI

### Organization
- The main entrypoint is `./cli/src/index.ts` --> this renders the first screen
- All the other screens (that branch out from the main screen) are stored in `./cli/src/screens`
- Just like any UI, the screens use `components` to render individual pieces of info
    - these are managed in `./cli/src/components/index.ts`
    - the current crop of components basically render tables of data or errors
- The CLI uses REST to access the backend. All the client side requests are stored in `./cli/src/requests`

### Event loop
Since this is a cli, we've simulated an event loop in `./cli/src/index.ts` using a `do{...}while(true);`. Kinda basic, but gets the job done

### Running the tool
```sh
$ cd cli
[cli]$ npm install
[cli]$ npm run dev

-----
? What would you like to do? › - Use arrow-keys. Return to submit.
❯   Create a new task
    View all tasks
    View a specific task
    Update/Add a dependency for a task
    Create a new matter
    View all matters
    View audit trail for a matter
    Run a task on a matter
    Quit
```

The tool begins with a list of all available task on the main screen. You can use arrow keys to navigate. It will prompt you from time to time to gather inputs

