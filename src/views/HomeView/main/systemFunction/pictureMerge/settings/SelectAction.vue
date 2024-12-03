<template>
  <el-row>
    <app-select :param="param" @change="(value) => $emit('select-change', value)" />

    <el-button icon :disabled="actionDisabled" :style="{ color: '#2196F3' }" <!-- Element UI uses inline styles for colors, here lighten-1 can be approximated -->
      size="small" @click="$emit('action-click')" >
      <i class="el-icon-refresh"></i>
    </el-button>
  </el-row>
</template>

<script>
  import Select from "@/components/settings/Select";

  export default {
    components: {
      AppSelect: Select,
    },
    props: {
      param: {
        type: Object,
        required: true,
      },
      actionDisabled: {
        type: Boolean,
        default: false,
      },
    },
  };
</script>

<style scoped></style>
