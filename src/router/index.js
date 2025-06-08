import { createRouter, createWebHistory } from "vue-router";
import BasicLayout from "@/components/Layouts/BasicLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { isAdmin } from "@/utils/permission";

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
        children: [
          {
            path: "articles",
            name: "AdminArticles",
            component: () => import("@/views/admin/AdminArticlesView.vue"),
            meta: {
              title: "文章管理",
              requiresAuth: true,
              requiresAdmin: true,
            },
          },
          {
            path: "users",
            name: "AdminUsers",
            component: () => import("@/views/admin/AdminUsersView.vue"),
            meta: {
              title: "用户管理",
              requiresAuth: true,
              requiresAdmin: true,
            },
          },
          {
            path: "comments",
            name: "AdminComments",
            component: () => import("@/views/admin/AdminCommentsView.vue"),
            meta: {
              title: "评论管理",
              requiresAuth: true,
              requiresAdmin: true,
            },
          },
        ],
      },
      {
        path: "/unauthorized",
        name: "Unauthorized",
        component: () => import("@/views/UnauthorizedView.vue"),
        meta: { title: "权限不足" },
      },
      {
        path: "/debug-token",
        name: "TokenDebug",
        component: () => import("@/views/TokenDebugView.vue"),
        meta: { title: "Token 调试" },
      },
      {
        path: "/test-role",
        name: "RoleTest",
        component: () => import("@/views/RoleTestView.vue"),
        meta: { title: "角色测试" },
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
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 我的博客`;
  }

  const authStore = useAuthStore();

  console.log("路由守卫检查:", {
    fromPath: from.path,
    toPath: to.path,
    isLoggedIn: authStore.isLoggedIn,
  });

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
      console.log("用户未登录，重定向到登录页");
      // 未登录用户重定向到登录页，携带原访问路径
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 检查管理员权限
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      try {
        const isAdminResult = await isAdmin();
        if (!isAdminResult) {
          console.log("管理员权限检查失败，重定向到权限不足页面");
          // 非管理员用户重定向到权限不足页面
          next("/unauthorized");
          return;
        }
      } catch (error) {
        console.error("权限检查时发生错误:", error);
        next("/unauthorized");
        return;
      }
    }
  }

  // 其他情况正常放行
  next();
});

export default router;
