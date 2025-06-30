import { Task } from "../src/orchestrator/task";
import { TaskStore } from "../src/stores/task-store";
import { describe, test, expect } from "@jest/globals";

describe('Task Store Test', () => {
    const store = new TaskStore();

    // create the first task
    // no dependencies, and it is a 'default' task
    const t1 = new Task(
        "task-1",
        [], 
        true, 
    );

    // create the second task
    // depends on the first task, it is not a default task
    // dependency here is mocked (always met)
    const t2 = new Task(
        "task-2",
        [{dependsOn: t1.slug}],
    );

    test('add tasks', () => {
        store.add(t1); expect(store.count).toBe(1);
        store.add(t2); expect(store.count).toBe(2);
    });

    test('default tasks', () => {
        const defaultTasks = store.defaults();
        expect(defaultTasks.length).toBe(1);
        expect(defaultTasks[0]?.slug === t1.slug);
    });
});