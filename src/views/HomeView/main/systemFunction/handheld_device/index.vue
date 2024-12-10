 <!-- DeviceData.vue -->
<template>
  <div class="container">
    <div class="map-container">

      <leaflet-map-view style="z-index: 1"></leaflet-map-view>
    </div>
   
    <div class="controls">
      <input v-model="port" placeholder="输入端口号" />
      <button @click="fetchDeviceData">获取设备数据</button>
      <button @click="showModal = true">显示/隐藏设备表格</button>
      <button @click="toggleDevicesOnMap">显示/隐藏设备位置</button>
      <button @click="openExternalPage">打开nps管理端</button>
      <button @click="fetchFolders">获取设备文件列表</button>
    </div>

    <!-- 设备信息模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>

        <h2>设备信息</h2>

        <button @click="showAddDeviceModal = true">添加设备</button>

        <table>
          <tr>
            <th>选择</th>
            <th>型号</th>
            <th>卫星</th>
            <th>经度</th>
            <th>纬度</th>
            <th>高度</th>
            <th>同步状态</th>
            <th>系统温度</th>
            <th>RTK状态</th>
            <th>持续时间</th>
            <th>控制点数量</th>
            <th>Cors 状态</th>
            <th>设备存储</th>
            <th>许可日期</th>
            <th>版本</th>
          </tr>
          <tr v-for="device in devices" :key="device.model">
            <td>
              <input
                type="checkbox"
                v-model="selectedDevices"
                :value="device._id"
              />
            </td>
            <td>{{ device.model }}</td>
            <td>{{ device.satellite }}</td>
            <td>{{ device.longitude }}</td>
            <td>{{ device.latitude }}</td>
            <td>{{ device.elevation }}</td>
            <td>{{ device.syncStatus }}</td>
            <td>{{ device.LidarT }}</td>
            <td>{{ device.RTKstate }}</td>
            <td>{{ device.Duration }}</td>
            <td>{{ device.Controlpoints }}</td>
            <td>{{ device.NtripStatus }}</td>
            <td>{{ device.Devicestorage }}</td>
            <td>{{ device.Licenseuntil }}</td>
            <td>{{ device.Version }}</td>
          </tr>
        </table>

        <button @click="deleteSelectedDevices">删除选中设备</button>
      </div>
    </div>

    <!-- 添加设备模态框 -->
    <div v-if="showAddDeviceModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddDeviceModal = false">&times;</span>

        <h2>添加设备</h2>

        <form @submit.prevent="addDevice">
          <label for="model">型号:</label>
          <input v-model="newDevice.model" id="model" required />

          <label for="satellite">卫星:</label>
          <input v-model="newDevice.satellite" id="satellite" />

          <label for="longitude">经度:</label>
          <input v-model="newDevice.longitude" id="longitude" />

          <label for="latitude">纬度:</label>
          <input v-model="newDevice.latitude" id="latitude" />

          <label for="elevation">高度:</label>
          <input v-model="newDevice.elevation" id="elevation" />

          <label for="syncStatus">同步状态:</label>
          <input v-model="newDevice.syncStatus" id="syncStatus" />

          <!-- 添加更多字段 -->

          <button type="submit">添加设备</button>
        </form>
      </div>
    </div>

    <!-- 设备文件列表模态框 -->
    <div v-if="showFoldersModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showFoldersModal = false">&times;</span>
        <h2>设备文件列表</h2>
        <ul>
          <li v-for="folder in folders" :key="folder">
            <input type="radio" :value="folder" v-model="selectedFolder" />
            {{ folder }}
          </li>
        </ul>
        <button @click="downloadFolder">下载选定的文件夹</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
