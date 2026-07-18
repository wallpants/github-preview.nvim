// URL namespace under which the server serves local images.
// The browser rewrites image srcs to this prefix (via pantsdown config)
// and the server maps it back to filesystem paths relative to root.
export const IMAGE_PREFIX = "/__github_preview__/image/";
