import { marked } from "marked";
import DOMPurify from "dompurify";

// 创建 Markdown 渲染器
const renderer = new marked.Renderer();

// 覆盖默认渲染方法
renderer.heading = (text, level) => {
  return `<h${level} class="markdown-heading">${text}</h${level}>`;
};

// 修复链接渲染问题
renderer.link = (href, title, text) => {
  // 处理 href 不是字符串的情况
  if (typeof href !== "string") {
    return text;
  }

  const isExternal = href.startsWith("http");
  const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${href}" ${target} title="${title || ""}">${text}</a>`;
};

// 配置 marked
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
  smartLists: true,
  smartypants: true,
});

// 渲染 Markdown 并净化 HTML
export const renderMarkdown = (markdown) => {
  if (!markdown) return "";

  // 渲染 Markdown 到 HTML
  const rawHtml = marked.parse(markdown);

  // 净化 HTML 防止 XSS 攻击
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "pre",
      "code",
      "blockquote",
      "a",
      "img",
      "div",
      "span",
    ],
    ADD_ATTR: ["target", "rel"],
  });

  return cleanHtml;
};
