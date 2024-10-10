import { rmSync } from "fs";

const dir = "./src/models";

rmSync(dir, { recursive: true, force: true });
