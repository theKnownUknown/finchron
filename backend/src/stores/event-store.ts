import { Event } from "../orchestrator/event";

export class EventStore{
    private store: Record<string, Array<Event>> = {}

    save(event: Event) {
        const id = event.id;
        if(!this.store[id]) this.store[id] = [];
        this.store[id].push(event);
    }

    get count(){
        return (Object.keys(this.store).length);
    }
    
    get(id: string) {
        return this.store[id] || null;
    }

    get ids() {
       return Object.keys(this.store); 
    }
}