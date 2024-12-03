<template>
  <div id="slamcontainer">
    <div class="robotinfo">
      <!-- <el-input class="eltree-input" placeholder="输入关键字进行过滤" v-model="filterText">
      </el-input> -->
      <el-input class="eltree-input" placeholder="输入关键字进行过滤" v-model="filterText"></el-input>

      <el-tree :data="data" class="robotinfotree" show-checkbox node-key="id" :default-expanded-keys="[1]" :default-checked-keys="[1]" :props="defaultProps" style="background-color: rgb(37, 37, 40)">
      </el-tree>
    </div>
    <div class="slamlidardiv">
      <ros3d-viewer id="lidarView" :ros="ros" fixedFrame="/world" v-if="connected" style="z-index: 1; width: 100%; height: 100%">
        <ros3d-axes />
        <ros3d-grid />
        <!-- dclslam的话题 -->
        <!-- <ros3d-path topic="/a/distributedMapping/localPath" color="blue"> -->
        <!-- fastlio的话题 -->

        <ros3d-path topic="/a/distributedMapping/localPath" color="blue"> </ros3d-path>
        <ros3d-path topic="/b/distributedMapping/localPath" color="red"> </ros3d-path>
        <ros3d-path topic="/c/distributedMapping/localPath" color="green"> </ros3d-path>

        <ros3d-laser-scan topic="/scan"></ros3d-laser-scan>

        <!-- 
        <ros3d-point-cloud2 :topic="lidar_topic_array[5]"></ros3d-point-cloud2>
        <ros3d-point-cloud2 :topic="lidar_topic_array[4]"></ros3d-point-cloud2>
        <ros3d-point-cloud2 :topic="lidar_topic_array[3]"></ros3d-point-cloud2>
        <ros3d-point-cloud2
          :topic="lidar_topic_array[2]"
          :color="Lidar_Point_Color[2]"
        ></ros3d-point-cloud2>
        <ros3d-point-cloud2
          :topic="lidar_topic_array[1]"
          :color="Lidar_Point_Color[1]"
        ></ros3d-point-cloud2>
        <ros3d-point-cloud2
          :topic="lidar_topic_array[0]"
          :color="Lidar_Point_Color[0]"
        ></ros3d-point-cloud2>  -->

        <!--累积点云-->
        <!-- <ros3d-point-cloud2c :topic="lidar_topic_array[2]" :color="Lidar_Point_Color[2]"></ros3d-point-cloud2c>
        <ros3d-point-cloud2c :topic="lidar_topic_array[1]" :color="Lidar_Point_Color[1]"></ros3d-point-cloud2c>
        <ros3d-point-cloud2c :topic="lidar_topic_array[0]" :color="Lidar_Point_Color[0]"></ros3d-point-cloud2c> -->

        <!-- 新的lidar和imu话题 -->
        <!--<ros3d-point-cloud2 :topic="lidar_topic"></ros3d-point-cloud2>
        <ros3d-laser-scan :topic="imu_topic"></ros3d-laser-scan>-->
      </ros3d-viewer>
    </div>
  </div>
</template>

