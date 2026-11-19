import Module from "node:module";
import path from "node:path";

/**
 * `shared/` lives outside `server/` and its domain schemas import `zod`
 * directly. Locally tsx honours the `zod` path mapping in `tsconfig.json`, but
 * the compiled serverless function runs on plain Node, which only looks for
 * `zod` in `shared/node_modules` and the repository root. Register the server's
 * own `node_modules` as a global lookup path so those imports also resolve in
 * the deployed bundle.
 *
 * This module must be imported before anything that pulls in `shared/`.
 */
const serverNodeModules = path.resolve(__dirname, "..", "node_modules");

const nodePath = [serverNodeModules, process.env.NODE_PATH]
  .filter(Boolean)
  .join(path.delimiter);

if (process.env.NODE_PATH !== nodePath) {
  process.env.NODE_PATH = nodePath;
  // `_initPaths` rebuilds Node's internal module search paths from NODE_PATH.
  // It is not part of the public typings, so reach it through a narrow cast.
  (Module as unknown as { _initPaths: () => void })._initPaths();
}
