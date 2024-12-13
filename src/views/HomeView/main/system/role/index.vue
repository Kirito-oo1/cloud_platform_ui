<template>
  <div class="container">
    <div class="head_wrap">
      <div class="search_wrap">
        <div class="input_wrap">
          <el-input placeholder="请输入角色名称" v-model="searchRoleName" clearable></el-input>
        </div>
        <el-button type="primary" class="ml5" @click="handleSearch">查询</el-button>
        <el-button type="primary" @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" @click="addOrUpdateHandle(false)">新增角色</el-button>
    </div>
    <div class="table_wrap">
      <el-table :data="tableData" border style="width: 100%" height="640">
        <el-table-column type="index" label="序号" width="100"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="description" label="角色描述" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="addOrUpdateHandle(true, scope.row.roleId)" type="text" size="small">编辑</el-button>
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

    <role-form v-if="dialogAddEditVisible" ref="addOrUpdate" @refreshDataList="getRoleData"></role-form>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import RoleForm from "./role-form/index"; // 角色新增/修改页
  // import postApi from "@/api/request"; // 实际开发中需要集成 API

  export default {
    name: "Role",
    components: { RoleForm },
    data() {
      return {
        searchRoleName: "",
        tableData: [],
        current: 1,
        size: 10,
        total: null,
        dialogAddEditVisible: false,
        type: null,
        roleId: null,
      };
    },
    mounted() {
      this.getRoleData();
    },
    methods: {
      // 获取角色信息
      getRoleData() {
        // 实际数据接口请求
        // postApi(`/sys/role/list`, params).then((res) => {
        //   let { data } = res;
        //   this.tableData = data.records;
        //   this.total = data.total;
        // });

        // 模拟数据
        this.tableData = [
          { roleId: "1", roleName: "管理员", description: "拥有所有权限" },
          { roleId: "2", roleName: "用户", description: "普通用户，权限有限" },
          { roleId: "3", roleName: "访客", description: "查看权限" },
        ];
      },

      // 搜索功能
      handleSearch() {
        this.current = 1;
        this.getRoleData();
      },

      // 重置搜索条件
      handleReset() {
        this.searchRoleName = "";
        this.current = 1;
        this.getRoleData();
      },

      // 新增/编辑
      addOrUpdateHandle(isEdit, id) {
        this.dialogAddEditVisible = true;
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(isEdit, id); // 调用子组件方法初始化数据
        });
      },

      // 删除角色
      handleDelete(row) {
        this.$confirm("此操作将永久删除角色" + row.roleName + "，是否继续?", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            let params = [row.roleId];
            postApi(`/sys/role/remove`, params).then((res) => {
              let data = res.data;
              if (data.code == 0) {
                this.getRoleData();
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

      // 分页页码回调
      handleCurrentChange(e) {
        this.current = e;
        this.getRoleData();
      },

      // 分页大小回调
      handleSizeChange(e) {
        this.size = e;
        this.getRoleData();
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
