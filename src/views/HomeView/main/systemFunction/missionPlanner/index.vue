<!--
 * @Author: Zhiyu Zheng
 * @Date: 2024-10-18 22:40:30
 * @LastEditors: Zhiyu Zheng
 * @LastEditTime: 2024-12-04 00:05:09
 * @FilePath: \cloud_platform_ui\src\views\HomeView\main\systemFunction\missionPlanner\index.vue
 * @Description: 
-->
<template>
  <div class="container">
    <div class="map">
      <!-- 地图相关操作 -->
      <div class="map-tool-menu">
        <map-tool-menu style="z-index: 2"></map-tool-menu>
      </div>
      <!-- 地图容器 -->
      <leaflet-map-view style="z-index: 1"></leaflet-map-view>
      <!-- <cesium-map-view style="z-index: 1"></cesium-map-view> -->
    </div>
  </div>
</template>

<script>
  import $ from "jquery";
  //组件
  import leafletMapView from "@/components/mapComponent/leafLetMap/index.vue";
  import mapToolMenu from "@/components/mapComponent/leafLetMap/mapToolMenu/index.vue";
  import cesiumMapView from "@/components/mapComponent/cesiumMap/index.vue";
  import { postApi, getApi, delApi } from "@/api/request";
  export default {
    name: "",
    components: { leafletMapView, mapToolMenu, cesiumMapView },
    data() {
      return {};
    },
    created() {},
    mounted() {},
    methods: {},
  };
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    .map {
      height: 100%;
      width: 100%;
      position: relative;
      .map-tool-menu {
        position: absolute;
        top: 80px;
        left: 12px;
        width: 30px;
        height: 300px;
      }
    }
  }
</style>
