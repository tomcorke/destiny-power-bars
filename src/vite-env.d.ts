/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "~build/git" {
  export const sha: string;
}

declare module "~build/time" {
  export default string;
}