<script>
  import ROSLIB from "roslib";
  import Ros3dViewer from "vue-ros3djs/src/lib-components/Ros3dViewer.vue";
  import Ros3dGrid from "vue-ros3djs/src/lib-components/Ros3dGrid.vue";
  import Ros3dAxes from "vue-ros3djs/src/lib-components/Ros3dAxes.vue";
  import Ros3dLaserScan from "vue-ros3djs/src/lib-components/Ros3dLaserScan.vue";
  import Ros3dPointCloud2 from "vue-ros3djs/src/lib-components/Ros3dPointCloud2.vue";
  // import Ros3dPointCloud2c from "vue-ros3djs/src/lib-components/Ros3dPointCloud2c.vue";
  import Ros3dPath from "vue-ros3djs/src/lib-components/Ros3dPath.vue";
  export default {
    name: "SLAMpointcloud",
    components: {
      // headTop,
      Ros3dViewer,
      Ros3dAxes,
      Ros3dGrid,
      Ros3dLaserScan,
      Ros3dPointCloud2,
      // Ros3dPointCloud2c, // 注册累积点云组件
      Ros3dPath,
    },
    data() {
      return {
        filterText: "", // 初始化为字符串
        connected: "",
        lidar_topic_array: [
          "/cloud_registered",
          "/a/cloud_registered",
          "/b/cloud_registered",
          "/c/cloud_registered",
          // "/a/distributedMapping/globalMap",
          // "/b/distributedMapping/globalMap",
          // "/c/distributedMapping/globalMap",
        ],
        Lidar_Point_Color: ["blue", "red", "green"],
        //  // 新的话题设置
        // lidar_topic: "/a/livox/lidar",
        // imu_topic: "/a/livox/imu",
        data: [
          {
            id: 1,
            label: "无人机a",
            children: [
              {
                id: 4,
                label: "点云地图a",
              },
              {
                id: 9,
                label: "扫描点",
              },
              {
                id: 10,
                label: "轨迹",
              },
            ],
          },
          {
            id: 2,
            label: "无人机b",
            children: [
              {
                id: 5,
                label: "点云地图b",
              },
              {
                id: 6,
                label: "扫描点",
              },
              {
                id: 11,
                label: "轨迹",
              },
            ],
          },
          {
            id: 3,
            label: "无人机c",
            children: [
              {
                id: 7,
                label: "点云地图c",
              },
              {
                id: 8,
                label: "扫描点",
              },
              {
                id: 12,
                label: "轨迹",
              },
            ],
          },
        ],
        defaultProps: {
          children: "children",
          label: "label",
        },
      };
    },
    mounted() {
      this.lidar_viewer();
    },
    methods: {
      lidar_viewer() {
        this.lidarvisible = true;
        this.ros = new ROSLIB.Ros({
          //需改成小车的ip

          //url: "ws://192.168.181.51:9090",
          url: "ws://localhost:9090",
          //url: "ws://10.1.28.62:9090",
        });
        //console.log('成功修改ip');

        // url: "ws://192.168.1.125:9090",
        // url: "ws://10.1.240.173:9090",
        this.ros.on("connection", () => {
          this.connected = true;
          this.$message({
            type: "success",
            message: "本地连接成功",
          });
        });
        this.ros.on("error", () => {
          this.$message({
            type: "error",
            message: "本地连接失败！",
          });
        });
      },
    },
  };
</script>

<style>
  #slamcontainer {
    display: flex;
    height: 100vh;
  }

  .robotinfo {
    padding: 10px;
    margin-left: 63px;
    text-align: right;
    position: relative;
    width: 20%;
    height: 100%;
    background-color: rgb(37, 37, 40);
    z-index: 3;
  }

  .slamlidardiv {
    position: relative;
    background-color: black;
    /* width: 75%; */
    width: 100%;
    height: 100%; /* 确保高度为100% */
    margin: 0;
    padding: 0;
    overflow: hidden;
    z-index: 1;
  }
  /* 改变复选框的颜色 */
  .robotinfotree .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #42b983; /* 自定义选中背景颜色 */
    border-color: #42b983; /* 自定义选中边框颜色 */
  }

  .robotinfotree .el-checkbox__input .el-checkbox__inner:hover {
    border-color: #42b983; /* 自定义悬停边框颜色 */
  }

  .robotinfotree .el-checkbox__input .el-checkbox__inner {
    border-color: #42b983; /* 自定义未选中边框颜色 */
  }
  .robotinfotree .el-checkbox__input .el-checkbox__inner {
    border-color: rgb(49, 49, 57); /* 自定义未选中边框颜色 */
    background-color: #525559;
  }
  .robotinfotree .el-tree-node__label {
    color: rgb(255, 255, 255); /* 自定义节点文字颜色 */
  }

  .robotinfotree .el-checkbox__input .el-checkbox__inner:hover {
    border-color: #42b983; /* 自定义悬停边框颜色 */
  }
  .robotinfotree .el-checkbox__input.is-focus .el-checkbox__inner {
    border-color: #42b983 !important; /* 取消选择后的边框高亮颜色 */
  }
  /* 自定义高亮样式 */
  .highlight-parent {
    background-color: #42b983 !important; /* 自定义颜色 */
    color: rgb(95, 90, 90) !important;
  }
  .robotinfotree .el-tree-node__content:hover {
    background: #575e64;
  }

  .robotinfotree .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #42b983; /* 更改indeterminate状态下的背景颜色 */
    border-color: #42b983; /* 更改边框颜色 */
  }

  .eltree-input .el-input__inner {
    border-color: #2d2c2b; /* 自定义边框颜色 */
    color: #ffffff; /* 自定义文字颜色 */
    background-color: #575e64; /* 自定义背景颜色 */
  }
  .el-tree-node__content.is-current {
    background-color: black !important;
  }
  .el-tree-node__content:hover {
    background-color: #0f0e0e;
  }
</style>
