import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export const renderMarkdown = (content) => {
  try {
    const html = marked.parse(content || "");
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "ul", "ol", "li", 
        "code", "pre", "blockquote", "hr", 
        "h1", "h2", "h3", "h4", "h5", "h6", "a"
      ],
      ALLOWED_ATTR: ["href", "target", "rel"]
    });
  } catch (error) {
    console.error("Markdown rendering failed:", error);
    return DOMPurify.sanitize(`<p>${String(content || "")}</p>`);
  }
};