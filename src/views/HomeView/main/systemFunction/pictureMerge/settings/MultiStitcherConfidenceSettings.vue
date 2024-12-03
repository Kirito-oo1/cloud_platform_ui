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
      <el-slider
        v-if="param.type == valueTypes.range"
        v-bind="additionalSliderAttributes(param)"
        :value="sliderValue(param)"
        :max="param.range.max"
        :min="param.range.min"
        :step="param.step ? param.step : '0.01'"
        :style="{ marginTop: '0', marginBottom: '0' }"
        :disabled="isDisabled(param)"
        @change="(value) => sliderChanged(param, value)"
      />
    </el-col>
  </el-row>
</template>

<script>
  import { valueTypes, ParamUtils } from "../models/constants/params";
  import $ from "jquery";
  export default {
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
        const paramValue = param.value === param.range.maxReplace ? `> ${param.range.max}` : param.value;

        if ($(window).width() <= 600) {
          return {
            hint: `${this.paramName(param.id)}: ${paramValue}`,
            "persistent-hint": true,
            label: "",
            "hide-details": false,
          };
        } else {
          return {
            label: `${this.paramName(param.id)}: ${paramValue}`,
            "persistent-hint": false,
            hint: null,
            "hide-details": true,
          };
        }
      },
      sliderValue(param) {
        if (param.range.maxReplace != undefined && param.value == param.range.maxReplace) {
          return param.range.max;
        }
        return param.value;
      },
      sliderChanged(param, value) {
        let emitValue = value;
        if (param.range.maxReplace != undefined && value == param.range.max) {
          emitValue = param.range.maxReplace;
        }
        this.$emit("change", { id: param.id, value: emitValue });
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
