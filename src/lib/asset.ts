/** Prefix a public/ path with the GitHub Pages base path. */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
