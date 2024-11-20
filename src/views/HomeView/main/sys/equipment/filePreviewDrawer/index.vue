<template>
  <div class="pop_container">
    <div class="pop_container_left">
      <el-tree :data="folderTreeList" :node-key="nodeKey" highlight-current :expand-on-click-node="false" accordion :props="defaultProps">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span @click="handleNodeClick(data)">{{ node.label }}</span>
        </span>
      </el-tree>
    </div>
    <div class="pop_container_right">
      <div class="head_wrap" v-if="isFilePreview">
        <div class="search_wrap">
          <div class="select_wrap mr5">
            <el-select v-model="status" placeholder="请选择项目状态" clearable>
              <el-option :label="item.name" :value="item.value" v-for="item in projectStatusList" :key="item.value"></el-option>
            </el-select>
          </div>
          <div class="input_wrap">
            <el-input placeholder="请输入文件名称" v-model="keyword" clearable class="mr5"></el-input>
          </div>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button type="primary" @click="handleReset">重置</el-button>
        </div>
      </div>
      <el-button v-else type="primary" @click="handleSubmit" class="submit_file">提交</el-button>
      <div class="table_wrap">
        <el-table :data="tableData" border style="width: 100%" ref="multipleTable" :height="isFilePreview ? '700' : '780'" v-loading="loading">
          <el-table-column type="index" width="80" label="序号"></el-table-column>
          <el-table-column :prop="isFilePreview ? 'name' : 'fileName'" label="文件名称" width="280" show-overflow-tooltip></el-table-column>
          <!-- <el-table-column prop="b" label="文件类型"></el-table-column> -->
          <el-table-column :prop="isFilePreview ? 'dataUrl' : 'filePath'" label="文件目录" width="280" show-overflow-tooltip></el-table-column>
          <el-table-column v-if="isFilePreview" prop="updateTime" label="上传时间" width="100"></el-table-column>
          <el-table-column v-if="isFilePreview" prop="userName" label="负责人" width="80"></el-table-column>
          <el-table-column v-if="isFilePreview" prop="statusName" label="空间入库状态"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button v-if="!isFilePreview || scope.row.dataType != 0" @click="handleMetadataSpace(scope.row)" type="text" size="small" style="margin-right: 5px">元数据</el-button>
              <span v-if="isFilePreview" :style="scope.row.dataType != 0 ? 'margin-left:15px' : ''">
                <el-button v-if="(scope.row.status == 0 || scope.row.status == 3) && scope.row.dataType == 0" @click="handleMetadataSpace(scope.row)" type="text" size="small">空间入库</el-button>
                <el-button v-if="(scope.row.status == 1 || scope.row.status == 2 || scope.row.status == 4) && scope.row.dataType == 0" @click="handleMetadataSpace(scope.row)" type="text" size="small"
                  >空间详情</el-button
                >
                <el-button @click="handleDownload(scope.row)" type="text" size="small">下载</el-button>
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrap" v-if="isFilePreview">
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
  </div>
</template>

