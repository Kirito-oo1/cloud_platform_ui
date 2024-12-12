<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-12-12 17:50:52
 * @Description: 用户管理
-->
<template>
  <div class="container">
    <div class="head_wrap">
      <div class="search_wrap">
        <div class="input_wrap">
          <el-input placeholder="请输入用户名" v-model="searchUserName" clearable></el-input>
        </div>
        <el-button type="primary" class="ml5" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" @click="addOrUpdateHandle(false)">新增</el-button>
    </div>
    <div class="table_wrap">
      <el-table :data="tableData" border style="width: 100%" height="640">
        <el-table-column type="index" label="序号" width="100"></el-table-column>
        <el-table-column prop="username" label="用户名" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column label="昵称" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.nick">{{ scope.row.nick }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" width="200"> </el-table-column>
        <el-table-column label="邮箱" width="300">
          <template slot-scope="scope">
            <span v-if="scope.row.email">{{ scope.row.email }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号" width="300">
          <template slot-scope="scope">
            <span v-if="scope.row.mobile">{{ scope.row.mobile }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="handleAuthority(scope.row)" type="text" size="small">修改密码</el-button>
            <el-button @click="addOrUpdateHandle(true, scope.row.userId)" type="text" size="small">编辑</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="small" style="color: #fa5e00">删除</el-button>
          </template>
        </el-table-column>
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

    <table-form v-if="dialogAddEditVisible" ref="addOrUpdate" @refreshDataList="getUserData"></table-form>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import TableForm from "./user-form/index";
  // import postApi from "@/api/request";

  export default {
    name: "User",
    components: { TableForm },
    computed: {},
    data() {
      return {
        searchUserName: "",
        tableData: [],
        current: 1,
        size: 10,
        total: null,
        dialogAddEditVisible: false,
        type: null,
        userId: null,
      };
    },
    created() {},
    mounted() {
      this.getUserData();
    },
    methods: {
      // 获取用户信息
      getUserData() {
        // postApi(`/sys/user/list`, params).then((res) => {
        //   let { data } = res;
        //   data.records.forEach((item) => {
        //     item.status = item.status ? false : true;
        //   });
        //   this.tableData = data.records;
        //   this.total = data.total;
        // });
        this.tableData = [
          { userId: "123", username: "admin", nick: "管理员", roleId: 1, roleName: "管理员", mobile: "18812340000", email: "zzy@cnu.edu.com" },
          { userId: "124", username: "user01", nick: "小郑", roleId: 2, roleName: "用户", mobile: "18800002233", email: "" },
          { userId: "125", username: "user02", nick: "小诗", roleId: 2, roleName: "用户", mobile: "", email: "dsq@cnu.edu.com" },
        ];
      },
      /* 搜索栏 */
      handleSearch() {
        this.current = 1;
        this.getUserData();
      },
      /* 重置 */
      handleReset() {
        this.searchUserName = "";
        this.current = 1;
        this.getUserData();
      },

      // 新增&修改
      addOrUpdateHandle(isEdit, id) {
        this.dialogAddEditVisible = true;
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(isEdit, id);
        });
      },

      // 修改密码
      handleAuthority(row) {
        this.$prompt("新密码", "修改密码", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputType: "password",
          inputPattern: /^.{6,50}$/,
          inputErrorMessage: "密码长度不低于6位",
        })
          .then(({ value }) => {
            let params = {
              userId: row.userId,
              newPswd: value,
            };
            postApi(`/sys/user/updatePswd`, params).then((res) => {
              let data = res.data;
              if (data.code == 0) {
                this.getUserData();
                this.$message({
                  type: "success",
                  message: "修改成功",
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消密码修改",
            });
          });
      },
      // 删除
      handleDelete(row) {
        this.$confirm("此操作将永久删除" + row.username + "用户, 是否继续?", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            let params = [row.userId];
            postApi(`/sys/user/remove`, params).then((res) => {
              let data = res.data;
              if (data.code == 0) {
                this.getUserData();
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
      // switch开关回调
      handleSwitch(e, row) {
        let params = {
          ...row,
          userId: row.id,
        };
        delete params.id;
        params.status = params.status ? 0 : 1;
        postApi(`/sys/user/update`, params).then((res) => {
          let data = res.data;
          if (data.code == 0) {
            this.getUserData();
          }
        });
      },

      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.current = e;
        this.getUserData();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.size = e;
        this.getUserData();
      },
    },
  };
</script>

<style lang="less" scoped>
  .tagList {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
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
