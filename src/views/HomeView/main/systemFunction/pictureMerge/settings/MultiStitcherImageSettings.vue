<template>
  <el-row justify="start" wrap align="middle">
    <el-col v-for="param of params" :key="param.id" :span="12" :sm="12" :xs="12" class="pa-2">
      <el-switch
        v-if="param.type == valueTypes.bool"
        :value="param.value > 0 ? true : false"
        :label="paramName(param.id)"
        :disabled="isDisabled(param)"
        @change="(value) => changed(param.id, value ? 1 : 0)"
        class="switch-text-small"
      />
    </el-col>
  </el-row>
</template>

<script>
  import { valueTypes, ParamUtils } from "../models/constants/params";

  export default {
    props: {
      params: {
        type: Array,
        required: true,
      },
    },
    computed: {
      valueTypes() {
        return valueTypes;
      },
    },
    methods: {
      paramName(id) {
        return ParamUtils.getParamName(id);
      },
      changed(id, value) {
        const valueNumber = Number(value);
        if (!isNaN(valueNumber)) {
          this.$emit("change", { id, value: valueNumber });
        }
      },
      isDisabled(param) {
        const enabledIfId = ParamUtils.getParamEnabledIfId(param.id);
        if (!enabledIfId) return false;

        for (const p of this.params) {
          if (p.id == enabledIfId) {
            return p.value == 0;
          }
        }
        return false;
      },
    },
  };
</script>

<style scoped>
  .switch-text-small >>> label {
    font-size: 0.7em;
    font-weight: 600;
  }
</style>
