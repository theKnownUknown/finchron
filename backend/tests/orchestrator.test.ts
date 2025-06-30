import assert from "assert";
import { Orchestrator } from "../src/orchestrator";
import { describe, test, expect } from "@jest/globals";
import { EventType } from "../src/orchestrator/event";
import { delay } from "../src/utils";
import { Task } from "../src/orchestrator/task";

const DEFAULT_TIMEOUT = 10 * 1000;
const DEP_TIME_SEC = 5;

describe('Event Store Test', () => {
    const orch = new Orchestrator();

    // the orchestrator should come preloaded with some default tasks
    // these are pre-seeded. There should be at least 1 default task
    test('has default tasks configured', () => {
        assert(orch.tasks)
        expect(orch.tasks.filter(t => t?.isDefault).length).toBeGreaterThan(1)
    });

    // create a matter, it should have no events to start
    // note: even though matter creation is an event, it is clipped
    // when using `getMatterById` (reducing the effective len to 0)
    const MATTER_NAME = "test-matter";
    const matterId = orch.createMatter({ name: MATTER_NAME });

    test('matter was created correctly', () => {
        const matter =  orch.getMatterById(matterId);
        expect(matter.meta && matter.meta["name"] === MATTER_NAME);
        expect(matter.events.length).toBe(0);
    });

    // find the intake call task
    const intakeTask = (orch.tasks.filter(t => t?.slug === "task-intake-call"))[0];
    assert(intakeTask);
    expect(intakeTask.dependencies.length).toBe(0);

    // then get the check-in task
    const checkinTask = (orch.tasks.filter(t => t?.slug === "task-client-checkin"))[0];
    assert(checkinTask);
    expect(checkinTask.dependencies.length).toBe(1);
    expect(checkinTask.dependencies[0] && checkinTask.dependencies[0].dependsOn === intakeTask.slug);
    expect(checkinTask.dependencies[0] && checkinTask.dependencies[0].secondsElapsedSince).toBeGreaterThan(0);

    test('run checkin before intake, should fail', () => {
        const { type } = orch.runTaskOnMatter(matterId, checkinTask.slug);
        expect(type === EventType.TASK_FAILED);
    })

    test('run intake task, should pass', () => {
        const { type } = orch.runTaskOnMatter(matterId, intakeTask.slug);
        expect(type === EventType.TASK_COMPLETED);
    })

    test('run checkin task a while after intake', async () => {
        // gotta wait to run this task... let's do that
        const millis = (checkinTask.dependencies[0]?.secondsElapsedSince as number) * 1000;
        console.log(`waiting for ${millis} ms`);
        await delay(millis);
        
        // now run the task, it should succeed
        const { type } = orch.runTaskOnMatter(matterId, checkinTask.slug);
        expect(type === EventType.TASK_COMPLETED);
    }, DEFAULT_TIMEOUT);


    // create a new task with dependency (time-based) on checkin task
    // run it immediately, should fail
    // wait for a bit
    // run it after, should pass
    const newTask = new Task(
        "new-task-slug", 
        [{dependsOn: checkinTask.slug, secondsElapsedSince: DEP_TIME_SEC}]
    );

    orch.createTask({
        slug: newTask.slug,
        dependencies: newTask.dependencies,
        isDefault: false,
        name: "a new task"
    });
    
    test('run new task', async () => {
        expect(orch.runTaskOnMatter(matterId, newTask.slug).type === EventType.TASK_FAILED);
        await delay(DEP_TIME_SEC * 1000);
        expect(orch.runTaskOnMatter(matterId, newTask.slug).type === EventType.TASK_COMPLETED);
    }, DEFAULT_TIMEOUT);

    // update dependency on an existing task, with a new task
    // test running it
    orch.upsertDependencyToTask(checkinTask.slug, {dependsOn: newTask.slug, secondsElapsedSince: DEP_TIME_SEC});

    test('introduce dependency in old task', async () => {
        expect(orch.runTaskOnMatter(matterId, checkinTask.slug).type === EventType.TASK_FAILED);
        await delay(DEP_TIME_SEC * 1000);
        expect(orch.runTaskOnMatter(matterId, checkinTask.slug).type === EventType.TASK_COMPLETED);
    }, DEFAULT_TIMEOUT);
}); 