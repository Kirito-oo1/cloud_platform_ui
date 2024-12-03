<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-01 16:00
 * @Description: 系统首页
-->
<template>
  <div class="container">
    <div class="head_wrap">
      <div class="search_wrap">
        <div class="input_wrap mr5">
          <el-input placeholder="请输入用户名或操作" v-model="keyword" clearable></el-input>
        </div>
        <el-date-picker
          v-model="dateList"
          type="daterange"
          format="yyyy-MM-dd"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        ></el-date-picker>
        <el-button type="primary" class="ml5" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleReset">重置</el-button>
      </div>
    </div>
    <div class="table_wrap">
      <el-table :data="tableData" border style="width: 100%" height="640">
        <el-table-column prop="id" label="编号" width="120"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="operation" label="操作"></el-table-column>
        <el-table-column prop="time" label="响应时间(ms)" width="120"></el-table-column>
        <el-table-column prop="ip" label="IP地址" width="200"></el-table-column>
        <el-table-column prop="gmtCreate" label="创建时间" width="200"></el-table-column>
        <!-- <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button
              @click="handleDelete(scope.row)"
              type="text"
              pageSize="small"
              style="color: #fa5e00"
              >删除</el-button
            >
          </template>
        </el-table-column>-->
      </el-table>
    </div>
    <div class="pagination_wrap">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pageNumber"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total,sizes,prev, pager, next"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import { postApi } from "@/api/request";
  import { formatDate } from "@/utils/date.js";
  export default {
    name: "Log",
    computed: {
      ...mapState(["btnAuthorityList"]),
    },
    data() {
      return {
        keyword: "",
        startDate: "",
        endDate: "",
        dateList: [],
        pickerOptions: {
          shortcuts: [
            {
              text: "最近一周",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "最近一个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit("pick", [start, end]);
              },
            },
            {
              text: "最近三个月",
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit("pick", [start, end]);
              },
            },
          ],
        },
        tableData: [],
        pageNumber: 1,
        pageSize: 20,
        total: null,
      };
    },
    created() {},
    mounted() {
      // this.getLogData();
    },
    methods: {
      // 获取日志数据
      getLogData() {
        let { keyword, pageNumber, pageSize, startDate, endDate } = this;
        let params = {
          keyword,
          pageNumber,
          pageSize,
          startDate,
          endDate,
        };
        postApi(`/sys/log/list`, params).then((res) => {
          let { data } = res;
          this.tableData = data.records;
          this.total = data.total;
        });
      },
      /* 搜索栏 */
      handleSearch() {
        this.pageNumber = 1;
        this.startDate = this.dateList.length ? formatDate(this.dateList[0]) : "";
        this.endDate = this.dateList.length ? formatDate(this.dateList[0]) : "";
        this.getLogData();
      },
      /* 重置 */
      handleReset() {
        (this.startDate = ""), (this.endDate = "");
        this.dateList = [];
        this.keyword = "";
        this.pageNumber = 1;
        this.getLogData();
      },
      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.pageNumber = e;
        this.getLogData();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.pageSize = e;
        this.getLogData();
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      .search_wrap {
        display: flex;
        align-items: center;
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
      position: absolute;
      bottom: 45px;
    }
  }
</style>
