import * as esbuild from "esbuild";
import { join } from "node:path";
import { cwd } from "node:process";
import { existsSync } from "node:fs";

const SHIMS = [
    "assert",
    "base64-js",
    "buffer",
    "crypto",
    "diagnostics_channel",
    "events",
    "fs",
    "http",
    "https",
    "http-parser-js",
    "ieee754",
    "net",
    "os",
    "path",
    "process",
    "punycode",
    "querystring",
    "readable-stream",
    "stream",
    "string_decoder",
    "timers",
    "tty",
    "url",
    "util",
    "vm"
];

function determineShimsDir() {
    const projectShims = join(cwd(), "node_modules");
    if (existsSync(join(projectShims, "@frida"))) return projectShims;

    const compilerShims = join(import.meta.url, "node_modules");
    if (existsSync(join(compilerShims, "@frida"))) return compilerShims;

    throw new Error("Unable to locate shims");
}

export default function buildPlugin(): esbuild.Plugin {
    const dir = determineShimsDir();

    return {
        name: "shims-resolver",
        setup(build: esbuild.PluginBuild) {
            for (const module of SHIMS) {
                build.onResolve({ filter: new RegExp(`^${module}$`) }, async () => {
                    const result = await build.resolve(`@frida/${module}`, {
                        kind: "import-statement",
                        resolveDir: dir
                    });
                    if (result.errors.length > 0) return { errors: result.errors };

                    return { path: result.path };
                });
            }
        }
    };
}
