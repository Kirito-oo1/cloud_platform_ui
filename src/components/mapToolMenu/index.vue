<template>
  <div class="layer_menu_container">
    <div class="layer_menu_wrap">
      <div class="layer_menu_list">
        <div class="layer_menu_item" v-for="(item, index) in toolList" :key="index" :title="item.title" @click="handleToolMenu(item)">
          <i :class="['iconfont', `${item.icon}`, item.select ? 'active' : '']"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "mapToolMenu",
    components: {},
    data() {
      return {
        toolList: [
          {
            index: 1,
            title: "任务区信息表",
            icon: "icon-ditu",
            id: 1,
            select: false,
          },
          {
            index: 2,
            title: "绘制任务区",
            icon: "icon-ditu",
            id: 2,
            select: false,
          },
          {
            index: 3,
            title: "绘制障碍区",
            icon: "icon-ditu",
            id: 3,
            select: false,
          },
          {
            index: 4,
            title: "添加起点",
            icon: "icon-ditu",
            id: 4,
            select: false,
          },
          {
            index: 5,
            title: "取消绘制",
            icon: "icon-ditu",
            id: 5,
            select: false,
          },
        ],
      };
    },
    created() {},
    mounted() {},
    methods: {
      // 处理图层菜单
      handleToolMenu(value) {
        // 高亮
        this.toolList.forEach((itm) => {
          if (itm.id == value.id) {
            itm.select = !itm.select;
          } else {
            itm.select = false;
          }
        });

        this.$bus.$emit("mapToolId", value.id);
      },
      //关闭弹窗
      closePop() {
        //取消所有高亮
        this.toolList.forEach((itm) => {
          itm.select = false;
        });
      },
    },
  };
</script>

<style lang="less" scoped>
  .layer_menu_container {
    width: 100%;
    height: 100%;
    position: relative;
    .layer_menu_wrap {
      width: 100%;
      height: 100%;

      .layer_menu_list {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        .layer_menu_item {
          cursor: pointer;
          padding: 5px;
          margin-bottom: 5px;
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          .active {
            color: @highlightFontColor;
          }
        }
      }
      .iconfont {
        font-size: 20px;
        color: #666666;
      }
      .iconfont:hover {
        color: @bgHoverColor;
      }
    }
  }
</style>
