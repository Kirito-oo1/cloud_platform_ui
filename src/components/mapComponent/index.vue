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
  import "leaflet.pm";
  import "leaflet.pm/dist/leaflet.pm.css";

  export default {
    name: "mapView",
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
      //   //监听鼠标事件
      //   this.search();
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

        // leaflet.pm插件
        //设置语言
        this.map.pm.setLang("zh");
        // 监听创建图形
        this.map.on("pm:create", (e) => {
          // 记录当前绘制的图形
          this.rectangleGeoJson = e.layer.toGeoJSON();
          this.rectangleLayer = e.layer;
        });
        // 监听删除图形
        this.map.on("pm:remove", (e) => {
          console.log("删除了该区域");
        });
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
