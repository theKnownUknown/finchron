export type Task = {
    slug: string;
    dependencies: Array<{
        dependsOn: string, 
        secondsElapsedSince?: number
    }>;
};

/**
 * prompt config for the CLI
 * @description: this is used to exit the CLI when the user cancels a prompt
*/
export const promptConfig = { onCancel: () => process.exit(0) };