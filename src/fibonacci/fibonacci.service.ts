import { resolve } from "node:path";
import { Piscina } from "piscina";
import { FibonacciWorkerPayload, filename } from "./fibonacci.worker";

export default class FibonacciService {
    private readonly piscina = new Piscina<FibonacciWorkerPayload, string>({
        filename: resolve(
            process.cwd(),
            "resources",
            "workers",
            "worker-wrapper.js"
        ),
        workerData: { fullpath: filename }
    });

    public fibonacci(value: number) {
        return this.piscina.run({ value }, { name: "execFibonacci" });
    }
}
