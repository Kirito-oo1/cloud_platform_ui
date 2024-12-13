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
     <!-- 加载中提示 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-message">
        <span class="spinner"></span>
        文件较大正在处理，请稍候...
      </div>
    </div>
    <!-- 设备信息模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content fade-in">
        <span class="close" @click="toggleDeviceModal">&times;</span>
        <h2>设备信息</h2>
        <div class="button-group">
          <button @click="showAddDeviceModal = true">添加设备</button>
          <button @click="deleteSelectedDevices">删除选中设备</button>
        </div>
        <div class="table-container">
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
              <td><input type="checkbox" v-model="selectedDevices" :value="device._id" /></td>
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
        </div>
      </div>
    </div>

    <!-- 添加设备模态框 -->
    <div v-if="showAddDeviceModal" class="modal">
      <div class="modal-content fade-in">
        <span class="close" @click="showAddDeviceModal = false">&times;</span>
        <h2>添加设备</h2>
        <form @submit.prevent="addDevice" class="form-container">
          <div class="form-group">
            <label for="model">型号:</label>
            <input v-model="newDevice.model" id="model" required />
          </div>
          <div class="form-group">
            <label for="satellite">卫星:</label>
            <input v-model="newDevice.satellite" id="satellite" />
          </div>
          <div class="form-group">
            <label for="longitude">经度:</label>
            <input v-model="newDevice.longitude" id="longitude" />
          </div>
          <div class="form-group">
            <label for="latitude">纬度:</label>
            <input v-model="newDevice.latitude" id="latitude" />
          </div>
          <div class="form-group">
            <label for="elevation">高度:</label>
            <input v-model="newDevice.elevation" id="elevation" />
          </div>
          <div class="form-group">
            <label for="syncStatus">同步状态:</label>
            <input v-model="newDevice.syncStatus" id="syncStatus" />
          </div>
          <button type="submit">添加设备</button>
        </form>
      </div>
    </div>

   <!-- 设备文件列表模态框 -->
   <div v-if="showFoldersModal" class="modal">
      <div class="modal-content fade-in">
        <span class="close" @click="showFoldersModal = false">&times;</span>
        <h2>设备文件列表</h2>
        <ul class="folder-list">
          <li v-for="folder in folders" :key="folder">
            <label>
              <input type="radio" :value="folder" v-model="selectedFolder" />
              <span class="folder-item">{{ folder }}</span>
            </label>
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
      devices: [],
      viewer: null,
      deviceEntities: [],
      devicesVisible: false,
      viewerInitialized: false,
      selectedDevices: [],
      showModal: false,
      showAddDeviceModal: false,
      showFoldersModal: false,
      newDevice: {
        model: "",
        satellite: "",
        longitude: "",
        latitude: "",
        elevation: "",
        syncStatus: "",
      },
      folders: [],
      selectedFolder: "",
      loading: false,
    };
  },
  async mounted() {
    await this.fetchFolders();
    this.initializeCesium();
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

    async fetchDevices() {
      try {
        const response = await axios.get("http://localhost:3000/api/get-all-devices");
        this.devices = response.data.devices;
      } catch (error) {
        console.error("获取设备数据失败:", error);
        this.showAlert("获取设备数据失败", "error");
      }
    },
    async fetchDeviceData() {
      try {
        const response = await axios.get("http://localhost:3000/api/fetch-device-data", {
          params: { port: this.port },
        });
        const deviceData = response.data.device;
        const existingDeviceIndex = this.devices.findIndex((d) => d.model === deviceData.model);
        if (existingDeviceIndex !== -1) {
          this.devices.splice(existingDeviceIndex, 1, deviceData);
          this.showAlert("设备数据已更新", "success");
        } else {
          this.devices.push(deviceData);
          this.showAlert("设备数据已插入", "success");
        }
      } catch (error) {
        console.error("获取设备数据失败:", error);
        this.showAlert("获取设备数据失败", "error");
      }
    },
    async addDevice() {
      try {
        const response = await axios.post("http://localhost:3000/api/add-device", this.newDevice);
        this.devices.push(response.data.device);
        this.showAddDeviceModal = false;
        this.showAlert("设备已添加", "success");
      } catch (error) {
        console.error("添加设备失败:", error);
        this.showAlert("添加设备失败", "error");
      }
    },
    async deleteSelectedDevices() {
      if (this.selectedDevices.length === 0) {
        this.showAlert("请先选择要删除的设备", "warning");
        return;
      }
      try {
        await axios.post("http://localhost:3000/api/delete-devices", {
          deviceIds: this.selectedDevices,
        });
        this.devices = this.devices.filter((device) => !this.selectedDevices.includes(device._id));
        this.selectedDevices = [];
        this.showAlert("选中设备已删除", "success");
      } catch (error) {
        console.error("删除设备失败:", error);
        this.showAlert("删除设备失败", "error");
      }
    },
    async toggleDevicesOnMap() {
      if (!this.viewerInitialized) {
        console.error("Viewer 未初始化。");
        return;
      }

      if (this.devicesVisible) {
        this.deviceEntities.forEach((entity) => this.viewer.entities.remove(entity));
        this.deviceEntities = [];
      } else {
        try {
          await this.fetchDevices();
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
          this.showAlert("所有设备点已成功显示在地图上", "success");
        } catch (error) {
          console.error("获取所有设备数据失败:", error);
          this.showAlert("获取设备数据失败", "error");
        }
      }
      this.devicesVisible = !this.devicesVisible;
    },



    async fetchFolders() {
      if (!this.port) {
        this.showAlert("请输入端口号", "warning");
        return;
      }
      try {
        const response = await axios.get("http://localhost:3000/api/get-folders", {
          params: { port: this.port },
        });
        this.folders = response.data.folders;
        this.showFoldersModal = true;
      } catch (error) {
        console.error("获取文件夹列表失败:", error);
        this.showAlert("获取文件夹列表失败", "error");
      }
    },
    async downloadFolder() {
      if (!this.selectedFolder) {
        this.showAlert("请选择一个文件夹", "warning");
        return;
      }

      if (!this.port) {
        this.showAlert("请输入端口号", "warning");
        return;
      }

      this.loading = true;
      const downloadUrl = `http://localhost:3000/api/download-folder`;

      try {
        const response = await axios.post(downloadUrl, { port: this.port, folder: this.selectedFolder }, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${this.selectedFolder}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showAlert("文件夹下载完成", "success");
      } catch (error) {
        console.error("下载文件夹失败:", error);
        this.showAlert("下载文件夹失败", "error");
      } finally {
        this.loading = false;
      }
    },
    toggleDeviceModal() {
      this.showModal = !this.showModal;
      if (this.showModal && this.devices.length === 0) {
        this.fetchDevices();
      }
    },
    showAlert(msg, type = "info") {
      console.log(`[${type.toUpperCase()}] ${msg}`);
      window.alert(msg);
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

  .toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255,255,255,0.8);
  padding: 10px;
  border-radius: 8px;
}

.toolbar-section {
  display: flex;
  gap: 10px;
}

input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 120px;
  box-sizing: border-box;
  font-size: 14px;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background: linear-gradient(135deg, #2575fc, #6a11cb);
}

.modal {
  position: fixed;
  z-index: 1000;
  left:0;top:0;right:0;bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  right:20px;
  top:20px;
  font-size: 20px;
  cursor: pointer;
}

.table-container {
  max-height: 60vh;
  overflow-y: auto;
  margin-top:20px;
}

table {
  width:100%;
  border-collapse: collapse;
}

th, td {
  padding:8px;
  border-bottom:1px solid #ddd;
}

th {
  background:#f2f2f2;
}

.form-group {
  margin-bottom:15px;
}

label {
  display:block;
  margin-bottom:5px;
  font-weight:bold;
}

.folder-list {
  list-style:none;
  padding:0;
  margin:20px 0;
}

.folder-item {
  margin-left:8px;
}

.loading-overlay {
  position: fixed;
  z-index:2000;
  top:0;left:0;width:100%;height:100%;
  background:rgba(0,0,0,0.3);
  display:flex;justify-content:center;align-items:center;
}

.loading-message {
  background:#fff;
  padding:20px 40px;
  border-radius:8px;
  font-size:16px;
  font-weight:bold;
  color:#333;
  box-shadow:0 4px 8px rgba(0,0,0,0.2);
  display:flex;gap:10px;align-items:center;
}

.spinner {
  width:24px;
  height:24px;
  border:4px solid #ccc;
  border-top-color:#2575fc;
  border-radius:50%;
  animation:spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform:rotate(360deg);
  }
}

.fade-in {
  animation:fadein 0.3s ease-out;
}

@keyframes fadein {
  from {opacity:0;transform:scale(0.9);}
  to {opacity:1;transform:scale(1);}
}
</style>