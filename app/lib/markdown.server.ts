import { TAG_REGEX } from "~/constants";
import katex from "katex";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

// Disable headings because we shouldn't have big headings in notecards.
md.disable(["heading"]);

const markdown = (input: string): string => {
  return md
    .render(input)
    .replace(TAG_REGEX, '<span data-tag="$1">#$1</span>')
    .replace(/\$\$(.+?)\$\$/g, (_, equation) => {
      return katex.renderToString(equation, {
        throwOnError: false,
        displayMode: true,
      });
    })
    .replace(/\$(.+?)\$/g, (_, equation) => {
      return katex.renderToString(equation, {
        throwOnError: false,
        displayMode: false,
      });
    });
};

export default markdown;
