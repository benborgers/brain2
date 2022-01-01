// Lowercase letters, numbers, or hyphens, followed by
// something that is not that or the end of the string.
export const TAG_REGEX = /#([a-z0-9\-]+?)(?=[^a-z0-9\-]|$)/gm;