//import JSZip from "jszip";
import FileSaver from "file-saver";
//import * as Cesium from 'cesium';
import leafletMapView from "@/components/mapComponent/leafLetMap/index.vue"
//var Cesium = require("cesium/Cesium");
export default {
  components:{
    leafletMapView
  },
  data() {
    return {
      port: "",
      devices: [], // 存储设备数据
      viewer: null,
      deviceEntities: [], // 存储设备点的实体对象
      devicesVisible: false, // 控制设备点是否可见
      viewerInitialized: false, // 标志 Viewer 是否已初始化

      selectedDevices: [], // 存储选中的设备 ID
      showModal: false, // 控制设备信息模态框的显示与隐藏
      showAddDeviceModal: false, // 控制添加设备模态框的显示与隐藏
      showFoldersModal: false, // 控制文件夹列表模态框的显示
      newDevice: {
        model: "",
        satellite: "",
        longitude: "",
        latitude: "",
        elevation: "",
        syncStatus: "",
        // 添加更多字段
      },
      folders: [], // 用于存储文件夹名称
      selectedFolder: "", // 用户选定的文件夹
    };
  },

  async mounted() {
    await this.fetchFolders(); // 获取文件夹列表
  },

  methods: {
    // 切换表格显示/隐藏
    toggleTable() {
      this.showTable = !this.showTable;
      if (this.showTable && this.devices.length === 0) {
        this.fetchDevices();
      }
    },
    // 打开外部页面
    openExternalPage() {
      window.open("http://47.96.137.124:8080/index", "_blank");
    },
    // 获取设备信息
    async fetchDevices() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/get-all-devices"
        );
        this.devices = response.data.devices;
      } catch (error) {
        console.error("获取设备数据失败:", error);
        window.alert("警告！获取设备数据失败");
      }
    },

    // 获取设备信息的方法
    async fetchDeviceData() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/fetch-device-data",
          {
            params: { port: this.port },
          }
        );
        this.devices.push(response.data.device);
        const deviceData = response.data.device;
        const existingDeviceIndex = this.devices.findIndex(
          (device) => device.model === deviceData.model
        );

        console.log("成功获取数据");

        // 如果设备已存在，更新设备数据
        if (existingDeviceIndex !== -1) {
          this.devices[existingDeviceIndex] = deviceData;
          console.log("设备数据已更新");
          window.alert("设备数据已更新");
        } else {
          this.devices.push(deviceData);
          console.log("设备数据已插入");
          window.alert("设备数据已插入");
        }
      } catch (error) {
        console.error("获取设备数据失败:", error);
        window.alert("警告！获取设备数据失败");
      }
    },
    async addDevice() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/add-device",
          this.newDevice
        );
        this.devices.push(response.data.device);
        this.showAddDeviceModal = false;
        console.log("设备已添加");
        window.alert("设备已添加");
      } catch (error) {
        console.error("添加设备失败:", error);
      }
    },

    async deleteSelectedDevices() {
      try {
        await axios.post("http://localhost:3000/api/delete-devices", {
          deviceIds: this.selectedDevices,
        });
        this.devices = this.devices.filter(
          (device) => !this.selectedDevices.includes(device._id)
        );
        this.selectedDevices = [];
        console.log("选中设备已删除");
      } catch (error) {
        console.error("删除设备失败:", error);
      }
    },

    async toggleDevicesOnMap() {
      if (!this.viewerInitialized) {
        console.error("Viewer 未初始化。");
        return;
      }

      if (this.devicesVisible) {
        // 移除设备点
        this.deviceEntities.forEach((entity) => {
          this.viewer.entities.remove(entity);
        });
        this.deviceEntities = [];
      } else {
        // 从后端获取所有设备数据
        try {
          const response = await axios.get(
            "http://localhost:3000/api/get-all-devices"
          );
          this.devices = response.data.devices;

          // 在地图上显示所有设备
          this.devices.forEach((device) => {
            const entity = this.viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                parseFloat(device.longitude),
                parseFloat(device.latitude),
                parseFloat(device.elevation) || 0
              ),
              point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
              },
              label: {
                text: device.model,
                font: "14pt monospace",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9),
              },
            });
            this.deviceEntities.push(entity);
          });

          console.log("所有设备点已成功显示在地图上");
          window.alert("所有设备点已成功显示在地图上");
        } catch (error) {
          console.error("获取所有设备数据失败:", error);
          window.alert("警告！获取设备数据失败");
        }
      }

      this.devicesVisible = !this.devicesVisible;
    },
    // 获取文件夹列表
    async fetchFolders() {
      if (!this.port) {
        window.alert("请输入端口号");
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3000/api/get-folders`,
          {
            params: { port: this.port },
          }
        );
        this.folders = response.data.folders;
        this.showFoldersModal = true; // 显示模态框
      } catch (error) {
        console.error("获取文件夹列表失败:", error);
        window.alert("警告！获取文件夹列表失败");
      }
    },

    // 下载选定的文件夹

    // 下载选定的文件夹
    //  async downloadFolder() {
    //       if (!this.selectedFolder) {
    //         alert("请选择一个文件夹");
    //         return;
    //       }

    //       // const downloadUrl = `http://47.96.137.124:11484/20240711064136`;
    //       const downloadUrl = `http://47.96.137.124:${this.port}/api/download-folder`;

    //       try {
    //         const response = await axios.post(
    //           downloadUrl,
    //           { folder: this.selectedFolder },
    //           { responseType: "blob" }
    //         );
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute("download", `${this.selectedFolder}.zip`);
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //       } catch (error) {
    //         console.error("下载文件夹失败:", error);
    //         alert("下载文件夹失败");
    //       }
    //     },

    async downloadFolder() {
      console.log("Downloading folder:", this.selectedFolder);

      if (!this.selectedFolder) {
        window.alert("请选择一个文件夹");
        return;
      }

      if (!this.port) {
        window.alert("请输入端口号");
        return;
      }

      const downloadUrl = `http://localhost:3000/api/download-folder`;

      try {
        const response = await axios.post(
          downloadUrl,
          { port: this.port, folder: this.selectedFolder },
          { responseType: "blob" }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${this.selectedFolder}.zip`);
        document.body.appendChild(link);
        link.click();
        // 移除下载链接
        document.body.removeChild(link);
      } catch (error) {
        console.error("下载文件夹失败:", error);
        window.alert("警告！下载文件夹失败");
      }
    },
  },

  mounted() {
    // this.initializeViewer();

    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlZWIxOWVkNi0wNmVhLTQwNDEtODE4Ny02NTE0Y2YyNWZiZjkiLCJpZCI6MTM3NDA0LCJpYXQiOjE2ODM2NDEzNjN9.Ei9ndNnuCP9aK1kz5A04UetndSEDYJrNvh56hIcFB3g";

    this.viewer = new Cesium.Viewer(this.$refs.cesiumContainer, {
      sceneModePicker: true,
      baseLayerPicker: true,
      timeline: false,
      animation: false,
      fullscreenButton: false,
      vrButton: false,
      infoBox: false,
      selectionIndicator: false,
      homeButton: false,
      geocoder: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      showRenderLoopErrors: false,
      creditContainer: document.createElement("div"),

      // 地形服务
      terrainProvider: Cesium.createWorldTerrain({
        requestVertexNormals: true, //开启地形光照
        requestWaterMask: true, // 开启水面波纹
      }),
    });

    this.viewerInitialized = true; // 设置标志，表示 Viewer 已初始化

    const setView = () => {
      const destination = Cesium.Cartesian3.fromDegrees(
        116.30014273942052,
        39.92958344773789,
        500
      );
      this.viewer.camera.setView({
        destination: destination,
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };

    // Initial view setting
    setView();
    // 设置视图到指定的位置,代码结束，但是目前只能完成初始的视图切换，点击切换之后位置会失效
  },
};
</script>




<style lang="less" scoped>
.container {
    width: 100%;
    height: 100%;
    position: relative;
    .map-container {
      height: 100%;
      width: 100%;
    }
    .controls {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        z-index: 10;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
  }

input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  width: 200px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  border-color: #007bff;
  box-shadow: inset 0 2px 4px rgba(0, 123, 255, 0.3);
  outline: none;
}

button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 调整 cesiumContainer 的样式 */
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Modal 样式保持不变，确保 modal 位于最上层 */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.table-container {
  max-height: 60vh;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}
</style>