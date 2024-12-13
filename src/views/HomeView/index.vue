<template>
  <div class="home_container">
    <el-container>
      <el-aside style="width: auto">
        <Aside :menuList="menuList" />
      </el-aside>
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <Main />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  import Header from "./header";
  import Aside from "./aside";
  import Main from "./main";
  import { postApi, getApi } from "@/api/request";
  import { mapActions } from "vuex";
  export default {
    components: {
      Header,
      Aside,
      Main,
    },
    computed: {},
    data() {
      return {
        menuList: [
          {
            name: "系统首页",
            url: "/systemHome",
            icon: "icon-xitongshouye",
            list: [],
          },
          {
            name: "系统功能",
            url: "/systemFunction",
            icon: "icon-xitonggongnengguanli",
            list: [
              {
                name: "任务规划",
                url: "/systemFunction/missionPlanner",
                icon: "icon-tiaodurenwuguihua",
              },
              {
                name: "多机SLAM",
                url: "/systemFunction/slamPointCloud",
                icon: "icon-duojiwei",
              },
              {
                name: "图像拼接",
                url: "/systemFunction/pictureMerge",
                icon: "icon-pinjie",
              },
              {
                name: "手持设备",
                url: "/systemFunction/handheld_device",
                icon: "icon-thin-_mobile_iph",
              },
              {
                name: "高斯模型",
                url: "/systemFunction/gaussianModel",
                icon: "icon-gaosihunhe",
              },
            ],
          },
          {
            name: "设备可视化",
            url: "/equipmentVisual",
            icon: "icon-a-visualizeddashboard",
            list: [
              {
                name: "无人设备展示",
                url: "/equipmentVisual/unmannedEquipment",
                icon: "icon-wurenche",
              },
              {
                name: "首师大无人机",
                url: "/equipmentVisual/cnuUVA",
                icon: "icon-wurenji",
              },
            ],
          },
          {
            name: "系统管理",
            url: "/system",
            icon: "icon-xitongguanli1",
            list: [
              {
                name: "设备管理",
                url: "/system/equipment",
                icon: "icon-shebeiguanli",
              },
              {
                name: "用户管理",
                url: "/system/user",
                icon: "icon-yonghuguanli",
              },
              {
                name: "角色管理",
                url: "/system/role",
                icon: "icon-yidongyunkongzhitaiicon45",
              },
              {
                name: "日志管理",
                url: "/system/log",
                icon: "icon-rizhiguanli",
              },
            ],
          },
        ],
      };
    },
    created() {},
    mounted() {
      // this.getMenuList();
    },
    methods: {
      //获取系统菜单列表
      getMenuList() {
        getApi(`/sys/menu/user`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.menuList = data.data.menuList;
            console.log("menu=====>", data.data.menuList);
            /* 
            router.addRoute("home", {
                path: "vip",
                component: () => import("../Views/HomeVip.vue")
            })
          */
          }
        });
      },
    },
  };
</script>
<style lang="less" scoped>
  .home_container {
    width: @width;
    height: @height;
    background: #f4f6f8;
    .el-container {
      height: 100%;
      .el-header {
        color: #333;
        height: 7% !important;
        background-color: #fff;
        box-shadow: 0px 10px 10px -10px #dfdfdf;
        border-left: 1px solid rgba(223, 223, 223, 0.5);
      }

      .el-aside {
        background-color: @systemColor;
        color: #333;
        height: 100% !important;
        box-shadow: 0px 0px 10px 0px #dfdfdf;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .el-main {
        padding: 0;
        background-color: @systemColor;
        color: #333;
        height: 100% !important;
        margin: 28px 15px 15px 15px;
        border-radius: 16px;
        box-shadow: 0 0 10px 0 #dfdfdf;
      }
    }

    #cesiumMap {
      width: @width;
      height: @height;
    }
    /deep/ .distance-legend {
      right: 0 !important;
    }
  }
</style>
