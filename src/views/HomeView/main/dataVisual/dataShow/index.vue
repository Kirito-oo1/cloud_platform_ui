<template>
  <div class="container">
    <div class="display">
      <div class="camera">
        <!-- 相机数据展示区 -->
        <div class="cameraDisplayBar">
          <div class="camerashow" :style="{ 'max-width': max_widthLeft + 'px' }">
            <div id="camera_one_tag" style="position: absolute; display: none; z-index: 2">
              <el-tag effect="dark" id="imageOneTag" size="large">相机1</el-tag>
            </div>
            <div id="mjpegOne" style="width: 100%; height: 100%; position: relative; z-index: 1"></div>
          </div>
          <div class="camerashow" :style="{ 'max-width': max_widthLeft + 'px' }">
            <div id="camera_two_tag" style="position: absolute; display: none; z-index: 2">
              <el-tag effect="dark" id="imageTwoTag" size="large">相机2</el-tag>
            </div>
            <div id="mjpegTwo" style="width: 100%; height: 100%; position: relative; z-index: 1"></div>
          </div>
        </div>
      </div>
      <div class="map">
        <!-- 地图相关操作 -->
        <div class="map-tool-menu">
          <map-tool-menu style="z-index: 2"></map-tool-menu>
        </div>
        <!-- 地图容器 -->
        <map-view style="z-index: 1"></map-view>
      </div>
      <div class="lidar">
        <!-- 激光数据展示展示区 -->
        <div class="lidarDisplayBar">
          <div class="lidarshow" id="ros_Display" :style="{ 'max-width': max_widthRight + 'px' }" style="background-size: cover">
            <div id="lidar_tag" style="position: absolute; display: none; z-index: 2">
              <el-tag effect="dark" size="large">激光数据</el-tag>
            </div>
            <ros3d-viewer
              id="lidarView"
              :ros="ros"
              fixedFrame="/world"
              v-if="connected"
              style="position: relative; z-index: 1"
              :style="{
                width: ros_DisplayWidth + 'px',
                height: ros_DisplayHeight + 'px',
              }"
            >
              <!-- <ros3d-axes /> -->
              <!-- <ros3d-grid /> -->
              <!-- <ros3d-path topic="/Odometry_ugv0"></ros3d-path> -->
              <!-- <ros3d-laser-scan topic="/scan"></ros3d-laser-scan> -->
              <ros3d-point-cloud2 topic="/cloud_registered" color="#ffffff"></ros3d-point-cloud2>
              <!-- <ros3d-point-cloud2 :topic="Lidar_topic1" :color="Lidar_Point_Color1"></ros3d-point-cloud2> -->
              <!-- <ros3d-point-cloud2 :topic="Lidar_topic2" :color="Lidar_Point_Color2"></ros3d-point-cloud2> -->
            </ros3d-viewer>
          </div>
        </div>
      </div>
    </div>
    <div class="control">
      <el-row class="row-DeviceConnection">
        <!-- 添加设备 -->
        <el-col :span="2" class="row-DeviceConnectionButton">
          <el-button type="success" icon="el-icon-circle-plus" @click="dialog = true" style="margin: 2px">添加设备</el-button>
          <el-button type="primary" icon="el-icon-caret-right" @click="sendA" style="margin: 2px">启动监测</el-button>
          <el-button type="danger" icon="el-icon-caret-left" @click="stopA" style="margin: 2px">停止监测</el-button>
          <el-button type="warning" icon="el-icon-share" @click="connection" style="margin: 2px" :disabled="ConnectAble">连接小车</el-button>
        </el-col>
        <!-- 信息列表 -->
        <el-col :span="13" class="row-DeviceConnectionButton">
          <el-table :data="tableData_monitor" style="width: 100%" max-height="250">
            <el-table-column fixed prop="EquipmentType" label="设备类型" width="80"></el-table-column>
            <el-table-column prop="EquipmentModel" label="设备型号" width="80"></el-table-column>
            <el-table-column prop="EquipmentIP" label="设备IP" width="80"></el-table-column>
            <el-table-column prop="TaskName" label="任务名称" width="80"></el-table-column>
            <el-table-column prop="Operators" label="作业人员" width="80"></el-table-column>
            <el-table-column prop="longitude" label="经度" width="120"></el-table-column>
            <el-table-column prop="latitude" label="纬度" width="120"></el-table-column>
            <el-table-column prop="height" label="高度" width="120"></el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
              <template slot-scope="scope">
                <el-button @click.native.prevent="deleteRow(scope.$index, tableData_monitor)" type="text" size="medium">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 遥控 -->
        <el-col :span="3">
          遥控
          <div id="zone_joystick" style="position: relative; margin-top: 90px"></div>
        </el-col>
        <!-- x小车速度图表 -->
        <el-col :span="5" class="row-DeviceConnectionButton">
          <div id="echartSpeed" style="width: 100%; height: 100%"></div>
          <!-- <el-row :gutter="18">
                    <div style="margin-top: 20px">
                        <span class="tag-group__title">任务完成度</span>
                        <el-tag style="margin-left: 20px" effect="dark">UAV1</el-tag>
                        <el-tag style="margin-left: 20px" type="success" effect="dark">UAV2</el-tag>
                        <el-tag style="margin-left: 20px" type="warning" effect="dark">UAV3</el-tag>
                    </div>
                </el-row>
                <el-row :gutter="18">
                    <el-progress :text-inside="true" :stroke-width="20" :percentage="10" style="margin: 20px"></el-progress>
                    <el-progress :text-inside="true" :stroke-width="20" :percentage="10" style="margin: 20px" status="success"></el-progress>
                    <el-progress :text-inside="true" :stroke-width="20" :percentage="10" style="margin: 20px" status="warning"></el-progress>
        </el-row>-->
        </el-col>
      </el-row>
    </div>
    <!-- 新增 -->
    <!-- <div v-if="dialogAddEditVisible">
      <el-dialog width="50%" :title="addEditTitle" :visible.sync="dialogAddEditVisible">
        <addEditPop @closePop="closePop" :type="type" :id="id" :districtList="districtList" :projectTypeList="projectTypeList"></addEditPop>
      </el-dialog>
    </div> -->
    <!-- 提交文件/文件预览 -->
    <!-- <div v-if="filePreviewDrawerVisible">
      <el-drawer :append-to-body="true" :title="submitPreviewTitle" :visible.sync="filePreviewDrawerVisible" direction="rtl" size="80%">
        <filePreviewDrawer @closePop="closePop" :id="id" :defalutValue="defalutValue" :isFilePreview="isFilePreview" :projectStatusList="projectStatusList"></filePreviewDrawer>
      </el-drawer>
    </div> -->
  </div>
