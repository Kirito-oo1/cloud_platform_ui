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

      <!-- Slider for range square root type -->
      <el-slider
        v-if="param.type == valueTypes.rangeSquareRoot"
        v-bind="additionalSliderAttributes(param, 'px')"
        :value="sliderValueSqrt(param.value)"
        :max="sliderValueSqrt(param.range.max)"
        :min="sliderValueSqrt(param.range.min)"
        :step="20"
        :style="{ marginTop: '0', marginBottom: '0' }"
        @change="(value) => $emit('change', { id: param.id, value: value * value })"
      />

      <!-- Slider for range type -->
      <el-slider
        v-if="param.type == valueTypes.range"
        v-bind="additionalSliderAttributes(param, '')"
        :value="param.value"
        :max="param.range.max"
        :min="param.range.min"
        :step="1"
        :style="{ marginTop: '0', marginBottom: '0' }"
        @change="(value) => $emit('change', { id: param.id, value })"
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
      additionalSliderAttributes(param, suffix) {
        // if($(window).width() <= 600) {
        return {
          hint: `${this.paramName(param.id)}: ${param.value}${suffix ? " " + suffix : ""}`,
          "persistent-hint": true,
          label: "",
          "hide-details": false,
        };
        // }
        // else {
        // return {
        //   label: `${this.paramName(param.id)} ${param.value}${suffix ? ' ' + suffix : ''}`,
        //   'persistent-hint': false,
        //   hint: null,
        //   'hide-details': true
        // }
        // }
      },
      sliderValueSqrt(value) {
        return Math.round(Math.sqrt(value));
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
