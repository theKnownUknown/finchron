import { randomUUID } from "crypto";

export const mint = (prefix: string) => `${prefix}-${randomUUID().split("-")[0]}-${randomUUID().split("-")[0]}`;
export const trimSlashes = (input: string) => input.replace(/^\/+|\/+$/g, '');

export const delay = (millis = 100) => new Promise((resolve) => {
    setTimeout(resolve, millis);
});

export const deepClone = <T>(obj: any) => JSON.parse(JSON.stringify(obj)) as T;