import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as path from "node:path";

export const filename = path.resolve(__filename);

export type FibonacciWorkerPayload = { value: number };

function fibonacci(n: number): number {
    if (n < 2) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// this could also not be async but must be awaited in app.ts
export async function execFibonacci(
    data: FibonacciWorkerPayload
): Promise<number> {
    const logger = new Logger(`fibonacci-worker ${randomUUID()}`);
    const res = fibonacci(data.value);
    logger.log(res);
    return res;
}
