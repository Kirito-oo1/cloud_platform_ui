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
    component: () => import("@/views/Login"), //异步加载 优化页面速度
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomeView"),
    redirect: "/systemHome",
    children: [
      {
        path: "/systemHome",
        name: "系统首页",
        component: () => import("@/views/HomeView/main/systemHome"),
      },
      {
        path: "/systemFunction",
        name: "系统功能",
        component: () => import("@/views/HomeView/main/systemFunction"),
        children: [
          {
            path: "/systemFunction/missionPlanner",
            name: "任务规划",
            component: () => import("@/views/HomeView/main/systemFunction/missionPlanner"),
          },

          {
            path: "/systemFunction/slamPointCloud",
            name: "多机SLAM",
            component: () => import("@/views/HomeView/main/systemFunction/slamPointCloud"),
          },
          {
            path: "/systemFunction/pictureMerge",
            name: "图像拼接",
            component: () => import("@/views/HomeView/main/systemFunction/pictureMerge"),
          },
          {
            path: "/systemFunction/handheld_device",
            name: "手持设备",
            component: () => import("@/views/HomeView/main/systemFunction/handheld_device"),
          },
          {
            path: "/systemFunction/gaussianModel",
            name: "高斯模型",
            component: () => import("@/views/HomeView/main/systemFunction/gaussianModel"),
          },
        ],
      },
      {
        path: "/equipmentVisual",
        name: "设备可视化",
        component: () => import("@/views/HomeView/main/equipmentVisual"),
        children: [
          {
            path: "/equipmentVisual/unmannedEquipment",
            name: "无人设备展示",
            component: () => import("@/views/HomeView/main/equipmentVisual/unmannedEquipment"),
          },

          {
            path: "/equipmentVisual/cnuUVA",
            name: "首师大无人机",
            component: () => import("@/views/HomeView/main/equipmentVisual/cnuUVA"),
          },
        ],
      },
      {
        path: "/system",
        name: "系统管理",
        component: () => import("@/views/HomeView/main/system"),
        children: [
          {
            path: "/system/equipment",
            name: "设备管理",
            component: () => import("@/views/HomeView/main/system/equipment"),
          },
          {
            path: "/system/user",
            name: "用户管理",
            component: () => import("@/views/HomeView/main/system/user"),
          },
          {
            path: "/system/role",
            name: "角色管理",
            component: () => import("@/views/HomeView/main/system/role"),
          },
          {
            path: "/system/log",
            name: "日志管理",
            component: () => import("@/views/HomeView/main/system/log"),
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
