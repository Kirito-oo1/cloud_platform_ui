<!--
 * @Author: 大地测绘ZZY
 * @Date: 2023-03-09 18:37:14
 * @LastEditors: 大地测绘ZZY
 * @LastEditTime: 2023-03-13 11:24:46
 * @FilePath: \dd-space-ui\src\components\main\systemHome\index.vue
 * @company: 西安大地测绘股份有限公司
 * @description: 
-->
<template>
  <div class="map_container">
    <!-- 右上工具栏 -->
    <rightLayerMenu></rightLayerMenu>
    <!-- 地图容器 -->
    <map-view></map-view>
  </div>
</template>

<script>
  import rightLayerMenu from "./rightLayerMenu/index";
  import mapView from "./mapView/index";
  export default {
    components: { rightLayerMenu, mapView },
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
