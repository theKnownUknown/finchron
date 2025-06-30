import { Task } from "../orchestrator/task";


export class TaskStore {
    private store: Record<string, Task> = {}

    add(t: Task){
        if(this.store[t.slug]) throw new Error(`task: ${t.slug} already exists`);
        this.store[t.slug] = t;
    }

    get count(){
        return (Object.keys(this.store).length);
    }

    get(slug: string){
        return this.store[slug] || null;
    }

    defaults(){
        return Object.values(this.store).filter(task => task.isDefault);
    }

    get slugs(){
        return Object.keys(this.store);
    }

}