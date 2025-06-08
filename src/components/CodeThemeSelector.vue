<template>
  <div class="theme-selector">
    <el-dropdown @command="handleThemeChange" trigger="click">
      <el-button type="text" class="theme-button">
        <span class="icon">🎨</span>
        <span class="text">代码主题</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <div class="theme-category">
            <div class="category-title">
              亮色主题
              <span v-if="!isGlobalDarkTheme" class="recommended-label">（推荐）</span>
            </div>
            <el-dropdown-item 
              v-for="theme in lightThemes" 
              :key="theme"
              :command="theme"
              :class="{ active: currentTheme === theme }"
            >
              <span class="theme-name">{{ getThemeName(theme) }}</span>
              <span v-if="currentTheme === theme" class="check-icon">✓</span>
            </el-dropdown-item>
          </div>
          
          <el-divider />
          
          <div class="theme-category">
            <div class="category-title">
              暗色主题
              <span v-if="isGlobalDarkTheme" class="recommended-label">（推荐）</span>
            </div>
            <el-dropdown-item 
              v-for="theme in darkThemes" 
              :key="theme"
              :command="theme"
              :class="{ active: currentTheme === theme }"
            >
              <span class="theme-name">{{ getThemeName(theme) }}</span>
              <span v-if="currentTheme === theme" class="check-icon">✓</span>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { codeThemeManager } from '@/utils/codeTheme';

const currentTheme = ref('github');

const lightThemes = ['github', 'vs', 'stackoverflow-light', 'googlecode', 'xcode'];
const darkThemes = ['github-dark', 'vs2015', 'atom-one-dark', 'monokai', 'dracula', 'night-owl'];

// 检测当前是否为暗色主题
const isGlobalDarkTheme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark';
});

// 监听全局主题变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      // 当全局主题改变时，不自动切换代码主题，因为BasicLayout已经处理了
      // 这里只是为了更新UI显示
    }
  });
});

const themeNames = {
  'github': 'GitHub',
  'vs': 'Visual Studio',
  'stackoverflow-light': 'Stack Overflow Light',
  'googlecode': 'Google Code',
  'xcode': 'Xcode',
  'github-dark': 'GitHub Dark',
  'vs2015': 'Visual Studio 2015',
  'atom-one-dark': 'Atom One Dark',
  'monokai': 'Monokai',
  'dracula': 'Dracula',
  'night-owl': 'Night Owl'
};

const getThemeName = (theme) => {
  return themeNames[theme] || theme;
};

const handleThemeChange = (theme) => {
  if (codeThemeManager.setTheme(theme)) {
    currentTheme.value = theme;
    
    // 触发重新高亮所有代码块
    setTimeout(() => {
      if (window.hljs) {
        window.hljs.highlightAll();
      }
    }, 100);
  }
};

onMounted(() => {
  currentTheme.value = codeThemeManager.getCurrentTheme();
  // 初始化主题
  codeThemeManager.init();
  
  // 监听 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

onUnmounted(() => {
  // 清理监听器
  observer.disconnect();
});
</script>

<style scoped>
.theme-selector {
  display: inline-block;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.theme-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.icon {
  font-size: 1rem;
}

.text {
  font-weight: 500;
}

.theme-category {
  padding: 0.5rem 0;
}

.category-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommended-label {
  color: var(--text-link);
  font-size: 0.7rem;
  font-weight: 400;
}

.theme-name {
  flex: 1;
}

.check-icon {
  color: var(--text-link);
  font-weight: bold;
  margin-left: 0.5rem;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
}

:deep(.el-dropdown-menu__item.active) {
  background-color: var(--bg-secondary);
  color: var(--text-link);
}

:deep(.el-divider) {
  margin: 0.5rem 0;
}
</style> 