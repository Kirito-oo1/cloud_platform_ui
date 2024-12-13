<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-12-12 23:43:03
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
          <!-- 显示mavros诊断信息 -->
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
        <!-- mavros数据展示展示区 -->
        <div class="rosDisplayBar">
          <div id="lidarshow" class="lidarshow">
            <div id="lidar_tag" style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" size="large">激光数据</el-tag>
            </div>
            <!-- mavros状态显示 -->
            <div class="battery-status" style="position: absolute; z-index: 2; top: 10px; right: 160px" v-if="connected">
              <div class="battery-label">
                连接状态：
                <span :style="{ color: mavrosState.connected ? 'green' : 'red' }">
                  {{ mavrosState.connected ? "已连接" : "未连接" }}
                </span>
              </div>
              <div class="battery-label">
                锁定开启：
                <span :style="{ color: mavrosState.armed ? 'green' : 'red' }">
                  {{ mavrosState.armed ? "解锁" : "锁定" }}
                </span>
              </div>
              <div class="battery-label">控制模式：{{ mavrosState.mode }}</div>
            </div>
            <!-- 电池电量显示 -->
            <div class="battery-status" style="position: absolute; z-index: 2; top: 10px; right: 10px" v-if="connected">
              <div class="battery-label">电池电压: {{ batteryNum }}V</div>
            </div>

            <ros3d-viewer
              v-if="connected"
              id="lidarView"
              :ros="ros"
              fixedFrame="/camera_init"
              style="position: relative; z-index: 1"
              :style="{
                width: lidarShowDiv.width + 'px',
                height: lidarShowDiv.height + 'px',
              }"
            >
              <ros3d-axes />
              <ros3d-grid />
              <ros3d-point-cloud2 :topic="lidarTopic" :max_pts="ros3dpocldOptinon.max_pts" :particleSize="ros3dpocldOptinon.particleSize" color="#ffffff"></ros3d-point-cloud2>
              <ros3d-path :topic="pathTopic" color="#ff0000"></ros3d-path>
            </ros3d-viewer>
          </div>
        </div>
      </div>
      <div class="camera">
        <!-- 相机数据展示区 -->
        <div class="cameraDisplayBar">
          <div class="camerashow">
            <div style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" id="imageOneTag" size="large">摄像头</el-tag>
            </div>
            <mjpeg-canvas :host="cameraHost" :topic="cameraTopic" width="310" height="300" v-if="connected" style="position: relative; z-index: 1; width: 100%; height: 100%"></mjpeg-canvas>
          </div>
          <div class="camerashow">
            <div style="position: absolute; z-index: 2" :style="{ display: tagDisplay }">
              <el-tag effect="dark" id="imageTwoTag" size="large">姿态球</el-tag>
            </div>
            <div style="display: flex; justify-content: center; align-items: center">
              <flight-indicator :imudata="imudata" style="position: relative; z-index: 1; width: 270px; height: 270px"></flight-indicator>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="control">
      <el-row class="row-control">
        <!-- 添加设备 -->
        <el-col :span="2" class="row-control-button">
          <el-button type="success" icon="el-icon-circle-plus" @click="connection()" style="margin: 2px 2px 0px 2px; border-radius: 10px">连接设备</el-button>
          <el-button type="primary" icon="el-icon-caret-right" @click="controlUVA(1)" style="margin: 2px 2px 0px 2px; border-radius: 10px">起&emsp;&emsp;飞</el-button>
          <el-button type="danger" icon="el-icon-caret-left" @click="controlUVA(2)" style="margin: 2px 2px 0px 2px; border-radius: 10px">降&emsp;&emsp;落</el-button>
          <el-button type="warning" icon="el-icon-share" @click="controlUVA(3)" style="margin: 2px 2px 0px 2px; border-radius: 10px">模式切换</el-button>
        </el-col>
        <!-- 信息列表 -->
        <el-col :span="15" class="row-control-button">
          <el-table :data="equDataList" v-loading="tableLoading" stripe border style="width: 100%; overflow-y: hidden" height="170">
            <el-table-column prop="name" label="设备名称" width="150"></el-table-column>
            <el-table-column prop="type" label="设备类型" width="100"></el-table-column>
            <el-table-column prop="model" label="设备型号" width="150"></el-table-column>
            <el-table-column label="设备状态" width="80">
              <template slot-scope="scope">
                <span> <el-switch v-model="scope.row.connect" disabled active-color="#13ce66" inactive-color="#ff4949"> </el-switch></span>
              </template>
            </el-table-column>
            <el-table-column prop="rosIp" label="设备IP" width="200"></el-table-column>
            <el-table-column prop="lng" label="经度" width="100"></el-table-column>
            <el-table-column prop="lat" label="纬度" width="100"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button @click.native.prevent="handleRefrsh(scope.row)" type="text" size="medium" style="color: purple">刷新</el-button>
                <el-button @click.native.prevent="handleConnect(scope.row)" :disabled="!scope.row.connect" type="text" size="medium" style="color: red">连接</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 小车速度图表 -->
        <el-col :span="5" class="row-control-button"> 图表 </el-col>
      </el-row>
    </div>
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
        ros3dpocldOptinon: {
          max_pts: 1000000,
          particleSize: 0.3,
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
        equDataList: [
          {
            id: "as1234sda123r",
            name: "首师大室内无人机",
            connect: false,
            type: "无人机",
            model: "PX4-Mavros",
            lng: 116.405289,
            lat: 39.904987,
            rosIp: "ws://192.168.134.128:9090",
            rosNodes: [
              { nodeName: "/diagnostics", nodeType: "diagnostic_msgs/DiagnosticArray" },
              { nodeName: "/iris_0/mavros/battery", nodeType: "sensor_msgs/BatteryState" },
              { nodeName: "/iris_0/mavros/state_std", nodeType: "mavros_msgs/State" },
              { nodeName: "/iris_0/mavros/imu/data", nodeType: "sensor_msgs/Imu" },
              { nodeName: "/cloud_registered", nodeType: "sensor_msgs/PointCloud2" },
              { nodeName: "/path", nodeType: "nav_msgs/Path" },
              { nodeName: "iris_0/stereo_camera/right/image_raw", nodeType: "sensor_msgs/Image" },
            ],
          },
          {
            id: "143rasdwtfb",
            name: "DJI_Mavic_3E",
            connect: false,
            type: "无人机",
            model: "大疆Mavic3E",
            lng: 116.405289,
            lat: 39.904987,
            rosIp: "ws://192.168.134.189:9090",
            rosNodes: [
              { nodeName: "节点A", nodeType: "执行器" },
              { nodeName: "节点B", nodeType: "传感器" },
            ],
          },
          {
            id: "123fas123ds",
            name: "轻舟机器人",
            connect: false,
            type: "无人车",
            model: "CUN01",
            lng: 116.405289,
            lat: 39.904987,
            rosIp: "ws://192.168.134.190:9090",
            rosNodes: [
              { nodeName: "节点A", nodeType: "执行器" },
              { nodeName: "节点B", nodeType: "传感器" },
            ],
          },
        ],
        lidarTopic: "",
        pathTopic: "",
        cameraHost: "",
        cameraTopic: "",
        tableLoading: false,
      };
    },
    created() {},
    mounted() {},
    methods: {
      //刷新设备状态
      handleRefrsh(equipment) {
        this.tableLoading = true;
        this.connected = false;
        //初始化
        // 清除当前设备的数据和连接状态
        this.diagnosticsInfo = {};
        this.formattedDiagnosticsInfo = "";
        this.batteryNum = 0.0;
        this.mavrosState = { connected: false, armed: false, mode: "OFFBOARD" };
        this.imudata = { orientation: {}, angular_velocity: {}, linear_acceleration: {} };
        this.lidarTopic = "";
        this.pathTopic = "";
        this.cameraTopic = "";
        // 断开当前连接
        if (this.ros) this.ros.close();

        // 设置5秒超时
        let timeout = setTimeout(() => {
          console.log("Connection timeout");
          if (this.ros) this.ros.close();
        }, 5000);
        this.ros = new ROSLIB.Ros({ url: equipment.rosIp });
        this.ros.on("connection", () => {
          this.$message.success("连接成功!");
          clearTimeout(timeout); // 连接成功，清除超时
          this.tableLoading = false;
          this.equDataList.forEach((item) => {
            if (item.id == equipment.id) {
              equipment.connect = true;
            }
          });
        });
        this.ros.on("error", () => {
          this.$message.error("连接失败!");
          clearTimeout(timeout); // 连接失败，清除超时
          this.tableLoading = false;
          this.equDataList.forEach((item) => {
            if (item.id == equipment.id) {
              equipment.connect = false;
            }
          });
        });
      },
      //连接
      handleConnect(equipment) {
        if (equipment.connect) {
          this.connected = true;
          //标签可视
          this.tagDisplay = "block";
          //ROSview可视
          this.lidarShowDiv.width = $("#lidarshow").width() + 1;
          this.lidarShowDiv.height = $("#lidarshow").height();
          //摄像头IP
          this.cameraHost = equipment.rosIp.replace(/^ws:\/\/([^:]+):\d+$/, "$1");
          this.getRosData(equipment.rosNodes);
        }
      },
      //获取数据
      getRosData(nodes) {
        nodes.forEach((node) => {
          //诊断数据
          if (node.nodeType == "diagnostic_msgs/DiagnosticArray") {
            var diagnostics = new ROSLIB.Topic({
              ros: this.ros,
              name: node.nodeName,
              messageType: node.nodeType,
            });
            diagnostics.subscribe((msg) => {
              this.diagnosticsInfo = msg;
              this.formatDiagnosticsInfo(msg);
            });
          }
          //电池数据
          if (node.nodeType == "sensor_msgs/BatteryState") {
            var battery = new ROSLIB.Topic({
              ros: this.ros,
              name: node.nodeName,
              messageType: node.nodeType,
            });
            battery.subscribe((msg) => {
              this.batteryNum = msg.voltage.toFixed(2);
            });
          }
          //mavros状态
          if (node.nodeType == "mavros_msgs/State") {
            var imu = new ROSLIB.Topic({
              ros: this.ros,
              name: node.nodeName,
              messageType: node.nodeType,
            });
            imu.subscribe((msg) => {
              this.mavrosState = msg;
            });
          }
          //IMU数据
          if (node.nodeType == "sensor_msgs/Imu") {
            var imu = new ROSLIB.Topic({
              ros: this.ros,
              name: node.nodeName,
              messageType: node.nodeType,
            });
            imu.subscribe((msg) => {
              this.imudata.angular_velocity = msg.angular_velocity;
              this.imudata.linear_acceleration = msg.linear_acceleration;
              this.imudata.orientation = msg.orientation;
              this.$bus.$emit("IMUdata", this.imudata);
            });
          }
          //点云数据
          if (node.nodeType == "sensor_msgs/PointCloud2") {
            this.lidarTopic = node.nodeName;
          }
          //路径数据
          if (node.nodeType == "nav_msgs/Path") {
            this.pathTopic = node.nodeName;
          }
          //摄像头数据
          if (node.nodeType == "sensor_msgs/Image") {
            this.cameraTopic = node.nodeName;
          }
        });
      },
      // 格式化诊断信息
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
      },
      //控制
      controlUVA(type) {
        if (type == 1) {
          var cmd_vel_listener = new ROSLIB.Topic({
            ros: this.ros,
            name: "/cmd_vel",
            messageType: "geometry_msgs/Twist",
          });

          var twist = new ROSLIB.Message({
            linear: {
              x: 0.5,
              y: 0,
              z: 0,
            },
            angular: {
              x: 0,
              y: 0,
              z: 0,
            },
          });
          cmd_vel_listener.publish(twist);
        } else if (type == 2) {
        }
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
      width: 100%;
      .row-control {
        width: 100%;
      }
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
