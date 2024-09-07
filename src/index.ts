import * as esbuild from "esbuild";
import buildPlugin from "./plugin.js";
import { program } from "commander";

async function main() {
    program
        .usage("[options] <module>")
        .requiredOption("-o, --output <file>", "write output to <file>")
        .option("-w, --watch", "watch for changes and recompile")
        .option("-S, --no-source-maps", "omit source-maps")
        .option("-c, --compress", "minify output script");
    program.parse();

    const opts = program.opts();
    const entrypoint: string = program.args[0];
    const outputPath: string = opts.output;

    const esbuildOptions: esbuild.BuildOptions = {
        entryPoints: [entrypoint],
        bundle: true,
        outfile: outputPath,
        plugins: [buildPlugin()]
    };
    if (opts.sourceMaps) Object.defineProperty(esbuildOptions, "sourcemap", { value: "inline" });
    if (opts.compress) Object.defineProperty(esbuildOptions, "minify", { value: true });
    if (opts.watch) {
        const ctx = await esbuild.context(esbuildOptions);
        console.log(`Watching for ${entrypoint} changes...`);
        await ctx.watch();
    } else await esbuild.build(esbuildOptions);
}

try {
    await main();
} catch (e) {
    console.error(e);
    process.exitCode = 1;
}
