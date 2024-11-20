<template>
  <div class="pop_container">
    <div class="table_wrap">
      <el-table :data="tableData" border style="width: 100%" ref="multipleTable" height="470">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column prop="name" label="文件名" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column prop="dataUrl" label="文件路径" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column prop="operation" label="类型"></el-table-column>
      </el-table>
    </div>
    <div class="pagination_wrap">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="current"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="size"
        layout="total,sizes,prev, pager, next"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  import { postApi, getApi } from "@/api/request";
  export default {
    props: ["recordId"],
    data() {
      return {
        tableData: [],
        current: 1,
        size: 10,
        total: null,
      };
    },
    created() {},
    mounted() {
      this.getSubmitRecordDetailList();
    },
    methods: {
      //获取提交记录详情列表
      getSubmitRecordDetailList() {
        let { recordId, current, size } = this;
        let params = {
          recordId,
          current,
          size,
        };
        getApi(`/item/audit/detail/page`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.tableData = data.data.records;
            this.total = data.data.total;
          }
        });
      },
      handlesubmitRecordDetail() {},
      /* 搜索栏 */
      handleSearch() {},
      handleReset() {},
      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.current = e;
        this.getSubmitRecordDetailList();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.size = e;
        this.getSubmitRecordDetailList();
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
