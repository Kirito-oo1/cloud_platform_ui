<template>
  <div class="aside_contain">
    <!-- 系统图标 -->
    <div class="sys_img_wrap" v-if="!collapse">
      <img class="sys_img" src="../../../assets/image/expand_logo.svg" alt />
    </div>
    <div class="sys_img_wrap" v-else>
      <img class="sys_img" src="../../../assets/image/logo.png" alt style="width: 50px; margin-bottom: 15px" />
    </div>
    <!-- 菜单栏 -->
    <el-menu 
      :default-active="defaultPath"
      unique-opened
      router
      class="menu_vertical new-el-menu--sidebar"
      text-color="#666666"
      active-text-color="#349A44"
      :collapse="collapse">
      
      <div v-for="(item, index) in menuList" :key="index">
        <!-- 有子菜单的情况使用 el-submenu -->
        <el-submenu v-if="item.list && item.list.length" :index="item.url">
          <template #title>
            <i :class="['iconfont', item.icon]" :style="collapse ? '' : 'margin-left:20px'"></i>
            <span v-if="!collapse" class="menu_name">
              {{ item.name }}
            </span>
          </template>
          
          <!-- 子菜单项 -->
          <el-menu-item-group v-for="(itm, idx) in item.list" :key="idx" class="sub_menu_item">
            <el-menu-item :index="itm.url">
              <i :class="['iconfont', itm.icon]" :style="collapse ? 'margin-right:10px' : 'margin: 0 10px 0 20px'"></i>
              <template #title>
                <span style="margin-left: 30px" class="menu_name">
                  {{ itm.name }}
                </span>
              </template>
            </el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        
        <!-- 没有子菜单的情况 -->
        <el-menu-item v-else>
          <!-- 外部链接 -->
          <template v-if="item.external">
            <a :href="item.url" target="_blank" class="menu_item">
              <i :class="['iconfont', item.icon]" :style="collapse ? '' : 'margin-left:20px'"></i>
              <span v-if="!collapse" class="menu_name">{{ item.name }}</span>
            </a>
          </template>
          
          <!-- 内部路由 -->
          <template v-else>
            <router-link :to="item.url" class="menu_item">
              <i :class="['iconfont', item.icon]" :style="collapse ? '' : 'margin-left:20px'"></i>
              <span v-if="!collapse" class="menu_name">{{ item.name }}</span>
            </router-link>
          </template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script>
export default {
  props: ["menuList"],
  data() {
    return {
      defaultPath: "",
      collapse: false,
    };
  },
  mounted() {
    let { path } = this.$route;
    this.defaultPath = path ? path : this.menuList[0].url;
    this.$bus.$on("collapse", (data) => {
      this.collapse = data;
    });
  },
  watch: {
    $route(to) {
      this.defaultPath = to.path;
    },
  },
  methods: {
    openExternalLink(url) {
      window.open(url, '_blank');
    }
  }
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
    .menu_item {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      width: 100%;
      height: 100%;
    }
    .menu_item:hover {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
