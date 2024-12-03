<template>
  <el-row justify="center" align="middle">
    <el-col :span="24" :sm="11" :md="11" :lg="10" :xl="10">
      <app-view-title v-if="title" :title="title">
        <template #leftElem>
          <slot name="leftElem" />
        </template>

        <template #rightElem>
          <slot name="rightElem" />
        </template>
      </app-view-title>

      <slot />
    </el-col>
  </el-row>
</template>

<script>
  import ViewTitle from "./ViewTitle";

  export default {
    components: {
      appViewTitle: ViewTitle,
    },
    props: {
      title: {
        type: String,
        default: null,
      },
    },
  };
</script>

<style></style>
