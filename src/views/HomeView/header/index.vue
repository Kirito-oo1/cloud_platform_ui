<template>
  <div class="header">
    <div class="title_name">
      <i :class="collapse ? 'iconfont icon-jiantou_xiangyouliangci' : 'iconfont icon-xiangzuoshouqi'" @click="handleMenuCollapse" style="cursor: pointer"></i>
      云平台管理系统
    </div>
    <div class="user_info_wrap">
      <div class="user_info">
        <div class="user_name">
          {{ nick }}
          <span style="color: #2e3032; font-size: 18px">&nbsp;欢迎您</span>
        </div>
        <el-dropdown @command="handleCommand" class="my_center" :show-timeout="150">
          <span class="el-dropdown-link">
            个人中心
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in personalCenterList" :key="item.id" :command="item.id" :class="['iconfont', `${item.icon}`]">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="module_name_wrap" v-if="moduleName">
      <i class="el-icon-location-information"></i>
      <span class="module_name">{{ moduleName }}</span>
    </div>
    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="dialogUpdatePwdVisible" width="30%">
      <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="原密码" prop="pswd">
          <el-input v-model="form.pswd" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPswd">
          <el-input v-model="form.newPswd" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdatePwd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { delApi, postApi } from "@/api/request";
  import { encryptionAES } from "@/utils/aes";
  export default {
    components: {},
    computed: {},
    data() {
      return {
        collapse: false, // 菜单是否折叠
        userName: "",
        nick: "",
        moduleName: "",
        dialogUpdatePwdVisible: false,
        form: {
          pswd: "",
          newPswd: "",
        },
        rules: {
          pswd: [{ required: true, message: "请输入原密码", trigger: "blur" }],
          newPswd: [{ required: true, message: "请输入新密码", trigger: "blur" }],
        },
        personalCenterList: [
          {
            name: "修改密码",
            icon: "icon-app_icons--",
            id: 1,
          },
          {
            name: "退出登录",
            icon: "icon-tuichudenglu",
            id: 2,
          },
        ],
      };
    },
    created() {},
    mounted() {
      let that = this;
      this.userName = sessionStorage.getItem("userName");
      this.nick = sessionStorage.getItem("nick");
      this.moduleName = sessionStorage.getItem("moduleName");
    },
    watch: {
      $route(to, from) {
        this.moduleName = to.name;
      },
    },
    methods: {
      //菜单收缩
      handleMenuCollapse() {
        this.collapse = !this.collapse;
        this.$bus.$emit("collapse", this.collapse);
      },
      //下拉菜单回调
      handleCommand(id) {
        if (id == 1) {
          this.dialogUpdatePwdVisible = true;
        } else if (id == 2) {
          this.loginOut();
        }
      },
      //修改个人密码
      handleUpdatePwd() {
        let { pswd, newPswd } = this.form;
        if (newPswd.length < 6) {
          this.$message({
            type: "warning",
            message: "密码长度不低于6位",
          });
          return;
        }
        let params = {
          pswd,
          newPswd,
        };
        postApi(`/sys/user/updatePswd`, params).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.dialogUpdatePwdVisible = false;
            this.$message({
              type: "success",
              message: "修改成功",
            });
          }
        });
      },
      //退出登录
      loginOut() {
        delApi(`/token/logout`, {}).then((res) => {
          sessionStorage.clear();
          this.$router.push({
            path: "/login",
          });
        });
      },
    },
  };
</script>

<style lang="less" scoped>
  .header {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title_name {
      font-size: 20px;
      font-weight: bold;
    }
    .user_info_wrap {
      .user_info {
        display: flex;
        align-items: center;
        .my_center {
          margin: 0 20px;
        }
        .el-dropdown-link {
          cursor: pointer;
          color: #409eff;
        }
        .el-icon-arrow-down {
          font-size: 12px;
        }
        .user_name {
          color: #06a01a;
          font-weight: 400;
          font-size: @fs16;
        }
        /deep/.el-dropdown-link {
          color: @bgHoverColor !important;
        }
      }
    }
    .module_name_wrap {
      position: absolute;
      bottom: -25px;
      left: 12px;
      /deep/.el-icon-location-information {
        color: @bgHoverColor !important;
      }
      .module_name {
        color: #787b7e;
        font-size: @fs12;
        margin-left: 5px;
      }
    }
  }
  .el-dropdown-menu__item {
    font-size: 14px !important;
  }
</style>
