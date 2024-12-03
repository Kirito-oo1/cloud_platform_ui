<template>
  <div>
    <el-row justify="space-between" align="middle">
      <el-row align="middle" justify="start">
        <h3 class="text-xs-left">
          {{ title }}
        </h3>

        <div>
          <slot name="leftElem" />
        </div>
      </el-row>

      <div :style="{ position: 'relative' }">
        <div
          :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            transform: 'translate(-100%, -50%)',
          }"
        >
          <slot name="rightElem" />
        </div>
      </div>
    </el-row>

    <app-view-spacer :mtop="'0'" />
  </div>
</template>

<script>
  import ViewSpacer from "./ViewSpacer";

  export default {
    components: {
      appViewSpacer: ViewSpacer,
    },
    props: {
      title: {
        type: String,
        required: true,
      },
    },
  };
</script>

<style scoped></style>
