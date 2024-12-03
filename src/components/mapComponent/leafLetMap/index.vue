<!--
 * @Author: Zhiyu Zheng
 * @Date: 2024-11-07 16:18:44
 * @LastEditors: Zhiyu Zheng
 * @LastEditTime: 2024-12-03 23:49:35
 * @FilePath: \cloud_platform_ui\src\components\mapComponent\leafLetMap\index.vue
 * @Description: leaflet地图
-->
<template>
  <div id="leafletMapView">
    <el-drawer title="任务规划信息表" :visible.sync="mission_planner_form_visible" direction="rtl" :modal="false" :wrapperClosable="true" style="height: 70%; margin: auto">
      <div>
        <el-row style="margin-top: 10px">
          <el-col :span="5">无人设备数量:</el-col>
          <el-col :span="19">
            <el-input v-model="mission_planner_form.number_device" placeholder="请输入内容"></el-input>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">扫描密度：</el-col>
          <el-col :span="19">
            <el-input v-model="mission_planner_form.scan_density" placeholder="请输入内容"></el-input>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">路线严格控制在任务区内:</el-col>
          <el-col :span="19">
            <el-input v-model="mission_planner_form.pathsStrictlyInPoly" placeholder="请输入内容"></el-input>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">初始位置:</el-col>
          <el-col :span="6">
            <el-input v-model="mission_planner_form.location1" placeholder="位置1"></el-input>
          </el-col>
          <el-col :span="6">
            <el-input v-model="mission_planner_form.location2" placeholder="位置2"></el-input>
          </el-col>
          <el-col :span="6">
            <el-input v-model="mission_planner_form.location3" placeholder="位置3"></el-input>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">1号分配比例:</el-col>
          <el-col :span="19">
            <el-slider v-model="mission_planner_form.Distribution_ratio1" show-input :max="100"></el-slider>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">2号分配比例:</el-col>
          <el-col :span="19">
            <el-slider v-model="mission_planner_form.Distribution_ratio2" show-input :max="100"></el-slider>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px">
          <el-col :span="5">3号分配比例:</el-col>
          <el-col :span="19">
            <el-slider v-model="mission_planner_form.Distribution_ratio3" show-input :max="100"></el-slider>
          </el-col>
        </el-row>
        <el-button type="primary" @click="start_mission_planner">开始任务规划</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
  import $ from "jquery";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import "leaflet.pm";
  import "leaflet.pm/dist/leaflet.pm.css";
  import { postApi } from "@/api/request";

  export default {
    name: "leafletMapView",
    data() {
      return {
        //实例化地图
        map: null,
        //绘制图层
        rectangleLayer: "",
        rectangleGeoJson: "",
        //任务规划
        mission_planner_form: {
          number_device: 3,
          scan_density: 20,
          pathsStrictlyInPoly: true,
          mission_layer_point_arr: [],
          obstacle_layer_point_arr: [],
          location1: "",
          location2: "",
          location3: "",
          Distribution_ratio1: 20,
          Distribution_ratio2: 50,
          Distribution_ratio3: 30,
        },
        //任务信息表显示
        mission_planner_form_visible: false,
        //规划完成展示
        Mission_result_polyline_one: null,
        Mission_result_polyline_two: null,
        Mission_result_polyline_three: null,
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
        this.map = L.map("leafletMapView", {
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
        // 任务区信息表
        if (value == 1) {
          this.mission_planner_form_visible = true;
          console.log(this.mission_planner_form);
        }
        //绘制任务区
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

              e.layer._latlngs[0].forEach((item) => {
                let arr = [item.lng, item.lat];
                target.push(arr);
              });
            }
            this.mission_planner_form.mission_layer_point_arr = target;
            this.map.off("pm:create");
          });
        }
        // 绘制障碍区
        if (value == 3) {
          // 设置多边形的颜色
          const polygonOptions = {
            templineStyle: {},
            // the line from the last marker to the mouse cursor
            hintlineStyle: {},
            pathOptions: {
              color: "black",
              fillColor: "grey",
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
              e.layer._latlngs[0].forEach((item) => {
                let arr = [item.lng, item.lat];
                target.push(arr);
              });
            }
            this.mission_planner_form.obstacle_layer_point_arr = target;
            this.map.off("pm:create");
          });
        }
        // 添加起点
        if (value == 4) {
          this.map.on("click", (e) => {
            // 获取点击位置的经纬度并格式化
            const content = `${e.latlng.lng.toFixed(5)},${e.latlng.lat.toFixed(5)}`;

            // 如果三个位置都已经选了，就不再继续赋值
            if (this.mission_planner_form.location1 && this.mission_planner_form.location2 && this.mission_planner_form.location3) {
              return;
            }

            // 根据当前位置为空的字段进行赋值
            if (!this.mission_planner_form.location1) {
              this.mission_planner_form.location1 = content;
            } else if (!this.mission_planner_form.location2) {
              this.mission_planner_form.location2 = content;
            } else if (!this.mission_planner_form.location3) {
              this.mission_planner_form.location3 = content;
            }

            // 创建本地图片的图标
            const customIcon = L.icon({
              iconUrl: require("@/assets/icon/dianti.png"), // 替换为你的图片路径
              iconSize: [32, 32], // 图标的尺寸
              iconAnchor: [16, 32], // 图标的锚点，指示图标的底部中心
              popupAnchor: [0, -32], // 弹出框的偏移
            });

            // 在地图上添加一个标记
            L.marker([e.latlng.lat, e.latlng.lng], { icon: customIcon }).addTo(this.map);
          });
        }

        //地图清除
        if (value == 5) {
          // this.map.removeLayer(this.rectangleLayer);
          //移除除底图外的所有图层
          this.map.eachLayer(function (layer) {
            if (!layer._container || ("" + $(layer._container).attr("class")).replace(/\s/g, "") != "leaflet-layer") {
              layer.remove();
            }
          });
          this.$message({
            type: "success",
            message: "删除所有图层",
          });
        }
      },
      //开始任务规划
      start_mission_planner() {
        this.mission_planner_form_visible = false;
        let header = {
          "Content-Type": "application/json",
          Authorization: "",
          "X-CSRFToken": document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("csrftoken="))
            .split("=")[1], // 添加 CSRF Token
        };
        postApi(`${this.serverURL}/api/start_mission_planner/`, this.mission_planner_form, header).then((res) => {
          if (this.Mission_result_polyline_one) {
            this.Mission_result_polyline_one.remove();
          }
          if (this.Mission_result_polyline_two) {
            this.Mission_result_polyline_two.remove();
          }
          if (this.Mission_result_polyline_three) {
            this.Mission_result_polyline_three.remove();
          }
          const colors = ["#efc452", "red", "blue"];
          debugger;
          for (let index_x = 0; index_x < res.data.result.length; index_x++) {
            const route_arr = res.data.result[index_x];
            let points = [];
            for (let index_y = 0; index_y < route_arr.length; index_y++) {
              let point = [route_arr[index_y][0], route_arr[index_y][1]];
              points.push(point);
            }
            if (index_x == 0) {
              this.Mission_result_polyline_one = L.polyline(points, {
                color: colors[index_x],
              }).addTo(this.map);
            } else if (index_x == 1) {
              this.Mission_result_polyline_two = L.polyline(points, {
                color: colors[index_x],
              }).addTo(this.map);
            } else {
              this.Mission_result_polyline_three = L.polyline(points, {
                color: colors[index_x],
              }).addTo(this.map);
            }
          }
        });
      },
    },
  };
</script>

<style>
  #leafletMapView {
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
