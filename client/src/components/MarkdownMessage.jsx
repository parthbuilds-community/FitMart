import React from "react";
import { renderMarkdown } from "../utils/markdown";

const MarkdownMessage = ({ content }) => {
  return (
    <div
      className="fm-bot-content"
      dangerouslySetInnerHTML={{
        __html: renderMarkdown(content),
      }}
    />
  );
};

export default MarkdownMessage;