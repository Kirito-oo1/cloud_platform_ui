<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: "App",
  };
</script>

<style lang="less">
  html,
  body {
    width: 100%;
    height: 100%;
    font-size: 14px;
    user-select: none;
    margin: 0%;
  }
  /* ::-webkit-scrollbar {
    width: 0;
  } */
  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100%;
  }
  /* 125%缩放适配 */
  /* @media (max-width: 1919px) and (min-width: 768px) {
    html {
      zoom: 80%;
    }
    @-ms-viewport {
      width: 1920px;
    }
  } */
</style>
