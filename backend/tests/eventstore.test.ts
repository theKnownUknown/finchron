import { Event, EventType } from "../src/orchestrator/event";
import { EventStore } from "../src/stores/event-store";
import { mint } from "../src/utils";
import { describe, test, expect } from "@jest/globals";

describe('Event Store Test', () => {

  const store = new EventStore();
  const eventIds: Array<string> = [];
  const MAX = 5;
  
  for(let i = 0; i < MAX; i++){
    const _id = mint("test");
    store.save(new Event(_id, EventType.CREATED))
    eventIds.push(_id);
  }

  const randomIndex = Math.min(Math.floor(Math.random() * 10), MAX - 1);
  const idAtRandomIndex: string = eventIds[randomIndex] as string;
  const eventsFor = store.get(idAtRandomIndex);
  if(!eventsFor) throw new Error("eventsFor not found");

  test('store has all the event IDs', () => {
    expect(store.count).toBe(MAX);
    expect(store.ids.join(";")).toBe(eventIds.join(";"))
  });
  test('created event should exist', () => {
    expect(eventsFor.length).toBeGreaterThan(0);
    expect(eventsFor.length === 1).toBe(true);
    expect(eventsFor[0] && eventsFor[0] instanceof Event).toBe(true);
    expect(eventsFor[0] && eventsFor[0]?.id === idAtRandomIndex).toBe(true);
    expect(eventsFor[0] && eventsFor[0]?.type === EventType.CREATED);
  });

  test('invalid event should not exist', () => {
    const invalidId = mint("rnd");
    expect(Object.hasOwn(store, invalidId)).toBe(false);
  })
}); 