<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-07 19:00
 * @Description: mjpegCanvas组件：加载视频流
-->
<template>
  <div id="mjpeg"></div>
</template>

<script>
  export default {
    name: "mjpegCanvas",
    props: {
      host: {
        type: String,
        default: "",
        require: true,
      },
      topic: {
        type: String,
        default: "",
        require: true,
      },
      width: {
        type: String,
        default: "500",
        require: false,
      },
      height: {
        type: String,
        default: "500",
        require: false,
      },
    },
    data() {
      return {};
    },
    mounted() {
      this.object = new MJPEGCANVAS.Viewer({
        divID: "mjpeg",
        host: this.host,
        width: this.width,
        height: this.height,
        topic: this.topic,
        interval: 100,
        quality: 100,
        refreshRate: 60,
      });
    },
    beforeDestroy() {},
    methods: {},
  };
</script>

<style>
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
