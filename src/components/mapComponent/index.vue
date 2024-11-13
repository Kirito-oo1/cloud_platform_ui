<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-07 16:00
 * @Description: 地图：加载地图、常规地图操作
-->
<template>
  <div id="mapview"></div>
</template>

<script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";

  export default {
    name: "mapView",
    data() {
      return {
        //实例化地图
        map: null,
        //图层列表
        layerList: [],
      };
    },
    mounted() {
      //初始化加载地图
      this.CreateMap();
      //   //监听鼠标事件
      //   this.search();
      //接收地图工具栏数据
      this.$bus.$on("LayerToolId", (data) => {
        if (data.id == 8) {
          this.handleViewClear();
        } else {
          this.handleLayerTool(data);
        }
      });
    },
    beforeDestroy() {
      //组件卸载之前,解绑事件总线事件
      this.$bus.$off("LayerToolId");
    },
    methods: {
      //创建地图
      CreateMap() {
        this.map = L.map("mapview", {
          center: [30.786549, 104.089219], // 地图中心
          zoom: 16, //缩放比列
          zoomControl: true, //禁用 + - 按钮
          doubleClickZoom: true, // 禁用双击放大
          attributionControl: false, // 移除右下角leaflet标识
        });
        //加载天地图
        L.tileLayer(
          "http://t{s}.tianditu.gov.cn/img_w/wmts?tk=5e3672fc0409d68d282e328ddd3db78a&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}",
          {
            subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
          }
          // "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
          // "http://t4.tianditu.com/DataServer?T=cva_w&tk=5a257cd2df1b3311723bd77b0de14baf&x={x}&y={y}&l={z}",
        ).addTo(this.map);
        //设置语言
        this.map.pm.setLang("zh");
      },
      //地图功能
      handleLayerTool(value) {
        //初始化清除
        this.isIdentifyLayer = false;
        this.isQueryLayer = false;

        //测距
        if (value.id == 6 && value.select) {
          this.$message.warning("随时可以按下ESC取消测量");
          handleMeasures.measureLength(view);
        } else if (value.id == 6 && !value.select) {
          handleMeasures.clearMeasures(view);
        }
        //测面
        if (value.id == 7 && value.select) {
          this.$message.warning("随时可以按下ESC取消测量");
          handleMeasures.measureArea(view);
        } else if (value.id == 7 && !value.select) {
          handleMeasures.clearMeasures(view);
        }
        //全屏
        if (value.id == 9) {
          this.$nextTick(() => {
            //指定全屏区域元素
            let ele = document.getElementById("main_wrap");
            screenfull.toggle(ele);
          });
        }
        //复位
        if (value.id == 10) {
          handleMap.zoomTo(view, [109.0611612, 34.5096216], 10);
        }
        //放大
        if (value.id == 11) {
          zoom.zoomIn();
        }
        //缩小
        if (value.id == 12) {
          zoom.zoomOut();
        }
      },
      //地图清除
      handleViewClear() {
        handleMeasures.clearMeasures(view);
        let focusLayer = this.map.findLayerById("focusLayer");
        if (focusLayer) {
          focusLayer.removeAll();
        }
        this.$bus.$emit("LayerQueryed", []);
      },
    },
  };
</script>

<style>
  #mapview {
    position: relative;
    width: 100%;
    height: 100%;
  }
  /*去除mapview拖动时的边框*/
  .esri-view .esri-view-surface--inset-outline:focus::after {
    outline: auto 0px Highlight !important;
    outline: auto 0px -webkit-focus-ring-color !important;
  }
  /*地图工具*/

  mapview-coordinate {
    display: none;
  }

  /* 110%缩放适配 */
  @media (max-width: 1750px) and (min-width: 860px) {
    .esri-ui {
      zoom: 91%;
    }
    @-ms-viewport {
      width: 1920px;
    }
  }
  /* 125%缩放适配 */
  @media (max-width: 1550px) and (min-width: 760px) {
    .esri-ui {
      zoom: 75%;
    }
    @-ms-viewport {
      width: 1920px;
    }
  }
</style>
