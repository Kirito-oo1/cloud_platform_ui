import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login/index.vue"), //异步加载 优化页面速度
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomeView/index.vue"),
    redirect: "/systemHome",
    children: [
      {
        path: "/systemHome",
        name: "首页",
        component: () => import("@/views/HomeView/main/systemHome/index.vue"),
      },
      {
        path: "/achievementData",
        name: "成果库",
        component: () => import("@/views/HomeView/main/achievementData/index.vue"),
        children: [
          {
            path: "/achievementData/resultsData",
            name: "暂存数据",
            component: () => import("@/views/HomeView/main/achievementData/resultsData/index.vue"),
          },
          {
            path: "/achievementData/archivedData",
            name: "成果数据",
            component: () => import("@/views/HomeView/main/achievementData/archivedData/index.vue"),
          },
        ],
      },
      {
        path: "/sys",
        name: "系统管理",
        component: () => import("@/views/HomeView/main/sys/index.vue"),
        children: [
          {
            path: "/sys/user",
            name: "用户管理",
            component: () => import("@/views/HomeView/main/sys/user/index.vue"),
          },
          {
            path: "/sys/log",
            name: "日志管理",
            component: () => import("@/views/HomeView/main/sys/log/index.vue"),
          },
        ],
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

export default router;
