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
        <!-- 地图及相关操作 -->
        <!-- 地图容器 -->
        <map-view></map-view>
        <!-- <el-col :span="16" class="colone" style="padding-left: 0px">
          <div class="rowmap">
            <div id="RealMap" style="position: relative; z-index: 1"></div>
            <div style="width: 400px; height: 100px; position: absolute; z-index: 2; right: 0; top: 0; text-align: right">
              <el-button-group v-show="isCollectShow">
                <el-tooltip content="绘制任务区" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-edit" @click="draw_mission_area"></el-button>
                </el-tooltip>
                <el-tooltip content="绘制障碍区" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-s-release" @click="draw_obstacle_area"></el-button>
                </el-tooltip>
                <el-tooltip content="任务信息表" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-s-data" @click="set_mission_planner_form"></el-button>
                </el-tooltip>
                <el-tooltip content="添加起点" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-s-promotion" @click="add_starting_point"></el-button>
                </el-tooltip>
                <el-tooltip content="取消绘制" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-close" @click="disdraw"></el-button>
                </el-tooltip>
                <el-tooltip content="加载任务区" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-folder-add" @click="loadmissionPolygon"></el-button>
                </el-tooltip>
                <el-tooltip content="删除所有图层" placement="bottom" effect="light">
                  <el-button type="primary" icon="el-icon-delete" @click="ClearAllLayer"></el-button>
                </el-tooltip>
              </el-button-group>
            </div>
          </div>
        </el-col> -->
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
    <div class="control"><el-button @click="connection()" circle icon="el-icon-check"></el-button></div>
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
  import { postApi, getApi, delApi } from "@/api/request";
  export default {
    name: "",
    components: { Ros3dViewer, Ros3dGrid, Ros3dAxes, Ros3dLaserScan, Ros3dPointCloud2, Ros3dPath, mapView },
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
          //url: "ws://" + this.car_one_ip + ":9090",
          //url: "ws://"+this.car_one_ip+":9090",
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

        //接收ros发布的image topic2
        var viewerTwo = new MJPEGCANVAS.Viewer({
          divID: "mjpegTwo",
          host: this.car_one_ip,
          width: 330,
          height: 250,
          topic: this.imageTwo_topic,
          interval: 200,
          quality: 200,
        });

        //其他话题数据
        //  * /Odometry [nav_msgs/Odometry]里程计（飞机的位置）
        //  * /clock [rosgraph_msgs/Clock]
        //  * /cloud_registered [sensor_msgs/PointCloud2]点云
        //  * /diagnostics [diagnostic_msgs/DiagnosticArray]mavroos诊断信息 -- 叠加地图显示
        //  * /iris_0/mavros/altitude [mavros_msgs/Altitude]姿态 -- https://sebmatton.github.io/flightindicators/
        //  * /iris_0/mavros/battery [sensor_msgs/BatteryState]电池状态
        //  * /iris_0/mavros/global_position/global [sensor_msgs/NavSatFix]全局位置
        //  * /iris_0/mavros/imu/data [sensor_msgs/Imu]IMU
        //  * /iris_0/mavros/imu/data_raw [sensor_msgs/Imu]原始IMU
        //  * /iris_0/mavros/imu/mag [sensor_msgs/MagneticField]磁罗盘
        //  * /iris_0/mavros/local_position/odom [nav_msgs/Odometry]自身位置
        //  * /iris_0/mavros/state [mavros_msgs/State]状态
        //  * /iris_0/mavros/sys_status [mavros_msgs/SysStatus]飞控状态
        //  * /iris_0/mavros/vfr_hud [mavros_msgs/VFR_HUD]地面站HUD
        //  * /iris_0/stereo_camera/right/image_raw [sensor_msgs/Image]摄像头
        //  * /iris_0/velodyne_points [sensor_msgs/PointCloud2]激光雷达原始点云
        //  * /planning/pos_cmd [quadrotor_msgs/PositionCommand]规划算法输出轨迹
        // var imu = new ROSLIB.Topic({
        //   ros: this.ros,
        //   name: "/iris_0/mavros/imu/data",
        //   messageType: "sensor_msgs/Imu",
        // });
        var battery = new ROSLIB.Topic({
          ros: this.ros,
          name: "/iris_0/mavros/altitude",
          messageType: "mavros_msgs/Altitude",
        });

        // imu.subscribe((msg) => {
        //   console.log("IMUdata========", msg);
        // });
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
