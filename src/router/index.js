import { createRouter, createWebHistory } from "vue-router";
import BasicLayout from "@/components/Layouts/BasicLayout.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    component: BasicLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/HomeView.vue"),
        meta: { title: "首页", requiresAuth: false },
      },
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/LoginView.vue"),
        meta: { title: "登录", guest: true }, // 仅允许未登录用户访问
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/RegisterView.vue"),
        meta: { title: "注册", guest: true }, // 仅允许未登录用户访问
      },
      {
        path: "/about",
        name: "About",
        component: () => import("@/views/AboutView.vue"),
        meta: { title: "关于我", requiresAuth: false },
      },
      {
        path: "/articles",
        name: "ArticleList",
        component: () => import("@/views/ArticleListView.vue"),
        meta: { title: "文章列表", requiresAuth: false },
      },
      {
        path: "/article/:id",
        name: "ArticleDetail",
        component: () => import("@/views/ArticleDetailView.vue"),
        meta: { title: "文章详情", requiresAuth: false },
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("@/views/SettingsView.vue"),
        meta: { title: "设置", requiresAuth: true }, // 需要登录
      },
      {
        path: "/profile",
        name: "Profile",
        component: () => import("@/views/ProfileView.vue"),
        meta: { title: "个人资料", requiresAuth: true }, // 需要登录
      },
      {
        path: "/admin",
        name: "Admin",
        component: () => import("@/views/AdminView.vue"),
        meta: {
          title: "管理后台",
          requiresAuth: true,
          requiresAdmin: true, // 需要管理员权限
        },
      },
      // 404 处理路由
      {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFoundView.vue"),
        meta: { title: "页面未找到" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，则滚动到该位置
    if (savedPosition) {
      return savedPosition;
    }
    // 否则滚动到顶部
    return { top: 0 };
  },
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 我的博客`;
  }

  const authStore = useAuthStore();

  // 检查是否仅限访客访问（如登录/注册页面）
  if (to.matched.some((record) => record.meta.guest)) {
    if (authStore.isLoggedIn) {
      // 已登录用户重定向到首页
      next("/profile");
      return;
    }
  }

  // 检查是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isLoggedIn) {
      // 未登录用户重定向到登录页，携带原访问路径
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 检查管理员权限
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      const userInfo = authStore.user;
      const isAdmin = userInfo?.role === 0; // 假设role为0表示管理员

      if (!isAdmin) {
        // 非管理员用户重定向到首页或权限不足页面
        next("/");
        return;
      }
    }
  }

  // 其他情况正常放行
  next();
});

export default router;
