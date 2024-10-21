<template>
  <div class="main_wrap" ref="main" id="main_wrap">
    <!-- <keep-alive> -->
      <router-view />
    <!-- </keep-alive> -->
  </div>
</template>

<script>
export default {
  components: {},
  computed: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {}
};
</script>

<style lang='less' scoped>
.main_wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>