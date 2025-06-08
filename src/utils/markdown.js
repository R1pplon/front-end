import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

// 配置 marked 支持代码高亮
marked.setOptions({
  breaks: true,
  gfm: true,
  smartLists: true,
  smartypants: true,
  highlight: function (code, language) {
    // 如果指定了语言且该语言被支持，则使用指定语言高亮
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language: language }).value;
      } catch (err) {
        console.warn("代码高亮失败:", err);
      }
    }

    // 否则尝试自动检测语言
    try {
      return hljs.highlightAuto(code).value;
    } catch (err) {
      console.warn("自动代码高亮失败:", err);
      return code; // 如果高亮失败，返回原始代码
    }
  },
});

// 渲染 Markdown 并净化 HTML
export const renderMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== "string") {
    console.warn("renderMarkdown: 输入不是有效的字符串", markdown);
    return "";
  }

  try {
    // 渲染 Markdown 到 HTML
    const rawHtml = marked.parse(markdown);

    // 确保 rawHtml 是字符串
    const htmlString = typeof rawHtml === "string" ? rawHtml : String(rawHtml);

    // 净化 HTML 防止 XSS 攻击
    const cleanHtml = DOMPurify.sanitize(htmlString, {
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
        "br",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "class",
        "title",
        "style",
        "data-lang",
      ],
      ADD_ATTR: ["target", "rel"],
    });

    return cleanHtml;
  } catch (error) {
    console.error("Markdown 渲染错误:", error);
    return `<p>内容渲染失败</p>`;
  }
};

// 如果需要手动应用代码高亮（通常不需要，因为 marked 已经处理了）
export const applyCodeHighlight = () => {
  try {
    hljs.highlightAll();
    console.log("代码高亮应用完成");
  } catch (error) {
    console.warn("代码高亮失败:", error);
  }
};
