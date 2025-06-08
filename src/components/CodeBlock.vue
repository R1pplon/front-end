<template>
  <div class="code-block-wrapper">
    <div class="code-header" v-if="language">
      <span class="language-label">{{ language }}</span>
      <button class="copy-button" @click="copyCode" :class="{ copied: isCopied }">
        <span v-if="!isCopied">📋 复制</span>
        <span v-else>✅ 已复制</span>
      </button>
    </div>
    <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import hljs from 'highlight.js';

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: ''
  }
});

const isCopied = ref(false);

const highlightedCode = computed(() => {
  if (props.language && hljs.getLanguage(props.language)) {
    try {
      return hljs.highlight(props.code, { language: props.language }).value;
    } catch (err) {
      console.warn('代码高亮失败:', err);
    }
  }
  
  try {
    return hljs.highlightAuto(props.code).value;
  } catch (err) {
    console.warn('自动代码高亮失败:', err);
    return props.code;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    // 备用复制方法
    const textArea = document.createElement('textarea');
    textArea.value = props.code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e4e8;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f6f8fa;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e1e4e8;
  font-size: 0.8rem;
}

.language-label {
  color: #586069;
  font-weight: 500;
  text-transform: uppercase;
}

.copy-button {
  background: none;
  border: 1px solid #d1d5da;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: #586069;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background-color: #e1e4e8;
}

.copy-button.copied {
  color: #28a745;
  border-color: #28a745;
}

.code-block-wrapper pre {
  margin: 0;
  background-color: #f6f8fa;
  padding: 1.2rem;
  overflow-x: auto;
}

.code-block-wrapper code {
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: none;
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .code-header {
    background-color: #161b22;
    border-color: #30363d;
  }
  
  .language-label {
    color: #8b949e;
  }
  
  .copy-button {
    color: #8b949e;
    border-color: #30363d;
    background-color: #21262d;
  }
  
  .copy-button:hover {
    background-color: #30363d;
  }
  
  .code-block-wrapper pre {
    background-color: #161b22;
  }
  
  .code-block-wrapper {
    border-color: #30363d;
  }
}
</style> 