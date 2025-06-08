// 代码高亮主题管理
export class CodeThemeManager {
  constructor() {
    this.currentTheme = "github";
    this.linkElement = null;
    this.themes = {
      // 亮色主题
      github:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css",
      vs: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css",
      "stackoverflow-light":
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/stackoverflow-light.min.css",
      googlecode:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/googlecode.min.css",
      xcode:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/xcode.min.css",

      // 暗色主题
      "github-dark":
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css",
      vs2015:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css",
      "atom-one-dark":
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css",
      monokai:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css",
      dracula:
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/dracula.min.css",
      "night-owl":
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/night-owl.min.css",
    };

    // 从 localStorage 恢复用户选择的主题
    const savedTheme = localStorage.getItem("code-theme");
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }
  }

  // 切换主题
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`主题 "${themeName}" 不存在`);
      return false;
    }

    // 移除当前主题样式
    if (this.linkElement) {
      this.linkElement.remove();
    }

    // 添加新主题样式
    this.linkElement = document.createElement("link");
    this.linkElement.rel = "stylesheet";
    this.linkElement.href = this.themes[themeName];
    this.linkElement.id = "highlight-theme";
    document.head.appendChild(this.linkElement);

    this.currentTheme = themeName;

    // 保存用户选择
    localStorage.setItem("code-theme", themeName);

    console.log(`代码主题已切换到: ${themeName}`);
    return true;
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }

  // 获取所有可用主题
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  // 获取主题分类
  getThemesByCategory() {
    return {
      light: ["github", "vs", "stackoverflow-light", "googlecode", "xcode"],
      dark: [
        "github-dark",
        "vs2015",
        "atom-one-dark",
        "monokai",
        "dracula",
        "night-owl",
      ],
    };
  }

  // 初始化默认主题
  init() {
    this.setTheme(this.currentTheme);
  }
}

// 创建全局实例
export const codeThemeManager = new CodeThemeManager();
