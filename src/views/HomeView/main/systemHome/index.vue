<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-01 16:00
 * @Description: 系统首页
-->
<template>
  <div class="map_container">
    <!-- 地图容器 -->
    <map-view></map-view>
  </div>
</template>

<script>
  import mapView from "./mapView/index";
  export default {
    components: { mapView },
    data() {
      return {};
    },
    created() {},
    mounted() {},
    methods: {},
  };
</script>

<style lang="less" scoped>
  .map_container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
