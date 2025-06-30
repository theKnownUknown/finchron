import { Task } from "./task";

const MAX_DELAY_SECONDS = 5;

/**
 * Seeder script to preload default tasks. Simply returning the list of default tasks here
 * the actual adding of these tasks to whatever store must be done externally
 * @returns an Array<Task> with dependencies
 */
export const seedWithDefaultTasks = () => [
    // intake call task: no deps
    new Task(
        "task-intake-call",
        [],
    ),

    // sign engagement letter: depends on intake call
    new Task(
        "task-sign-eng-letter",
        [{dependsOn: "task-intake-call"}],
    ),

    // collect medical record: depends on sign eng. letter task
    new Task(
        "task-collect-med-rec",
        [{dependsOn: "task-sign-eng-letter"}],
    ),

    // client check in: depends on intake call, but with some time elapsed since
    // time elapsed should be 2 weeks, but we don't have that kind of time
    // setting that to 5 seconds for testing
    new Task(
        "task-client-checkin",
        [{dependsOn: "task-intake-call", secondsElapsedSince: MAX_DELAY_SECONDS}],
    ),

    // create demand: depends on collect medical being complete
    new Task(
        "task-create-demand",
        [{dependsOn: "task-collect-med-rec"}],
    ),
]