<template>
  <div class="metadata_space_pop_container">
    <el-tabs :before-leave="goToDetail" tab-position="left" style="height: 100%" :value="tabName">
      <el-tab-pane label="基本入库信息" name="基本入库信息">
        <div class="module_info_wrap">
          <el-form :model="ruleForm" :rules="ruleFormRules" ref="ruleForm" label-width="100px" class="form_wrap">
            <el-row :gutter="20">
              <el-col :span="8" v-if="dataType != 2">
                <el-form-item label="数据分类" prop="materialType">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.materialTypeName }}</span>
                  </span>
                  <el-cascader
                    v-else
                    ref="typeCascader"
                    placeholder="请选择数据分类"
                    v-model="ruleForm.materialType"
                    :options="dataClassifyList"
                    :show-all-levels="false"
                    :props="ruleFormProps"
                    @change="handleTypeIdChange"
                    clearable
                  ></el-cascader>
                </el-form-item>
                <el-form-item label="行政区" prop="areaCode">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.areaName }}</span>
                  </span>
                  <el-cascader
                    v-else
                    placeholder="请选择行政区"
                    v-model="ruleForm.areaCode"
                    :options="districtList"
                    :show-all-levels="false"
                    :props="ruleFormProps"
                    clearable
                    @change="getBaseDataList"
                  ></el-cascader>
                </el-form-item>
                <el-form-item label="开发区" prop="orgId">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.orgName ? ruleForm.orgName : "-" }}</span>
                  </span>
                  <el-cascader v-else placeholder="请选择开发区" v-model="ruleForm.orgId" :options="developmentZones" :show-all-levels="false" :props="ruleFormProps" clearable></el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="dataType != 2">
                <el-form-item label="平面坐标系统" prop="coordinate" class="select_wrap">
                  <span v-if="isSpaceCheck" style="display: inline-flex">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; -o-text-overflow: ellipsis; max-width: 200px" :title="ruleForm.coordinateName">{{
                      ruleForm.coordinateName
                    }}</span>
                  </span>
                  <el-cascader
                    v-else
                    placeholder="请选择平面坐标系统"
                    v-model="ruleForm.coordinate"
                    :options="planeCoordinatesList"
                    :show-all-levels="false"
                    :props="{
                      emitPath: false,
                      label: 'name',
                      value: 'code',
                    }"
                    clearable
                    filterable
                  ></el-cascader>
                </el-form-item>
                <el-form-item label="高程坐标系统" prop="elevationCoordinate" class="select_wrap">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.elevationName ? ruleForm.elevationName : "-" }}</span>
                  </span>
                  <el-select v-else v-model="ruleForm.elevationCoordinate" clearable placeholder="请选择高程坐标系统">
                    <el-option v-for="item in elevationCoordinatesList" :key="item.value" :label="item.name" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="数据来源" prop="dataSource">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.dataSource ? ruleForm.dataSource : "-" }}</span>
                  </span>
                  <el-input v-else v-model="ruleForm.dataSource" placeholder="请输入数据来源" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item v-if="dataType != 2" :label="inStorageType == '02' ? '最新时间' : '数据年份'" prop="dataYear">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.dataYear ? ruleForm.dataYear : "-" }}</span>
                  </span>
                  <el-date-picker
                    v-else
                    v-model="ruleForm.dataYear"
                    placeholder="请选择时间"
                    :type="inStorageType == '02' ? 'date' : 'year'"
                    :value-format="inStorageType == '02' ? 'yyyy-MM-dd' : 'yyyy'"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item label="政府负责部门" prop="government" class="select_wrap" v-if="dataType != 2">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.government ? ruleForm.government : "-" }}</span>
                  </span>
                  <el-input v-else v-model="ruleForm.government" placeholder="请输入政府负责部门" clearable></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                  <span v-if="isSpaceCheck">
                    <span style="margin: 0 10px 0 -10px">:</span>
                    <span>{{ ruleForm.remark ? ruleForm.remark : "-" }}</span>
                  </span>
                  <el-input clearable v-else v-model="ruleForm.remark" placeholder="请输入备注" type="textarea" :rows="2"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="foot_wrap" v-if="!isSpaceCheck">
            <el-button @click="resetForm('ruleForm')">重置</el-button>
            <el-button type="primary" @click="submitRuleForm('ruleForm')">确定</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="图层配置管理" name="图层配置管理" v-if="dataType == 0">
        <div class="module_info_wrap">
          <div class="head_table" v-if="dataType == 0">
            <el-link type="warning" :underline="false" icon="el-icon-info" v-if="inStorageType == '01'">整体入库时无法编辑</el-link>
            <el-table :data="layerModelList" border style="width: 100%" ref="multipleTable" height="230" v-loading="loading">
              <el-table-column type="index" width="80" label="序号"></el-table-column>
              <el-table-column :prop="inStorageType == '01' ? 'sourceTableName' : 'name'" :label="inStorageType == '01' ? '图层名称' : '模板名称'"></el-table-column>
              <el-table-column label="图层表名" v-if="inStorageType == '02'">
                <template slot-scope="scope">
                  <div v-if="!scope.row.isEdit || isSpaceCheck">
                    <span>{{ scope.row.layerTag ? scope.row.layerTag : "-" }}</span>
                  </div>
                  <el-select v-else v-model="scope.row.layerTag" clearable placeholder="选择对应图层" @change="handleChooseMode($event, scope)">
                    <el-option v-for="item in fileTableData" :key="item.sourceTableName" :label="item.sourceTableName" :value="item.sourceTableName"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="describe" label="模板描述" width="280"></el-table-column>
              <el-table-column label="操作" width="240">
                <template slot-scope="scope">
                  <el-button @click="handleEditInStorage(scope)" type="text" size="small">
                    {{ isSpaceCheck ? "查看入库信息" : "编辑入库信息" }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="fieldTableData.length > 0">
            <el-tag type="success">字段信息</el-tag>
            <div class="field_table">
              <el-table :data="fieldTableData" border style="width: 100%" ref="multipleTable" height="230">
                <el-table-column type="index" width="80" label="序号"></el-table-column>
                <el-table-column prop="fieldName" :label="inStorageType == '01' ? '图层字段' : '模板字段'"></el-table-column>
                <el-table-column label="目标字段" v-if="inStorageType == '02'">
                  <template slot-scope="scope">
                    <div v-if="isSpaceCheck">
                      <span>{{ scope.row.oldName }}</span>
                    </div>
                    <el-select v-else v-model="scope.row.oldName" placeholder="选择目标字段" @change="handleChooseField($event, scope)" clearable>
                      <el-option v-for="item in layerFieldsList" :key="item.fieldName" :label="item.fieldName" :value="item.fieldName"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column prop="fieldDescribe" label="字段描述"></el-table-column>
              </el-table>
            </div>
            <div class="foot_wrap" v-if="!isSpaceCheck && inStorageType == '02'">
              <el-button type="primary" @click="submitTable()">确定</el-button>
            </div>
          </div>
        </div>

        <el-button v-if="!isSpaceCheck && isFilePreview && dataType == 0" class="in_storage_btn" @click="submitInStorage">入库 </el-button>
        <div class="check_btn_wrap" v-if="isSpaceCheck && !isFileDetail">
          <el-button @click="handleExamine(2)" type="primary">同意</el-button>
          <el-button @click="handleExamine(3)">拒绝</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <!-- <div class="head_select" v-if="dataType == 0">
      <span style="margin-right: 20px">数据分类</span>
      <span v-if="isSpaceCheck">
        <span style="margin: 0 10px 0 -10px">:</span>
        <span>{{ materialName }}</span>
      </span>
    </div> -->
</template>
<script>
  import { postApi, getApi } from "@/api/request";
  export default {
    props: {
      dataUrl: {
        required: true,
        default: null,
      },
      proId: {
        required: true,
        default: null,
      },
      isFilePreview: {
        default: null,
      },
      defalutValue: {
        default: null,
      },
      fileId: {
        default: null,
      },
      isSpaceCheck: {
        default: false,
      },
      checkId: {
        default: null,
      },
      isFileDetail: {
        default: false,
      },
      dataType: {
        default: null,
      },
    },
    data() {
      return {
        hasRelation: null,
        loading: true,
        canEdit: false,
        editIndex: null,
        fileTableData: [],
        copyFileTableData: [],
        sourceTableName: "",
        layerType: "",
        tableType: "",
        modelId: "",
        ruleForm: {
          materialType: "",
          areaCode: "",
          orgId: "",
          coordinate: "",
          elevationCoordinate: "",
          dataSource: "",
          dataYear: "",
          government: "",
          remark: "",
        },
        ruleFormRules: {
          materialType: [{ required: true, message: "请选择数据分类", trigger: "bulr" }],
          areaCode: [{ required: true, message: "请选择行政区", trigger: "bulr" }],
          coordinate: [{ required: true, message: "请选择平面坐标系", trigger: "bulr" }],
          dataYear: [{ required: true, message: "请选择时间", trigger: "bulr" }],
        },
        ruleFormProps: {
          emitPath: false,
          label: "name",
          value: "id",
        },
        materialType: "", //对应数据分类id
        materialName: "", //对应数据分类名称
        typeId: null, //数据分类Id
        inStorageType: null, //入库方式
        layerModelList: [], //图层模板
        dataClassifyList: [], //数据分类列表
        fieldTableData: [], //模板字段信息
        layerFieldsList: [], //图层对应字段列表
        flatDataClassifylist: [],
        districtList: [],
        developmentZones: [],
        planeCoordinatesList: [],
        elevationCoordinatesList: [],
        tagFieldList: [],
        tableName: "", //当前提交的表
        tabName: "基本入库信息",
      };
    },
    created() {
      this.getBaseDataList();
    },
    mounted() {
      this.getDetailList();
      if (this.dataType == 0) {
        this.getResType();
      }
    },
    watch: {},
    methods: {
      //获取基础数据 / 行政区选择回调，确定开发区范围
      getBaseDataList() {
        //获取数据分类列表
        getApi(`/material/type/tree`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.dataClassifyList = data.data;
          }
        });
        //获取行政区列表
        getApi(`/sys/area/tree`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.districtList = data.data;
          }
        });
        //获取开发区列表
        getApi(`/sys/org/tree`, { areaCode: this.ruleForm.areaCode || "" }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.developmentZones = data.data;
          }
        });
        //获取平面坐标列表
        getApi(`/sys/coordinate/tree`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.planeCoordinatesList = data.data;
          }
        });
        //获取高程坐标列表
        getApi(`/sys/macro/value`, { value: "elevation_coordinate" }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.elevationCoordinatesList = data.data;
          }
        });
      },
      //数据分类选择回调，确定入库方式，更改时间选择(01-整体入库，02-追加入库)
      handleTypeIdChange(e) {
        this.ruleForm.dataYear = "";
        if (e) {
          let selectdata = this.$refs["typeCascader"].getCheckedNodes();
          this.inStorageType = selectdata[0].data.inStorageType;
        }
      },
      //初始化获取基本入库数据
      getDetailList(goto) {
        let params = {
          proId: this.proId,
          dataUrl: this.dataUrl,
        };
        getApi(`/item/file/Data/detail`, params).then((res) => {
          let { data } = res.data;
          if (res.data.code == 0 && data) {
            this.ruleForm.materialTypeName = data.materialTypeName;
            this.ruleForm.areaName = data.areaName;
            this.ruleForm.orgName = data.orgName;
            this.ruleForm.coordinateName = data.coordinateName;
            this.ruleForm.elevationName = data.elevationName;
            this.ruleForm.materialType = data.materialType;
            this.ruleForm.areaCode = data.areaCode;
            this.ruleForm.orgId = data.orgId;
            this.ruleForm.coordinate = data.coordinate;
            this.ruleForm.elevationCoordinate = data.elevationCoordinate;
            this.ruleForm.dataSource = data.dataSource;
            this.ruleForm.dataYear = data.dataYear;
            this.ruleForm.government = data.government;
            this.ruleForm.remark = data.remark;
            this.inStorageType = data.inStorageType;
            this.canEdit = true;
            if (!data.materialType || !data.areaCode || !data.coordinate || !data.dataYear) {
              this.canEdit = false;
            }
            if (goto) {
              this.tabName = "图层配置管理";
            }
          } else {
            this.canEdit = false;
          }
        });
      },
      //切换页签时确认是否可跳转到配置图层
      goToDetail(activeName, oldActiveName) {
        this.fieldTableData = [];
        if (activeName == "图层配置管理") {
          this.tabName = "图层配置管理";
          if (!this.canEdit) {
            this.$message.error("请先提交基本入库信息！");
            return false;
          } else {
            this.getLayerModel();
          }
        } else if (activeName == "基本入库信息") {
          this.tabName = "基本入库信息";
          this.getDetailList();
        }
      },
      //初始化获取 文件对应的本身图层列表
      getResType() {
        if (this.inStorageType == "02") {
          this.fieldTableData = [];
        }
        let params = {
          proId: this.proId,
          dataUrl: this.dataUrl,
          isEdit: this.isSpaceCheck ? 0 : 1,
        };
        getApi(`/item/file/detail`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.fileTableData = data.data.LayerList;
          }
        });
      },
      //初始化获取 图层模板
      getLayerModel(editIndex) {
        if (this.inStorageType == "01") {
          this.layerModelList = this.fileTableData;
          this.loading = false;
          if (editIndex != null) {
            this.fieldTableData = this.fileTableData[editIndex].layerFields;
          }
        } else if (this.inStorageType == "02") {
          let { materialType, areaCode, coordinate } = this.ruleForm;
          let params = {
            materialType,
            areaCode,
            coordinate,
          };
          this.loading = true;
          getApi(`/material/layer/listBySet`, params)
            .then((res) => {
              let { data } = res;
              if (data.code == 0) {
                data.data.forEach((item, index) => {
                  this.fileTableData.forEach((itm) => {
                    if (itm.tableName == item.value) {
                      item.layerTag = itm.sourceTableName;
                    }
                  });
                  item.isEdit = false;
                  if (editIndex != null && index == editIndex) {
                    item.isEdit = true;
                    this.fileTableData.map((itm) => {
                      if (itm.sourceTableName == item.layerTag) {
                        this.hasRelation = itm.hasRelation;
                        this.sourceTableName = itm.sourceTableName;
                        this.tableType = itm.tableType;
                        this.layerType = itm.layerType;
                        this.layerFieldsList = itm.layerFields;
                      }
                    });
                    this.getModelFieldList(item.value);
                  }
                });
                this.layerModelList = data.data;
              }
              this.loading = false;
            })
            .catch((err) => {
              this.loading = false;
            });
        }
      },

      //编辑入库信息
      handleEditInStorage(scope, type = true) {
        let { row, $index } = scope;
        this.editIndex = $index;
        //没有初始值时，根据名字匹配
        if (!row.layerTag) {
          this.fileTableData.forEach((item) => {
            if (item.sourceTableName == row.name) {
              row.layerTag = item.sourceTableName;
            }
          });
        }
        this.getLayerModel($index); //刷新
        this.getResType();
      },

      //选择模板
      handleChooseMode(e, scope) {
        this.fileTableData.map((item) => {
          if (item.sourceTableName == e) {
            this.hasRelation = item.hasRelation;
            this.sourceTableName = item.sourceTableName;
            this.tableType = item.tableType;
            this.layerType = item.layerType;
            this.layerFieldsList = item.layerFields;
          }
        });
        this.getModelFieldList(scope.row.value);
      },

      //获取模板/表对应字段
      getModelFieldList(tableName) {
        this.tableName = tableName;
        getApi(`/material/layer/getFields`, { tableName: tableName }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.fieldTableData = data.data;
            this.fieldTableData.map((item) => {
              this.layerFieldsList.map((itm) => {
                if (itm.oldName && itm.oldName == item.fieldName) {
                  item.oldName = itm.fieldName;
                } else if (!itm.oldName && itm.fieldName == item.fieldName) {
                  //没有初始值时，根据名字匹配
                  item.oldName = itm.fieldName;
                }
              });
            });
          }
        });
      },
      //选择字段
      handleChooseField(e, scope) {
        this.layerFieldsList.map((item) => {
          if (item.fieldName == e) {
            item.oldName = scope.row.fieldName;
          }
        });
      },
      //基本入库信息提交
      submitRuleForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let { materialType, areaCode, orgId, coordinate, elevationCoordinate, dataSource, dataYear, government, remark } = this.ruleForm;
            let params = {
              dataUrl: this.dataUrl,
              proId: this.proId,
              materialType,
              areaCode,
              orgId,
              coordinate,
              elevationCoordinate,
              dataSource,
              dataYear,
              government,
              remark,
              dataType: this.dataType,
            };
            postApi(`/item/file/Data`, params).then((res) => {
              let { data } = res;
              if (data.code == 0) {
                this.getDetailList(true);
                this.$message({
                  message: "提交成功",
                  type: "success",
                });
              }
            });
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      },
      //重置
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      //保存图层信息
      submitTable() {
        let { proId, dataUrl, sourceTableName, tableType, layerType, tableName, fieldTableData } = this;
        let params = {
          proId,
          dataUrl,
          sourceTableName,
          tableType,
          layerType,
          tableName,
          layerFields: fieldTableData,
        };
        postApi(`/item/file/detail`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.$message({
              message: "提交成功",
              type: "success",
            });
            this.fieldTableData = [];
          }
        });
      },

      //入库
      submitInStorage() {
        let { proId, dataUrl, fileTableData, fileId } = this;
        //整体入库创建表
        if (this.inStorageType == "01") {
          let param = {
            proId,
            dataUrl,
            layerList: fileTableData,
          };
          postApi(`/item/file/detail/entirety`, param);
        }
        let params = {
          proId,
          fileId,
        };
        postApi(`/gis/material/audit`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.$emit("closeMetadataSpacePop");
            this.$message({
              message: "已发起审核",
              type: "success",
            });
          }
        });
      },
      //审核(status:2：同意,3：拒绝)
      handleExamine(status) {
        let params = {
          id: this.checkId,
          status,
        };
        if (status == 3) {
          this.$prompt("请输入拒绝理由", "备注", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputPattern: /^.+$/,
            inputErrorMessage: "请输入备注",
          })
            .then(({ value }) => {
              params.remark = value;
              this.handleSpaceCheck(params);
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "取消输入",
              });
            });
          return;
        }
        this.handleSpaceCheck(params);
      },
      handleSpaceCheck(params) {
        postApi(`/gis/material/audit/deal`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.$emit("closeMetadataSpacePop");
            this.$message({
              message: "操作成功",
              type: "success",
            });
          }
        });
      },
    },
  };
</script>

<style lang="less" scoped>
  .metadata_space_pop_container {
    width: 100%;
    .module_info_wrap {
      .data_synchronous {
        position: absolute;
        top: 10px;
        right: 10px;
      }
      position: relative;
      border: 1px solid #d6d6d6;
      box-sizing: border-box;
      width: 100%;
      max-height: 640px;
      overflow: auto;
      padding: 20px 10px !important;
      /deep/.el-tag {
        margin: 10px 0 10px 0;
      }
      .form_wrap {
        /deep/.el-tag {
          margin-bottom: 15px !important;
        }
        /deep/ .el-form-item__label {
          width: 110px !important;
        }
        /deep/ .el-form-item__content {
          margin-left: 115px !important;
        }
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
    }
    .in_storage_btn {
      margin-top: 20px;
      margin-left: 90%;
      color: #fff !important;
      background: @highlightFontColor !important;
      /deep/ .el-button {
        padding: 10px 50px;
      }
    }
    .check_btn_wrap {
      margin-top: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
