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
      <app-select v-if="param.type == valueTypes.discrete" :param="param" @change="changedDiscrete" />
      <el-slider
        v-if="param.type == valueTypes.range"
        v-bind="additionalSliderAttributes(param)"
        :value="param.value"
        :max="param.range.max"
        :min="param.range.min"
        :step="0.01"
        :style="{ marginTop: '0', marginBottom: '0' }"
        @change="(value) => $emit('change', { id: param.id, value })"
        :tooltip-visibility="'hover'"
      />
    </el-col>

    <el-col :span="12" :sm="12" :xs="12" class="pa-2">
      <el-input-number
        v-if="showFieldOfView"
        v-model="fieldOfView"
        :placeholder="fieldOfViewDefaultValue"
        :min="0"
        :max="100"
        label="Field of view"
        :disabled="!showFieldOfView"
        @change="(value) => fieldOfViewChanged(value)"
        style="width: 100%"
      />
    </el-col>
  </el-row>
</template>

<script>
  import { valueTypes, ParamUtils } from "@/views/HomeView/main/systemFunction/pictureMerge/models/constants/params";
  import Select from "@/components/settings/Select";

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
      fieldOfView: {
        type: String,
        default: null,
      },
      fieldOfViewDefaultValue: {
        type: String,
        default: "45",
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
      changedDiscrete(obj) {
        this.$emit("change", obj);
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
    },
  };
</script>

<style scoped>
  .switch-text-small >>> label {
    font-size: 0.7em;
    font-weight: 600;
  }
</style>
