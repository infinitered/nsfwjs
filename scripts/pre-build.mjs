import { rmSync } from "fs";

const dir = "./dist";

rmSync(dir, { recursive: true, force: true });
