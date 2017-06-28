import path from "path";

export function formatLocation(cwd, obj) {
  return path.relative(cwd, obj.uri) + ":" + obj.line;
}
