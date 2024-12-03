<template>
  <el-row justify="start" wrap align="middle">
    <el-col v-for="param of params" :key="param.id" :span="12" :sm="12" :xs="12" class="pa-2">
      <!-- Switch for boolean type -->
      <el-switch
        v-if="param.type == valueTypes.bool"
        :value="param.value > 0 ? true : false"
        :label="paramName(param.id)"
        :disabled="isDisabled(param)"
        @change="(value) => changed(param.id, value ? 1 : 0)"
        class="switch-text-small"
      />

      <!-- Slider for range type -->
      <el-slider
        v-if="param.type == valueTypes.range"
        always-dirty
        :value="param.value"
        v-bind="additionalSliderAttributes(param)"
        :max="param.range.max"
        :min="param.range.min"
        :step="1"
        :style="{ marginTop: '0', marginBottom: '0' }"
        :disabled="isDisabled(param)"
        @change="(value) => $emit('change', { id: param.id, value })"
      />

      <!-- Select for discrete values -->
      <app-select v-if="param.type == valueTypes.discrete" :param="param" @change="changedDiscrete" />
    </el-col>
  </el-row>
</template>

<script>
  import { valueTypes, ParamUtils } from "../models/constants/params";
  import Select from "./Select";
  import $ from "jquery";
  export default {
    components: {
      AppSelect: Select,
    },
    props: {
      params: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {};
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
      changedDiscrete(obj) {
        this.$emit("change", obj);
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
      additionalSliderAttributes(param) {
        if ($(window).width() <= 600) {
          return {
            hint: `${this.paramName(param.id)}: ${param.value}`,
            "persistent-hint": true,
            label: "",
            "hide-details": false,
          };
        } else {
          return {
            label: `${this.paramName(param.id)}: ${param.value}`,
            "persistent-hint": false,
            hint: null,
            "hide-details": true,
          };
        }
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
