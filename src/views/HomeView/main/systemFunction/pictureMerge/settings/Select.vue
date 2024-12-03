<template>
  <el-select
    v-if="canRender"
    :placeholder="paramName()"
    :value="paramValue()"
    @change="changed"
    v-bind="additionalSettings()"
    :style="{ margin: '0', padding: '0' }"
    :clearable="true"
    :filterable="true"
    :popper-append-to-body="true"
    :collapse-tags="true"
  >
    <el-option v-for="(item, index) in paramMapped()" :key="index" :label="item.text" :value="item.value">
      <template #default="{ option }">
        <span v-if="index === 0">
          {{ option.label }}
        </span>
        <span v-else-if="index === 1"> , {{ option.label }} </span>
        <span v-else-if="paramValue().length === 3" class="caption"> &nbsp;( +1 other ) </span>
        <span v-else-if="index === paramValue().length - 1" class="caption"> &nbsp;, ( + {{ paramValue().length - 2 }} other ) </span>
      </template>
    </el-option>
  </el-select>
</template>

<script>
  import { valueTypes, ParamUtils } from "../models/constants/params";

  export default {
    props: {
      param: {
        type: Object,
        required: true,
      },
      outline: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      canRender() {
        return this.param.type == valueTypes.discrete || this.param.type == valueTypes.multiple;
      },
    },
    methods: {
      paramMapped() {
        return this.param.values.map((param) => {
          return { text: param.name, value: param.id };
        });
      },
      changed(newValue) {
        if (this.param.type == valueTypes.multiple) {
          this.$emit("change", { id: this.param.id, value: newValue.toString() });
        } else {
          this.$emit("change", { id: this.param.id, value: newValue });
        }
      },
      paramName() {
        return ParamUtils.getParamName(this.param.id);
      },
      paramValue() {
        if (this.param.type == valueTypes.discrete) {
          return { text: ParamUtils.getParamName(this.param.value), value: this.param.value };
        }
        return this.paramValueMultiple();
      },
      paramValueMultiple() {
        if (this.param.value.length == 0) return [];

        const paramValues = this.param.value.length > 1 ? this.param.value.split(",") : [this.param.value];

        return paramValues.map((paramValue) => {
          return {
            text: ParamUtils.getParamName(+paramValue),
            value: +paramValue,
          };
        });
      },
      additionalSettings() {
        return {
          multiple: this.param.type == valueTypes.multiple,
        };
      },
    },
  };
</script>

<style scoped></style>
