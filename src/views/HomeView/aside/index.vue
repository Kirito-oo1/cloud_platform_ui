<template>
  <div class="aside_contain">
    <!-- 系统图标 -->
    <div class="sys_img_wrap" v-if="!collapse">
      <img class="sys_img" src="../../../assets/image/expand_logo.png" alt />
    </div>
    <div class="sys_img_wrap" v-else>
      <img class="sys_img" src="../../../assets/image/logo.png" alt style="width: 50px; margin-bottom: 15px" />
    </div>
    <!-- 菜单栏 -->
    <el-menu :default-active="defaultPath" unique-opened router class="menu_vertical new-el-menu--sidebar" text-color="#666666" active-text-color="#349A44" :collapse="collapse">
      <div v-for="(item, index) in menuList" :key="index">
        <el-sub-menu v-if="item.list && item.list.length" :index="item.url">
          <template #title>
            <i :class="['iconfont', `${item.icon}`]" :style="collapse ? '' : 'margin-left:20px'"></i>
            <span v-if="!collapse" class="menu_name">
              {{ item.name }}
            </span>
          </template>
          <el-menu-item-group v-for="(itm, idx) in item.list" :key="idx" class="sub_menu_item">
            <el-menu-item :index="itm.url">
              <i :class="['iconfont', `${itm.icon}`]" :style="collapse ? 'margin-right:10px' : 'margin: 0 10px 0 20px'"></i>
              <template #title>
                <span style="margin-left: 30px" class="menu_name">
                  {{ itm.name }}
                </span>
              </template>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item v-else :index="item.url">
          <i :class="['iconfont', `${item.icon}`]" :style="collapse ? '' : 'margin-left:20px'"></i>
          <template #title>
            <span class="menu_name">{{ item.name }}</span>
          </template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script>
  export default {
    props: ["menuList"],
    components: {},
    computed: {},
    data() {
      return {
        defaultPath: "", //菜单选中的路径,
        collapse: false, // 菜单是否折叠,
      };
    },
    created() {},
    mounted() {
      // 初次渲染的选中路径或者刷新页面的缓存路径
      let { path, name } = this.$route;
      this.defaultPath = path ? path : this.menuList[0].url;
      this.$bus.on("collapse", (data) => {
        this.collapse = data;
      });
    },
    watch: {
      $route(to, from) {
        this.defaultPath = to.path;
      },
    },
    methods: {},
  };
</script>

<style lang="less" scoped>
  .aside_contain {
    width: 100%;
    height: 100%;
    .iconfont {
      margin-right: 10px;
    }
    .sys_img_wrap {
      width: 100%;
      height: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px dashed rgba(223, 223, 223, 0.5);
      .sys_img {
        height: auto;
        width: 180px;
      }
    }
    /deep/.is-active {
      border-radius: 10px;
      background-color: @menuHightBgColor !important;
    }
    .menu_vertical {
      /deep/ .el-submenu {
        background: #fff !important;
      }
      /deep/ .el-submenu__title {
        font-weight: 800 !important;
      }
      /deep/ .el-menu-item {
        font-weight: 800;
      }
      /deep/ .el-menu-item:hover {
        border-radius: 10px;
      }
      .menu_name {
        font-weight: 900 !important;
      }
    }
  }
</style>
