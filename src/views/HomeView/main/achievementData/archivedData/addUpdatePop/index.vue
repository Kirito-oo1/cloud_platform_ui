<template>
  <div class="pop_container">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="form_wrap">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目来源" :prop="type != 2 ? 'source' : ''" class="select_wrap">
            <el-select v-if="type != 2" v-model="ruleForm.source" clearable placeholder="请选择项目来源">
              <el-option :label="item.name" :value="item.value" v-for="item in proSourceList" :key="item.value"></el-option>
            </el-select>
            <span else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.sourceName }}
            </span>
          </el-form-item>
          <el-form-item label="关联项目" :prop="type != 2 ? 'name' : ''" class="select_wrap">
            <span v-if="ruleForm.source">
              <el-select v-if="type != 2" v-model="ruleForm.name" clearable filterable placeholder="请选择关联项目" value-key="code" @change="handleConnectPro">
                <el-option v-for="item in connectProList" :key="item.code" :label="item.name" :value="item"></el-option>
              </el-select>
            </span>
            <span v-if="!ruleForm.source">
              <el-input v-model="ruleForm.name" style="width: 72%" placeholder="填写关联项目名称"></el-input>
            </span>

            <span v-if="type == 2">
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.name }}
            </span>
          </el-form-item>
          <el-form-item label="项目年份" prop="proYear">
            <el-input v-if="type != 2" v-model="ruleForm.proYear" :disabled="ruleForm.source ? true : false" style="width: 72%" placeholder="选择关联项目自动带出"></el-input>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.proYear }}
            </span>
          </el-form-item>
          <el-form-item label="行政区" :prop="type != 2 ? 'areaCode' : ''">
            <el-cascader v-if="type != 2" v-model="ruleForm.areaCode" :options="districtList" :show-all-levels="false" :props="props" clearable @change="handleAreaCodeChange"></el-cascader>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.areaName }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目类型" :prop="type != 2 ? 'proType' : ''">
            <el-cascader v-if="type != 2" v-model="ruleForm.proType" :options="projectTypeList" :show-all-levels="false" :props="props" clearable @change="handleProTypeChange"></el-cascader>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.proTypeName }}
            </span>
          </el-form-item>
          <el-form-item label="项目编码" prop="code">
            <el-input v-if="type != 2" v-model="ruleForm.code" :disabled="ruleForm.source ? true : false" style="width: 72%" placeholder="选择关联项目自动带出"></el-input>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.code }}
            </span>
          </el-form-item>
          <el-form-item label="开始日期" prop="beginTime">
            <el-input v-if="type != 2" v-model="ruleForm.beginTime" :disabled="ruleForm.source ? true : false" style="width: 72%" placeholder="选择关联项目自动带出"></el-input>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.beginTime }}
            </span>
          </el-form-item>
          <el-form-item label="开发区" :prop="type != 2 ? 'orgId' : ''">
            <el-cascader
              v-if="type != 2"
              v-model="ruleForm.orgId"
              :options="developmentZones"
              :show-all-levels="false"
              :props="props"
              clearable
              @change="handleOrgIdChange"
              placeholder="请先选择行政区"
            ></el-cascader>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.orgName }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item class="foot_wrap" v-if="type != 2">
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import { postApi, getApi } from "@/api/request";
  export default {
    props: ["type", "id", "districtList", "projectTypeList"],
    data() {
      return {
        developmentZones: [],
        ruleForm: {
          source: "",
          proType: "",
          name: "",
          code: "",
          orgId: "",
          areaCode: "",
          proYear: "",
          beginTime: "",
        },
        rules: {
          proType: [
            {
              required: true,
              message: "请选择项目类型",
              trigger: "change",
            },
          ],
          name: [
            {
              required: true,
              message: "请选择关联项目",
              trigger: "change",
            },
          ],
          areaCode: [
            {
              required: true,
              message: "请选择行政区",
              trigger: "change",
            },
          ],
          orgId: [
            {
              required: sessionStorage.getItem("dept_code") == "DDM-ZB-009" ? false : true,
              message: "请选择开发区",
              trigger: "change",
            },
          ],
          proYear: [
            {
              // pattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
              pattern: /^[0-9]+$/,
              message: "请输入数字",
              trigger: "blur",
            },
          ],
        },
        proSourceList: [],
        connectProList: [] /* 待优化查询，分页 */,
        props: {
          emitPath: false,
          checkStrictly: true,
          label: "name",
          value: "id",
        },
      };
    },
    created() {},
    mounted() {
      if (this.type != 2) {
        this.getProSource();
      }
      if (this.type) {
        //修改or详情
        this.getResultsDetailInfo();
      }
    },
    watch: {
      "ruleForm.source": {
        handler(newD, oldD) {
          if (this.type != 2) {
            this.getConnectPro(newD);
          }
        },
      },
    },
    methods: {
      //获取项目来源
      getProSource() {
        getApi(`/sys/macro/value`, { value: "project_source_type" }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.proSourceList = data.data;
          }
        });
      },
      //获取关联项目
      getConnectPro(source) {
        if (source) {
          this.ruleForm.name = "";
          getApi(`/item/project/find`, { source }).then((res) => {
            let { data } = res;
            if (data.code == 0) {
              this.connectProList = Object.freeze(data.data);
            }
          });
        }
      },
      //成果详情信息
      getResultsDetailInfo() {
        getApi(`/item/project/detail`, { id: this.id }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.ruleForm = data.data;
          }
        });
      },
      //关联项目选择回调
      handleConnectPro(e) {
        this.ruleForm.name = e.name;
        this.ruleForm.code = e.code;
        this.ruleForm.proYear = e.actualStartTime ? e.actualStartTime.slice(0, 4) : e.planStartTime.slice(0, 4);

        this.ruleForm.beginTime = e.actualStartTime ? e.actualStartTime : e.planStartTime;
      },
      //项目类型选择回调
      handleProTypeChange(e) {
        this.ruleForm.proType = e;
      },
      //行政区选择回调
      handleAreaCodeChange(e) {
        this.ruleForm.areaCode = e;
        getApi(`/sys/org/tree`, { areaCode: e }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.developmentZones = data.data;
          }
        });
      },
      //开发区选择回调
      handleOrgIdChange(e) {
        this.ruleForm.orgId = e;
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let {
              ruleForm: { source, proType, name, code, orgId, areaCode, proYear, beginTime },
            } = this;
            let params = {
              source,
              beginTime,
              name,
              code,
              proType: proType[proType.length - 1],
              orgId: orgId[orgId.length - 1],
              areaCode: areaCode[areaCode.length - 1],
              proYear,
            };
            if (this.type == 0) {
              //新增
              postApi(`/item/project`, params).then((res) => {
                let { data } = res;
                if (data.code == 0) {
                  this.$message({
                    type: "success",
                    message: "新增成功!",
                  });
                  this.$emit("closePop");
                }
              });
            } else {
              //编辑
              // postApi(`/item/project`, params).then(
              //   res => {
              //     let { data } = res;
              //     if (data.code == 0) {
              //       this.$message({
              //         type: "success",
              //         message: "修改成功!"
              //       });
              //       this.$emit("closePop");
              //       this.resetForm("ruleForm");
              //     }
              //   }
              // );
            }
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    },
  };
</script>

<style lang="less" scoped>
  .pop_container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 10px 20px !important;
    /deep/.el-table__cell {
      text-align: center;
    }
    .module_dia {
      margin-top: 320px;
      /deep/.el-dialog {
        border: 1px solid #b6cfd3;
        border-radius: 15px !important;
      }
    }

    .form_wrap {
      /deep/.el-tag {
        margin-bottom: 15px !important;
      }
      /deep/ .el-color-picker__trigger {
        width: 218px !important;
        height: 38px !important;
      }
      .foot_wrap {
        margin-bottom: 0 !important;
        margin-top: 20px;
        display: flex;
        justify-content: center;

        /deep/ .el-form-item__content {
          margin-left: 0 !important;
        }
        /deep/ .el-button {
          padding: 10px 50px;
        }
        /deep/.el-button--default {
          color: #fff;
          background-color: #a2a2a2;
        }
      }
      /deep/ .el-form-item__label {
        width: 115px !important;
      }
      /deep/ .el-form-item__content {
        margin-left: 125px !important;
      }
    }
  }
</style>
