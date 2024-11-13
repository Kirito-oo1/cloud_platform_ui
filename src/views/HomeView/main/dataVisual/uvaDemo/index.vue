<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-07 16:00
 * @Description: 自制无人机数据展示
 * @RosTopicInfo: 
   * /iris_0/stereo_camera/right/image_raw [sensor_msgs/Image]        摄像头
   * /Odometry [nav_msgs/Odometry]                                    里程计（飞机的位置和姿态）
   * /cloud_registered [sensor_msgs/PointCloud2]                      点云
   * /iris_0/mavros/vfr_hud [mavros_msgs/VFR_HUD]                     地面站HUD
   * /iris_0/mavros/imu/data_raw [sensor_msgs/Imu]                    原始IMU
   * /iris_0/mavros/imu/data [sensor_msgs/Imu]                        IMU
   * /path [nav_msgs/Path]                                            轨迹 
   * /diagnostics [diagnostic_msgs/DiagnosticArray]                   mavroos诊断信息
   * /iris_0/mavros/state_std [mavros_msgs/State]                     状态
   * /iris_0/mavros/battery [sensor_msgs/BatteryState]                电池状态
-->

<template>
  <div class="container">
    <div class="display">
      <div class="diagnostics">
        <div class="diagnosticsDisplayBar">
          <!-- 显示诊断信息 -->
          <div v-if="connected" class="diagnostics-info">
            <el-card v-for="(status, index) in formattedDiagnosticsInfo" :key="index" class="diagnostic-card">
              <div slot="header" class="clearfix">
                <span>{{ status.name }}</span>
                <el-tag :type="status.level === 0 ? 'success' : 'danger'" class="status-tag">{{ status.message }}</el-tag>
              </div>
              <el-table :data="status.values" style="width: 100%">
                <el-table-column prop="key" label="名称"></el-table-column>
                <el-table-column prop="value" label="数值"></el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </div>
      <div class="lidar">
        <!-- ros数据展示展示区 -->
        <div class="rosDisplayBar">
          <div id="lidarshow" class="lidarshow">
            <div id="lidar_tag" style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" size="large">激光数据</el-tag>
            </div>
            <!-- mavros状态显示 -->
            <div class="battery-status" style="position: absolute; z-index: 2; top: 10px; right: 150px" v-if="connected">
              <div class="battery-label">
                连接状态：
                <span :style="{ color: mavrosState.connected ? 'green' : 'red' }">
                  {{ mavrosState.connected ? "已连接" : "未连接" }}
                </span>
              </div>
              <div class="battery-label">
                锁定开启：
                <span :style="{ color: mavrosState.connected ? 'green' : 'red' }">
                  {{ mavrosState.connected ? "解锁" : "锁定" }}
                </span>
              </div>
              <div class="battery-label">控制模式：{{ mavrosState.mode }}</div>
            </div>
            <!-- 电池电量显示 -->
            <div class="battery-status" style="position: absolute; z-index: 2; top: 10px; right: 10px" v-if="connected">
              <div class="battery-label">电池电压: {{ batteryNum }}V</div>
            </div>

            <ros3d-viewer
              id="lidarView"
              :ros="ros"
              fixedFrame="/camera_init"
              v-if="connected"
              style="position: relative; z-index: 1"
              :style="{
                width: lidarShowDiv.width + 'px',
                height: lidarShowDiv.height + 'px',
              }"
            >
              <ros3d-axes />
              <ros3d-grid />
              <ros3d-point-cloud2 topic="/cloud_registered" color="#ffffff"></ros3d-point-cloud2>
              <ros3d-path topic="/path" color="#ff0000"></ros3d-path>
            </ros3d-viewer>
          </div>
        </div>
      </div>
      <div class="camera">
        <!-- 相机数据展示区 -->
        <div class="cameraDisplayBar">
          <div class="camerashow">
            <div style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" id="imageOneTag" size="large">相机1</el-tag>
            </div>
            <mjpeg-canvas
              host="192.168.134.128"
              topic="iris_0/stereo_camera/right/image_raw"
              width="310"
              height="300"
              v-if="connected"
              style="position: relative; z-index: 1; width: 100%; height: 100%"
            ></mjpeg-canvas>
          </div>
          <div class="camerashow">
            <div style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" id="imageTwoTag" size="large">姿态球</el-tag>
            </div>
            <div style="display: flex; justify-content: center; align-items: center">
              <flight-indicator :imudata="imudata" v-if="connected" style="position: relative; z-index: 1; width: 270px; height: 270px"></flight-indicator>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="control">
      <div><el-button type="success" round @click="connection()">连接设备</el-button></div>
      <div><el-button type="success" round @click="connection()">起飞</el-button> <el-button type="success" round @click="connection()">降落</el-button></div>
      <div><el-button type="success" round @click="connection()">飞行模式切换</el-button> <el-button type="success" round @click="connection()">开始探索</el-button></div>
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
  //ros相关
  import ROSLIB from "roslib";
  import Ros3dViewer from "vue-ros3djs/src/lib-components/Ros3dViewer.vue";
  import Ros3dGrid from "vue-ros3djs/src/lib-components/Ros3dGrid.vue";
  import Ros3dAxes from "vue-ros3djs/src/lib-components/Ros3dAxes.vue";
  import Ros3dPointCloud2 from "vue-ros3djs/src/lib-components/Ros3dPointCloud2.vue";
  import Ros3dPath from "vue-ros3djs/src/lib-components/Ros3dPath.vue";
  //组件
  import mjpegCanvas from "@/components/mjpegCanvasComponent/index.vue";
  import flightIndicator from "@/components/flightindicatorComponent/index.vue";

  import $ from "jquery";
  import { postApi, getApi, delApi } from "@/api/request";
  export default {
    name: "uavDemo",
    components: { Ros3dViewer, Ros3dGrid, Ros3dAxes, Ros3dPointCloud2, Ros3dPath, mjpegCanvas, flightIndicator },
    data() {
      return {
        ros: null,
        connected: false,
        tagDisplay: "none",
        lidarShowDiv: {
          width: "",
          height: "",
        },
        diagnosticsInfo: {}, // 原始诊断信息
        formattedDiagnosticsInfo: "", // 格式化后的诊断信息
        batteryNum: 0.0,
        mavrosState: {
          connected: false, //连接
          armed: false, //解锁
          mode: "OFFBOARD",
        },
        imudata: {
          orientation: {}, //方向
          angular_velocity: {}, //角速度
          linear_acceleration: {}, //线性加速度
        },

        addEditTitle: "",
        submitPreviewTitle: "",
        dialogAddEditVisible: false,
        filePreviewDrawerVisible: false,
        isFilePreview: null, //提交or文件预览
        defalutValue: {},
        type: null, //新增or查看
        districtList: [],
        projectStatusList: [],
        projectTypeList: [],
      };
    },
    created() {},
    mounted() {},
    methods: {
      //连接
      connection() {
        this.connected = false;
        //标签可视
        this.tagDisplay = "block";
        //ROSview可视
        this.lidarShowDiv.width = $("#lidarshow").width() + 1;
        this.lidarShowDiv.height = $("#lidarshow").height();

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
          this.getRosData();
        });
        this.ros.on("error", () => {
          this.$message({
            type: "error",
            message: "连接失败！",
          });
        });
      },
      //获取数据
      getRosData() {
        //时间
        var diagnostics = new ROSLIB.Topic({
          ros: this.ros,
          name: "/diagnostics",
          messageType: "diagnostic_msgs/DiagnosticArray",
        });
        diagnostics.subscribe((msg) => {
          this.diagnosticsInfo = msg;
          this.formatDiagnosticsInfo(msg);
        });
        //电池数据
        var battery = new ROSLIB.Topic({
          ros: this.ros,
          name: "/iris_0/mavros/battery",
          messageType: "sensor_msgs/BatteryState",
        });
        battery.subscribe((msg) => {
          this.batteryNum = msg.voltage.toFixed(2);
        });
        //mavros状态
        var imu = new ROSLIB.Topic({
          ros: this.ros,
          name: "/iris_0/mavros/state_std",
          messageType: "mavros_msgs/State",
        });
        imu.subscribe((msg) => {
          this.mavrosState = msg;
        });
        //IMU数据
        var imu = new ROSLIB.Topic({
          ros: this.ros,
          name: "/iris_0/mavros/imu/data",
          messageType: "sensor_msgs/Imu",
        });
        imu.subscribe((msg) => {
          this.imudata.angular_velocity = msg.angular_velocity;
          this.imudata.linear_acceleration = msg.linear_acceleration;
          this.imudata.orientation = msg.orientation;
          this.$bus.$emit("IMUdata", this.imudata);
        });
      },

      formatDiagnosticsInfo(diagnostics) {
        this.formattedDiagnosticsInfo = diagnostics.status.map((status) => {
          // 去除前缀 iris_0/mavros:
          let formattedName = status.name.replace(/^iris_0\/mavros:\s*/, "");
          return {
            name: formattedName,
            message: status.message,
            level: status.level,
            values: status.values.map((value) => {
              return {
                key: value.key,
                value: value.value,
              };
            }),
          };
        });
        // console.log("----------diagnosticsInfo", this.diagnosticsInfo);
        // console.log("==========formattedDiagnosticsInfo", this.formattedDiagnosticsInfo);
      },
    },
  };
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
    .display {
      border: 1px solid #aaaaaa;
      border-radius: 16px;
      margin: 5px 10px 0px 10px;
      height: 75%;
      display: flex;
      align-items: center;
      overflow: hidden;
      .diagnostics {
        width: 20%;
        height: 100%;

        .diagnosticsDisplayBar {
          height: 98%;
          width: 100%;
          margin: 3px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .diagnosticsDisplayBar::-webkit-scrollbar {
          display: none; /* 隐藏滚动条 */
        }
      }

      .lidar {
        height: 100%;
        width: 60%;
        .rosDisplayBar {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          .lidarshow {
            width: 98%;
            height: 98%;
            border: 3px solid #7e7e7e;
            border-radius: 5px;
            position: relative;
          }
        }
      }
      .camera {
        height: 100%;
        width: 20%;
        .cameraDisplayBar {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          .camerashow {
            min-width: 95%;
            min-height: 45%;
            border: 3px solid #aaaaaa;
            border-radius: 5px;
          }
        }
      }
    }
    .control {
      margin: 15px 15px 0px 15px;
      border-radius: 16px;
      box-shadow: 0 0 10px 0 #dfdfdf;
      height: 21%;
    }
    .battery-status {
      background-color: rgba(0, 0, 0, 0.6);
      padding: 5px 10px;
      border-radius: 5px;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      z-index: 3;
    }

    .battery-label {
      display: inline-block;
      margin-right: 15px;
    }
  }
</style>
