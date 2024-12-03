<template>
  <el-row justify="start" wrap align="baseline">
    <el-col v-for="param of params" :key="param.id" :span="12" :sm="12" :xs="12" class="pa-2">
      <el-switch
        v-if="param.type == valueTypes.bool"
        :value="param.value > 0 ? true : false"
        :label="paramName(param.id)"
        :disabled="isDisabled(param)"
        @change="(value) => changed(param.id, value ? 1 : 0)"
        class="switch-text-small"
      />
      <app-select v-if="param.type == valueTypes.discrete" :param="param" @change="changedDiscrete" />
      <el-slider
        v-if="param.type == valueTypes.range"
        v-bind="additionalSliderAttributes(param)"
        :value="param.value"
        :max="param.range.max"
        :min="param.range.min"
        :step="0.01"
        :disabled="isDisabled(param)"
        @change="(value) => $emit('change', { id: param.id, value })"
        style="margin-top: 0; margin-bottom: 0"
      />
    </el-col>

    <el-col v-if="showFieldOfView" :span="12" :sm="12" :xs="12" class="pa-2">
      <el-input-number
        v-if="showFieldOfView && enableFieldOfView"
        v-model="fieldOfView"
        :placeholder="fieldOfViewDefaultValue"
        :min="0"
        :max="100"
        label="Field of view"
        :disabled="!enableFieldOfView"
        @change="(value) => fieldOfViewChanged(value)"
        style="width: 100%"
      />
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
      showFieldOfView: {
        type: Boolean,
        default: false,
      },
      enableFieldOfView: {
        type: Boolean,
        default: false,
      },
      fieldOfView: {
        type: String,
        default: null,
      },
      fieldOfViewDefaultValue: {
        type: String,
        default: "45",
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
      changedDiscrete(obj) {
        this.$emit("change", obj);
      },
      changed(id, value) {
        const valueNumber = Number(value);
        if (!isNaN(valueNumber)) {
          this.$emit("change", { id, value: valueNumber });
        }
      },
      fieldOfViewChanged(value) {
        this.$emit("fieldOfViewChange", value);
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
            hint: `${this.paramName(param.id)} ${param.value}`,
            "persistent-hint": true,
            label: "",
            "hide-details": false,
          };
        } else {
          return {
            label: `${this.paramName(param.id)} ${param.value}`,
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