<script>
  import { getApi, postApi } from "@/api/request";
  export default {
    props: ["id", "defalutValue", "isFilePreview", "projectStatusList"],
    data() {
      return {
        isFileDetail: false,
        isSpaceCheck: false,
        dataType: null,
        loading: false,
        dialogMetadataSpaceVisible: false,
        metadataSpaceTitle: "",
        fileId: null,
        dataUrl: "",
        reviewerList: [],
        userIdList: [],
        tableData: [],
        status: "",
        keyword: "",
        current: 1,
        size: 10,
        total: null,
        path: "",
        folderTreeList: [],
        nodeKey: "",
        defaultProps: {
          label: "",
        },
      };
    },
    created() {},
    mounted() {
      this.getFolderTree();
      this.getFileList();
    },
    methods: {
      //获取文件树
      getFolderTree() {
        if (this.isFilePreview) {
          this.nodeKey = "id";
          this.defaultProps.label = "name";
          //项目文件
          this.loading = true;
          getApi(`/item/file/tree`, { id: this.id })
            .then((res) => {
              let { data } = res;
              if (data.code == 0) {
                this.folderTreeList = Object.freeze(data.data);
                this.loading = false;
              }
            })
            .catch((err) => {
              this.loading = false;
            });
        } else {
          //临时文件
          this.nodeKey = "filePath";
          this.defaultProps.label = "fileName";
          this.loading = true;
          postApi(`/item/project/ergodic`, { id: this.id })
            .then((res) => {
              let { data } = res;
              if (data.code == 0) {
                this.folderTreeList = Object.freeze(data.data);
                this.loading = false;
              }
            })
            .catch((err) => {
              this.loading = false;
            });
        }
      },

      // 获取文件信息列表
      getFileList() {
        let { keyword, current, size, path, id, status } = this;
        if (this.isFilePreview) {
          //项目文件
          let params = {
            id,
            keyword,
            current,
            size,
            path,
            status,
          };
          getApi(`/item/file/page`, params).then((res) => {
            let { data } = res;
            if (data.code == 0) {
              this.tableData = data.data.records;
              this.total = data.data.total;
            }
          });
        } else {
          //临时文件
          let params = {
            id,
            path,
          };
          postApi(`/item/project/fileList`, params).then((res) => {
            let { data } = res;
            if (data.code == 0) {
              this.tableData = data.data;
            }
          });
        }
      },
      getReviewerList() {
        getApi(`/sys/user/role/ITEM_AUDIT`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.reviewerList = data.data;
          }
        });
      },
      /* 搜索栏 */
      handleSearch() {
        this.getFileList();
      },
      handleReset() {
        this.keyword = "";
        this.current = 1;
        this.status = "";
        // this.path = "";
        this.getFileList();
      },
      /* 分页页码回调 */
      handleCurrentChange(e) {
        this.current = e;
        this.getFileList();
      },
      /* 分页大小回调 */
      handleSizeChange(e) {
        this.size = e;
        this.getFileList();
      },
      //获取文件列表
      handleNodeClick(data) {
        this.path = this.isFilePreview ? data.id : data.filePath;
        this.getFileList();
      },
      //提交文件弹框
      handleSubmit() {
        const loading = this.$loading({
          lock: true,
          text: "Loading",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        postApi(`/item/audit/user`, { id: this.id }).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.$message({
              message: "提交成功",
              type: "success",
            });
          }
          loading.close();
        });
      },
      //下载
      handleDownload(row) {
        let params = {
          idList: [row.id],
          type: 0,
        };
        this.$prompt("请输入申请说明", "下载申请", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputPattern: /^.+$/,
          inputErrorMessage: "请输入申请说明",
        })
          .then(({ value }) => {
            params.applyNote = value;
            postApi(`/file/download`, params).then((res) => {
              let { data } = res;
              if (data.code == 0) {
                this.$message({
                  type: "success",
                  message: "操作成功",
                });
              }
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消下载",
            });
          });
      },
      //处理空间数据or元数据
      handleMetadataSpace(row) {
        this.dataType = row.dataType;
        console.log("dataType", row.dataType);
        if (this.isFilePreview && row.dataType == 0) {
          if (row.status == 0 || row.status == 3) {
            this.isFileDetail = false;
            this.isSpaceCheck = false;
            this.metadataSpaceTitle = "空间入库";
          } else {
            this.metadataSpaceTitle = "空间详情";
            this.isFileDetail = true;
            this.isSpaceCheck = true;
          }
          this.dataUrl = row.dataUrl;
          this.fileId = row.id;
        } else {
          this.metadataSpaceTitle = "元数据";
          if (this.isFilePreview && row.dataType != 0) {
            this.dataUrl = row.dataUrl;
            this.fileId = row.id;
          } else {
            this.dataUrl = row.filePath;
          }
        }
        this.dialogMetadataSpaceVisible = true;
      },
      //关闭元数据/空间入库弹窗
      closeMetadataSpacePop() {
        this.dialogMetadataSpaceVisible = false;
        this.getFileList();
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
    display: flex;

    .pop_container_left {
      box-sizing: border-box;
      padding: 20px 10px;
      flex: 1;
      margin-right: 25px;
      border-radius: 5px;
      box-shadow: 0px 1px 6px 0px rgb(0 0 0 / 50%);
      overflow: auto;
      max-height: 100%;
    }
    .pop_container_right {
      position: relative;
      flex: 4;
      .submit_file {
        position: absolute;
        right: 0px;
        top: -15px;
        padding: 7px 18px;
      }
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
        margin-top: 20px;
      }
      .auth_btn {
        padding: 10px 35px !important;
        float: right;
        margin-top: 50px;
        margin-right: 20px;
      }
      /deep/.el-dialog__wrapper {
        top: -210px !important;
      }
    }
  }
</style>