</template>

<script>
  import $ from "jquery";
  //ros3d相关
  import ROSLIB from "roslib";
  import Ros3dViewer from "vue-ros3djs/src/lib-components/Ros3dViewer.vue";
  import Ros3dGrid from "vue-ros3djs/src/lib-components/Ros3dGrid.vue";
  import Ros3dAxes from "vue-ros3djs/src/lib-components/Ros3dAxes.vue";
  import Ros3dLaserScan from "vue-ros3djs/src/lib-components/Ros3dLaserScan.vue";
  import Ros3dPointCloud2 from "vue-ros3djs/src/lib-components/Ros3dPointCloud2.vue";
  import Ros3dPath from "vue-ros3djs/src/lib-components/Ros3dPath.vue";
  //组件
  import mapView from "@/components/mapComponent/index.vue";
  import mapToolMenu from "@/components/mapToolMenu/index.vue";
  import { postApi, getApi, delApi } from "@/api/request";
  export default {
    name: "",
    components: { Ros3dViewer, Ros3dGrid, Ros3dAxes, Ros3dLaserScan, Ros3dPointCloud2, Ros3dPath, mapView, mapToolMenu },
    data() {
      return {
        addEditTitle: "",
        submitPreviewTitle: "",
        dialogAddEditVisible: false,
        submitRecordsDrawerVisible: false,
        filePreviewDrawerVisible: false,
        isFilePreview: null, //提交or文件预览
        id: null,
        defalutValue: {},
        type: null, //新增or查看
        districtList: [],
        projectStatusList: [],
        projectTypeList: [],

        max_widthLeft: "200",
        max_widthRight: "200",
        ros_DisplayWidth: "",
        ros_DisplayHeight: "",
        ros: null,
        connected: false,
      };
    },
    created() {},
    mounted() {},
    methods: {
      //连接小车
      connection() {
        //相机标签可视
        $("#camera_one_tag").css("display", "block");
        $("#camera_two_tag").css("display", "block");
        //激光标签可视
        $("#lidar_tag").css("display", "block");

        window.onresize = function () {
          this.max_widthRight = $("#cameraDisplayBar").width() - 20;
          this.max_widthLeft = $("#lidarDisplayBar").width() - 20;
        };
        this.ros_DisplayWidth = $("#ros_Display").width();
        this.ros_DisplayHeight = $("#ros_Display").height();

        this.ros = new ROSLIB.Ros({
          //需改成小车的ip
          //url: "ws://" + this.form.EquipmentIP + ":9090",
          url: "ws://192.168.134.128:9090",
        });
        this.ros.on("connection", () => {
          this.connected = true;
          this.$message({
            type: "success",
            message: "连接成功",
          });
          // this.createJoystick();
        });
        this.ros.on("error", () => {
          this.$message({
            type: "error",
            message: "连接失败！",
          });
        });

        //接收ros发布的image topic1
        var viewerOne = new MJPEGCANVAS.Viewer({
          divID: "mjpegOne",
          host: "192.168.134.128",
          // host: this.car_one_ip,
          width: 330,
          height: 250,
          // topic: "/kinect2/qhd/image_color_rect",
          topic: "iris_0/stereo_camera/right/image_raw",
          // topic: this.imageOne_topic,
          interval: 200,
          quality: 200,
        });
        var battery = new ROSLIB.Topic({
          ros: this.ros,
          name: "/iris_0/mavros/altitude",
          messageType: "mavros_msgs/Altitude",
        });
        battery.subscribe((msg) => {
          console.log("Batterydata========", msg);
        });
      },
    },
  };
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    position: relative;
    .display {
      border: 3px solid #dfe4ed;
      height: 70%;
      display: flex;
      align-items: center;
      overflow: hidden;
      .camera {
        height: 100%;
        width: 25%;
        .cameraDisplayBar {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          .camerashow {
            min-width: 350px;
            min-height: 250px;
            border: 3px solid #dfe4ed;
            border-radius: 5px;
            padding: 10px;
            padding-top: 10px;
          }
        }
      }
      .map {
        height: 100%;
        width: 40%;
        position: relative;
        .map-tool-menu {
          position: absolute;
          top: 80px;
          left: 12px;
          width: 30px;
          height: 300px;
        }
      }
      .lidar {
        height: 100%;
        width: 35%;
        .lidarDisplayBar {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          .lidarshow {
            min-width: 530px;
            min-height: 500px;
            border: 3px solid #dfe4ed;
            border-radius: 5px;
            padding-left: 10px;
            padding-top: 10px;
          }
        }
      }
    }
    .control {
      border: 3px solid #dfe4ed;
      height: 30%;
      width: 100%;
      .row-DeviceConnection {
        background-color: white;
        border: 1px solid #dfe4ed;
        height: 95%;
        margin: 5px !important;
        border: 1px solid #dfe4ed;
        box-shadow: 0px 0px 2px 2px lightgrey;
        .row-DeviceConnectionButton {
          overflow: auto;
          background-color: white;
          height: 100%;
          margin: 1px 1px 1px 1px !important;
          border: 2px solid #dfe4ed;
          box-shadow: 0px 0px;
        }
      }
    }

    /deep/.el-dialog__wrapper {
      top: 0px !important;
    }
    .el-dialog__body {
      max-height: 750px;
      overflow: auto;
    }
  }
</style>
