import * as fs from "fs";
import path from "path";
import { stringify } from "yaml";
import { createPerformanceSwaggerFile } from "./performance";

const yaml = stringify(createPerformanceSwaggerFile(), {
  aliasDuplicateObjects: false,
});
const distFolder = path.join(import.meta.dirname, "../dist/swagger");

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder, { recursive: true });
}

fs.writeFileSync(path.join(distFolder, "performance.yaml"), yaml);
