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
            <div class="category-title">亮色主题</div>
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
            <div class="category-title">暗色主题</div>
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
import { ref, onMounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { codeThemeManager } from '@/utils/codeTheme';

const currentTheme = ref('github');

const lightThemes = ['github', 'vs', 'stackoverflow-light', 'googlecode', 'xcode'];
const darkThemes = ['github-dark', 'vs2015', 'atom-one-dark', 'monokai', 'dracula', 'night-owl'];

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