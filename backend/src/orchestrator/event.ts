export enum EventType {
    CREATED = "CREATED",
    TASK_FAILED = "TASK_FAILED",
    TASK_COMPLETED = "TASK_COMPLETED"
};


export class Event {
    public readonly createdAt = new Date();
    public readonly type: EventType;
    public readonly id: string;
    public readonly meta: Record<string, string> | undefined;
    public readonly slug: string | undefined;

    constructor(
        id: string,
        type: EventType,
        meta?: Record<string, string>,
        slug?: string,
    ) {
        this.id = id;
        this.type = type;
        this.slug = slug;
        this.meta = meta;
    }

}