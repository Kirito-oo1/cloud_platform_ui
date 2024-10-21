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
            name: "首页",
            url: "/systemHome",
            icon: "icon-shouye",
            list: [],
          },
          {
            name: "设备可视化",
            url: "/achievementData",
            icon: "icon-ditu",
            list: [
              {
                name: "数据展示",
                url: "/achievementData/archivedData",
                icon: "icon-ditu",
              },
              {
                name: "设备管理",
                url: "/achievementData/resultsData",
                icon: "icon-ditu",
              },
            ],
          },
          {
            name: "系统管理",
            url: "/sys",
            icon: "icon-xitongguanli-",
            list: [
              {
                name: "用户管理",
                url: "/sys/user",
                icon: "icon-yonghuguanli",
              },
              {
                name: "日志管理",
                url: "/sys/log",
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
