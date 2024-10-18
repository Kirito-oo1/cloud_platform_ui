<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2023-06-05 09:28:53
 * @Description: 地图主页：加载地图、基本操作
-->
<template>
  <div id="mapview"></div>
</template>

<script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";

  // 地图视图
  var view = null;

  export default {
    name: "MapView",
    data() {
      return {
        //实例化地图
        map: null,
        //已经加载的LayerId
        layerIdList: [],
        //已经加载的LayerUrl
        layerUrlList: [],
        //空间查询是否打开
        isIdentifyLayer: false,
        //空间查询结果
        searchResponse: [],
        //属性查询是否打开
        isQueryLayer: false,
        //图层列表
        layerList: [],
      };
    },
    mounted() {
      //初始化加载地图
      this.CreateMap();
      //   //监听鼠标事件
      //   this.search();
      //   //监听图层变化
      //   this.layerListen();
      //接收右侧工具栏数据
      this.$bus.on("LayerToolId", (data) => {
        if (data.id == 8) {
          this.handleViewClear();
        } else {
          this.handleLayerTool(data);
        }
      });
      //   //接收右侧图层数据
      //   this.$bus.on("newLayerList", (data) => {
      //     this.handleCreateLayer(data);
      //   });
      //   //接收临时图层JSON数据
      //   this.$bus.on("casualLayerData", (data) => {
      //     this.handleCreateCasualLayer(data);
      //   });
      //   // 监听页面刷新或关闭事件
      //   window.addEventListener("beforeunload", this.clearSessionStorage);
      // },
      // beforeDestroy() {
      //   //组件卸载之前,解绑事件总线事件
      //   this.$bus.$off("LayerToolId");
      //   this.$bus.$off("newLayerList");
      //   this.$bus.$off("casualLayerData");
      //   // 取消监听事件
      //   window.removeEventListener("beforeunload", this.clearSessionStorage);
      //   //组件卸载之前,清空缓存图层
      //   sessionStorage.removeItem("layer");
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
          //"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
        ).addTo(this.map);
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
        this.$bus.emit("LayerQueryed", []);
      },
      //监听图层变化
      layerListen() {
        this.map.allLayers.on("change", (evt) => {
          let newLayerList = [];
          this.layerList.forEach((item, index) => {
            evt.target.items.forEach((layer) => {
              if (item.id == layer.id) {
                newLayerList.push(item);
                layer.title = item.name;
              }
            });
          });
          //将选中状态存入sessionStorage
          this.resetSetItem("layer", JSON.stringify(newLayerList));
        });
      },
      //鼠标事件监听
      search() {
        view.on("click", (evt) => {
          if (this.isIdentifyLayer) {
            this.getIdentifysResult(evt);
          } else if (this.isQueryLayer) {
            if (!this.setVisibleLayerId()) {
              return;
            }
            let parmas = handleInquire.createSpatialQueryParams(evt.mapPoint, ["*"]);
            this.getQueryResult(parmas);
          }
        });
      },
      //查询前，判断当前可视图层，清除查询渲染结果
      setVisibleLayerId() {
        this.layerIdList = [];
        this.map.layers.items.forEach((layer) => {
          if (layer.visible && layer.id != "focusLayer" && layer.id != "measurelayer") {
            this.layerIdList.push(layer.id);
          }
        });
        if (this.layerIdList.length == 0) {
          return false;
        } else {
          this.layerUrlList = [];
          this.layerIdList.forEach((id) => {
            let layer = this.map.findLayerById(id);
            this.layerUrlList.push(layer);
          });
        }
        let focusLayer = this.map.findLayerById("focusLayer");
        if (focusLayer) {
          focusLayer.removeAll();
        } else {
          return false;
        }
        return true;
      },
      // 清空 sessionStorage
      clearSessionStorage() {
        sessionStorage.removeItem("layer");
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
