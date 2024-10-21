<template>
  <div class="pop_container">
    <div class="table_wrap">
      <el-table :data="tableData" border style="width: 100%" ref="multipleTable" height="760">
        <el-table-column type="index" width="80" label="序号"></el-table-column>
        <el-table-column prop="createUserName" label="创建人" width="80"></el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="auditUserName" label="审核人" width="80"></el-table-column>
        <el-table-column prop="auditTime" label="审核时间"></el-table-column>
        <el-table-column prop="statusName" label="项目状态" width="80"></el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="handlesubmitRecordDetail(scope.row)" type="text" size="small" style="color: #666">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- <div class="pagination_wrap">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pageNumber"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total,sizes,prev, pager, next"
        :total="total"
      ></el-pagination>
    </div>-->
    <!-- 提交记录详情 -->
    <div v-if="dialogDetailVisible">
      <el-dialog width="50%" title="提交记录详情" :visible.sync="dialogDetailVisible" :append-to-body="true">
        <submitRecordDetailPop :recordId="recordId"></submitRecordDetailPop>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import { postApi, getApi } from "@/api/request";
  import submitRecordDetailPop from "../submitRecordDetailPop/index";
  export default {
    props: ["id"],
    components: { submitRecordDetailPop },
    data() {
      return {
        dialogDetailVisible: false,
        tableData: [],
        recordId: null,
        // keyword: "",
        // pageNumber: 1,
        // pageSize: 10,
        // total: null
      };
    },
    created() {},
    mounted() {
      this.getSubmitRecordList();
    },
    methods: {
      //获取提交记录列表
      getSubmitRecordList() {
        getApi(`/item/audit/record/page`, { proId: this.id }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.tableData = data.data.records;
          }
        });
      },
      handlesubmitRecordDetail(row) {
        this.recordId = row.id;
        this.dialogDetailVisible = true;
      },
      /* 搜索栏 */
      handleSearch() {},
      handleReset() {},
      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.pageNumber = e;
        // this.getLayerInfoList();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.pageSize = e;
        // this.getLayerInfoList();
      },
    },
  };
</script>

<style lang="less" scoped>
  .pop_container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    position: relative;
    .head_wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .search_wrap {
        display: flex;
        align-items: center;
        .select_wrap {
          /deep/ .el-input {
            min-width: 250px !important;
          }
        }
        .input_wrap {
          /deep/ .el-input {
            width: 250px;
          }
        }
      }
    }
    .table_wrap {
      margin-top: 20px;
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
      margin-top: 50px;
    }
    .auth_btn {
      padding: 10px 35px !important;
      float: right;
      margin-top: 50px;
      margin-right: 20px;
    }
    /deep/.el-dialog__wrapper {
      top: -115px !important;
    }
  }
</style>
