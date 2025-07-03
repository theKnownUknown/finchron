export type Task = {
    slug: string;
    dependencies: Array<{
        dependsOn: string, 
        secondsElapsedSince?: number
    }>;
};

export type Dependency = Task["dependencies"][number];

export type Matter = {
    id: string,
    createdAt: Date,
    meta: {name: string, descr: string},
    events: Array<any>
}

export type Event = {
    createdAt: Date,
    type: string,
    id: string,
    meta: Record<string, string>,
    slug: string
}

/**
 * prompt config for the CLI
 * @description: this is used to exit the CLI when the user cancels a prompt
*/
export const promptConfig = { onCancel: () => process.exit(0) };