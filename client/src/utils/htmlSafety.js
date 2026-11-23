import DOMPurify from "dompurify";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sanitizeInvoiceHtml(invoiceHtml) {
  return DOMPurify.sanitize(invoiceHtml, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["html", "head", "body", "title", "style", "meta"],
    ADD_ATTR: ["style", "class", "charset", "name", "content"],
  });
}
