<!--
 * @Author: Zhiyu Zheng
 * @Date: 2024-12-03 17:20:05
 * @LastEditors: Zhiyu Zheng
 * @LastEditTime: 2024-12-03 19:18:31
 * @FilePath: \cloud_platform_ui\src\components\mapComponent\cesiumMap\index.vue
 * @Description: cesium地图
-->
<template>
  <div id="cesiumMapView"></div>
</template>

<script>
  import { addTdtLayer } from "./js/tdt";
  import { flyToExtent, flyTo } from "./js/viewFly";
  export default {
    name: "cesiumMapView",
    data() {
      return {
        //实例化地图
        map: null,
        //绘制图层
        rectangleLayer: "",
        rectangleGeoJson: "",
        //任务区
        mission_layer_point_arr: [],
      };
    },
    mounted() {
      //初始化加载地图
      this.CreateMap();
      //接收地图工具栏数据
      this.$bus.$on("mapToolId", (data) => {
        this.handleMapTool(data);
      });
    },
    beforeDestroy() {
      //组件卸载之前,解绑事件总线事件
      this.$bus.$off("mapToolId");
    },
    methods: {
      //创建地图
      CreateMap() {
        Cesium.Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNTc1MDhmZi1iMDg2LTQ5NDgtYTBkMi04NGJlNDk5MTExNzciLCJpZCI6MTY1Nzc1LCJpYXQiOjE2OTQ0MzA5Njh9.tJRYPj12A73hHvFobBG4ZC7qpbeknFDs5EXMVGyUZ3U";
        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0; //摄像机视口远近参数，可设置地球大小
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(90, -20, 110, 90); //西南东北，默认显示中国
        window.viewer = new Cesium.Viewer("cesiumMapView", {
          scene3DOnly: true, //每个几何实例将以3D渲染以节省GPU内存,默认false
          infoBox: false, //点击要素之后显示的信息控件，默认true
          selectionIndicator: false, //选中元素显示控件，默认true
          shadows: false, //确定阴影是否由光源投射，默认false
          shouldAnimate: true,
          animation: false, //动画控制，默认true
          baseLayerPicker: false, //地图切换控件是否显示，默认true
          geocoder: false, //地名查找,默认true
          timeline: false, //时间线，默认true
          sceneModePicker: false, //切换2D、3D 控件,默认true
          fullscreenButton: false, //全屏按钮
          homeButton: false, //跳转默认视角按钮，默认true
          navigationHelpButton: false, //导航帮助按钮，默认true
          vrButton: false, //双屏模式，默认true
          //imageryProvider: esri, //默认的谷歌地图影像  影像图层 ImageryLayer,这里是esri的影像图层
          locale: "zh-CN", // 设置地名显示的语言为中文
          // navigationInstructionsInitiallyVisible: false, // 隐藏初始导航说明
          // showRenderLoopErrors: false, // 隐藏渲染循环错误
        });
        window.viewer._cesiumWidget._creditContainer.style.display = "none"; //去除底部版权信息
        window.viewer.scene.postProcessStages.fxaa.enabled = true; // 开启抗锯齿
        window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // 取消左键双击事件
        if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
          //判断是否支持图像渲染像素化处理
          window.viewer.resolutionScale = window.devicePixelRatio;
        }
        //添加天地图影像、注记及国界线
        addTdtLayer("img", 0); // 影像
        addTdtLayer("cia", 2); // 注记
        addTdtLayer("ibo", 1); // 国界线
        flyTo(116.30014273942052, 39.92958344773789, 500, Cesium.Math.toRadians(0.0), Cesium.Math.toRadians(-90.0), 0.0);
      },
      //地图功能
      handleMapTool(value) {
        if (value == 2) {
          // 设置多边形的颜色
          const polygonOptions = {
            templineStyle: {},
            // the line from the last marker to the mouse cursor
            hintlineStyle: {},
            pathOptions: {
              color: "green",
              fillColor: "blue",
              fillOpacity: 0.1,
            },
          };

          this.map.pm.enableDraw("Polygon", polygonOptions);

          this.rectangleLayer = this.map.pm.enableDraw("Polygon", {
            snappable: true, // 启用捕捉到其他绘制图形的顶点
            snapDistance: 20, // 顶点捕捉距离
          });
          this.map.on("pm:create", (e) => {
            let target = [];
            const shape = e.shape;
            // 多边形
            if (shape === "Polygon" || shape === "Rectangle") {
              // 处理绘制完成的逻辑
              this.map.fitBounds(e.layer._latlngs); // 聚焦到选择的区域
              console.log(e.layer._latlngs);

              e.layer._latlngs[0].forEach((item) => {
                let arr = [item.lng, item.lat];
                target.push(arr);
              });
              // for (let i = 0; i < e.layer._latlngs[0].length; i++) {
              //   let arr = [this.LatLngjson[i].lng, this.LatLngjson[i].lat];
              //   target.push(arr);
              // }
            }
            this.mission_layer_point_arr = target;
            this.map.off("pm:create");
          });
        }
        if (value == 5) {
          this.handleLayerClear();
        }
      },
      //地图清除
      handleLayerClear() {
        this.map.removeLayer(this.rectangleLayer);
      },
    },
  };
</script>

<style>
  #cesiumMapView {
    position: relative;
    width: 100%;
    height: 100%;
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
