import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

// Disable headings because we shouldn't have big headings in notecards.
md.disable(["heading"]);

const markdown = (input: string): string => {
  return md.render(input);
};

export default markdown;
