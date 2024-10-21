<template>
  <div class="layer_menu_container">
    <div class="layer_menu_wrap">
      <div class="layer_menu_list">
        <div class="layer_menu_item" v-for="(item, index) in layerMenuList" :key="index" :title="item.title" :style="item.id == 8 ? 'margin-top:3px' : ''" @click="handleLayerMenu(item)">
          <i :class="['iconfont', `${item.icon}`, item.select ? 'active' : '']"></i>
        </div>
      </div>
      <div class="layer_menu_list" :style="{ 'margin-top': isFull ? '500px' : '300px' }">
        <div class="layer_menu_item" v-for="(item, index) in toolList" :key="index" :title="item.title" style="margin-bottom: 3px" @click="handleLayerTool(item)">
          <i :class="['iconfont', `${item.icon}`]"></i>
        </div>
      </div>
    </div>

    <!-- 图层树 -->
    <!-- <layerTreePop v-if="markId == 1"></layerTreePop> -->
    <!-- 添加临时图层 -->
    <!-- <addCasualLayerPop v-if="markId == 2" @closePop="closePop"></addCasualLayerPop> -->
    <!-- 成果车 -->
    <!-- <resultsCarPop v-if="markId == 4" @closePop="closePop"></resultsCarPop> -->
    <!-- 矩形选择 -->
    <!-- <rectangularSelectionPop @closePop="closePop"></rectangularSelectionPop> -->
  </div>
</template>

<script>
  // // import layerTreePop from "../layerTreePop";
  // import addCasualLayerPop from "../addCasualLayerPop";
  // import resultsCarPop from "../resultsCarPop";
  // import rectangularSelectionPop from "../rectangularSelectionPop";
  export default {
    // components: {
    //   layerTreePop,
    //   addCasualLayerPop,
    //   resultsCarPop,
    //   rectangularSelectionPop,
    // },
    data() {
      return {
        markId: null,
        layerMenuList: [
          {
            title: "图层树",
            icon: "icon-tuceng",
            id: 1,
            select: false,
          },
          {
            title: "添加临时图层",
            icon: "icon-tianjia",
            id: 2,
            select: false,
          },
          {
            title: "成果车",
            icon: "icon-chengguoche",
            id: 4,
            select: false,
          },
          {
            title: "识别",
            icon: "icon-tishi",
            id: 3,
            select: false,
          },
          {
            title: "框选图层",
            icon: "icon-xingzhuang-juxing",
            id: 5,
            select: false,
          },
          {
            title: "测距",
            icon: "icon-ceju",
            id: 6,
            select: false,
          },
          {
            title: "测面",
            icon: "icon-cemian",
            id: 7,
            select: false,
          },
          {
            title: "清除",
            icon: "icon-delete",
            id: 8,
            select: false,
          },
        ],

        toolList: [
          {
            title: "全屏",
            icon: "icon-quanping_",
            id: 9,
          },
          {
            title: "复位",
            icon: "icon-fuwei2",
            id: 10,
          },
          {
            title: "放大",
            icon: "icon-tianjia01",
            id: 11,
          },
          {
            title: "缩小",
            icon: "icon-jianhao",
            id: 12,
          },
        ],
        isFull: false,
      };
    },
    created() {},
    mounted() {},
    methods: {
      // 处理图层菜单
      handleLayerMenu(value) {
        // 高亮
        this.layerMenuList.forEach((itm) => {
          if (itm.id == value.id && value.id != 8) {
            itm.select = !itm.select;
          } else {
            itm.select = false;
          }
        });
        //展示对应内容
        if (this.markId == value.id) {
          this.markId = null;
        } else {
          this.markId = value.id;
        }
        this.$nextTick(() => {
          this.$bus.$emit("LayerToolId", value);
        });
      },
      // 处理图层工具
      handleLayerTool(value) {
        this.$nextTick(() => {
          this.$bus.$emit("LayerToolId", value);
        });
        //全屏时样式变化
      },
      //关闭弹窗
      closePop() {
        this.markId = null;
        //取消所有高亮
        this.layerMenuList.forEach((itm) => {
          itm.select = false;
        });
      },
      //检查全屏
      // checkFull() {
      //   let isFull = window.fullScreen || document.webkitIsFullScreen;
      //   this.isFull = isFull;
      //   if (isFull) {
      //     this.$set(this.toolList[0], "title", "退出全屏");
      //     this.$set(this.toolList[0], "icon", "icon-tuichuquanping-copy");
      //   } else {
      //     this.$set(this.toolList[0], "title", "全屏");
      //     this.$set(this.toolList[0], "icon", "icon-quanping_");
      //   }
      // },
    },
  };
</script>

<style lang="less" scoped>
  .layer_menu_container {
    position: relative;
    z-index: 1;
    .layer_menu_wrap {
      position: absolute;
      right: 10px;
      top: 10px;
      bottom: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .layer_menu_list {
        .layer_menu_item {
          cursor: pointer;
          padding: 5px;
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

  /* 110%缩放适配 */
  @media (max-width: 1750px) and (min-width: 860px) {
    .layer_menu_container {
      zoom: 91%;
    }
    @-ms-viewport {
      width: 1920px;
    }
  }
  /* 125%缩放适配 */
  @media (max-width: 1550px) and (min-width: 760px) {
    .layer_menu_container {
      zoom: 75%;
    }
    @-ms-viewport {
      width: 1920px;
    }
  }
</style>
