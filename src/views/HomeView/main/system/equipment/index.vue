<template>
  <div class="container">
    <div class="head_wrap">
      <el-form ref="resultsForm" :model="form" label-width="80px">
        <div class="search_wrap">
          <el-form-item label="设备名称">
            <el-input v-model="form.keyword" placeholder="请输入设备名称或编号" clearable></el-input>
          </el-form-item>
          <el-form-item label="设备状态">
            <el-select v-model="form.status" placeholder="请选择设备状态" clearable>
              <el-option :label="item.name" :value="item.value" v-for="item in projectStatusList" :key="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-cascader clearable v-model="form.proType" :options="projectTypeList" :show-all-levels="false" :props="props" @change="handleProTypeChange" collapse-tags></el-cascader>
          </el-form-item>
        </div>
      </el-form>
      <div class="botton-group">
        <el-button type="primary" @click="onSubmit('resultsForm')">查询</el-button>
        <el-button @click="onReset('resultsForm')">重置</el-button>
      </div>
    </div>
    <div class="table_wrap">
      <el-form :inline="true" size="medium">
        <el-form-item>
          <el-button type="primary" @click="handleAddDetail(0)" class="addBtn">新增</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" border style="width: 100%" height="580">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="name" label="设备名称" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="设备状态">
          <template slot-scope="scope">
            <span> <el-switch v-model="scope.row.connect" disabled active-color="#13ce66" inactive-color="#ff4949"> </el-switch></span>
          </template>
        </el-table-column>
        <el-table-column prop="equipmentType" label="设备类型" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="equipmentModel" label="设备型号" width="180"></el-table-column>
        <el-table-column prop="proYear" label="设备位置(经度)" width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.lng">{{ scope.row.lng }}</span>
            <span v-else>-</span>
          </template></el-table-column
        >
        <el-table-column prop="deptName" label="设备位置(纬度)" width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.lat">{{ scope.row.lat }}</span>
            <span v-else>-</span>
          </template></el-table-column
        >
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button @click="handleAddDetail(1, scope.row)" type="text" size="small">修改</el-button>
            <el-button @click="handleAddDetail(2, scope.row)" type="text" size="small" style="color: #666">详情</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="small" style="color: red">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination_wrap">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="form.current"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="form.size"
        layout="total,sizes,prev, pager, next"
        :total="form.total"
      ></el-pagination>
    </div>
    <!-- 新增 -->
    <div v-if="dialogAddEditVisible">
      <el-dialog width="50%" :title="addEditTitle" :visible.sync="dialogAddEditVisible">
        <addEditPop @closePop="closePop" :type="type" :id="id" :projectTypeList="projectTypeList"></addEditPop>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import addEditPop from "./addUpdatePop/index";
  import { postApi, getApi, delApi } from "@/api/request";
  export default {
    components: { addEditPop },
    data() {
      return {
        addEditTitle: "",
        dialogAddEditVisible: false,
        id: null,
        type: null, //新增or查看
        form: {
          keyword: "",
          status: "",
          proType: "",
          areaCode: "",
          orgId: "",
          size: 10,
          total: 0,
          current: 1,
        },
        tableData: [
          { index: 1, name: "DJI_Mavic_3E", ip: "ws://192.168.134.128:9090", connect: false, equipmentType: "大疆无人机", equipmentModel: "Mavic3E", lng: 116.405289, lat: 39.904987 },
          { index: 2, name: "自制无人机", ip: "ws://192.168.134.117:9090", connect: false, equipmentType: "无人机", equipmentModel: "CUN01", lng: 116.405289, lat: 39.904987 },
          { index: 3, name: "轻舟机器人", ip: "ws://192.168.134.125:9090", connect: false, equipmentType: "无人车", equipmentModel: "nano", lng: 116.405289, lat: 39.904987 },
        ],
        props: {
          multiple: true,
          checkStrictly: true,
          emitPath: false,
          label: "name",
          value: "id",
        },
        projectStatusList: [],
        projectTypeList: [],
      };
    },
    created() {},
    mounted() {
      // this.getResultsList();
      // this.getDistrictList();
      // this.getDevelopmentZonesList();
      // this.getProjectTypeList();
      // this.getProjectStatusList();
    },
    methods: {
      //获取项目类型列表
      getProjectTypeList() {
        getApi(`/item/project/typeTree`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.projectTypeList = data.data;
          }
        });
      },
      //获取项目状态列表
      getProjectStatusList() {
        getApi(`/sys/macro/value`, { value: "project_status" }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.projectStatusList = data.data;
          }
        });
      },
      // 获取服成果信息列表
      getResultsList() {
        let {
          form: { size, current, keyword, status, proType, areaCode, orgId },
        } = this;
        let params = {
          size,
          current,
          keyword,
          status,
          proTypeIds: proType.toString(),
          areaCodes: areaCode.toString(),
          orgIds: orgId.toString(),
          tempType: 1,
          // orgId: Array.isArray(orgId) ? orgId[orgId.length - 1] : orgId,
        };
        getApi(`/item/project/page`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.tableData = data.data.records;
            this.form.total = data.data.total;
          }
        });
      },
      //项目类型选择回调
      handleProTypeChange(e) {
        this.form.proType = e;
      },
      //行政区选择回调
      handleAreaCodeChange(e) {
        this.form.areaCode = e;
      },
      //开发区选择回调
      handleOrgIdChange(e) {
        this.form.orgId = e;
      },
      //查询
      onSubmit() {
        this.form.current = 1;
        this.getResultsList();
      },
      //重置
      onReset() {
        this.form.current = 1;
        this.form.keyword = "";
        this.form.status = "";
        this.form.proType = "";
        this.form.areaCode = "";
        this.form.orgId = "";
        this.getResultsList();
      },
      /* 搜索栏 */
      handleSearch() {
        this.pageNumber = 1;
        this.getResultsList();
      },
      handleReset() {
        this.style = null;
        this.keyword = null;
        this.getResultsList();
      },
      /* 表格栏 */
      // 关闭弹窗
      closePop() {
        this.dialogAddEditVisible = false;
        this.getResultsList();
      },
      // 新增/修改/详情  ( 0:新增,1:修改,2:详情)
      handleAddDetail(type, row = {}) {
        this.type = type;
        if (type == 0) {
          this.addEditTitle = "新增";
        } else if (type == 1) {
          this.id = row.id;
          this.addEditTitle = "修改";
        } else {
          this.id = row.id;
          this.addEditTitle = "详情";
        }
        this.dialogAddEditVisible = true;
      },

      // 删除
      handleDelete(row) {
        console.log(row);
        this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            delApi(`/item/project/${row.id}`, {}).then((res) => {
              let { data } = res;
              if (data.code == 0) {
                this.getResultsList();
                this.$message({
                  type: "success",
                  message: "删除成功!",
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除",
            });
          });
      },
      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.form.current = e;
        this.getResultsList();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.form.size = e;
        this.getResultsList();
      },
    },
  };
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    position: relative;
    .head_wrap {
      position: relative;
      display: flex;
      justify-content: space-around;
      .search_wrap {
        display: flex;
        align-items: center;
        /deep/ .el-input {
          width: 200px !important;
        }
      }
      .botton-group {
        height: 40px;
        display: flex;
        align-items: center;
      }
    }
    .table_wrap {
      margin-top: 0px;
      .table_keyword {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      /deep/.is-leaf {
        text-align: center;
      }
      /deep/.el-table__cell {
        text-align: center;
      }
    }
    .pagination_wrap {
      position: absolute;
      bottom: 45px;
    }
    /deep/.el-dialog__wrapper {
      top: 0px !important;
    }
    .el-dialog__body {
      max-height: 750px;
      overflow: auto;
    }
  }
</style>
