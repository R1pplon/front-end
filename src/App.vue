<template>
  <div id="app">
    <!-- 路由入口将由布局组件控制 -->
    <router-view></router-view>
  </div>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  line-height: 1.5;
}

/* 添加一些基础样式增强页面结构 */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>