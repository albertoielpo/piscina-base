import { Logger } from "@nestjs/common";
import { resolve } from "node:path";
import { Piscina } from "piscina";
import { Json2YamlWorkerPayload, filename } from "./json2yaml.worker";

export default class Json2YamlService {
    private readonly logger = new Logger(Json2YamlService.name);
    private readonly piscina = new Piscina<Json2YamlWorkerPayload, string>({
        filename: resolve(
            process.cwd(),
            "resources",
            "workers",
            "worker-wrapper.js"
        ),
        workerData: { fullpath: filename }
    });

    public convert(json: Json2YamlWorkerPayload) {
        // printMemUsage(this.logger);
        return this.piscina.run(json, { name: "convert" });
    }
}
