<!--
 * @Author: Zhiyu Zheng
 * @Date: 2024-10-18 22:40:30
 * @LastEditors: Zhiyu Zheng
 * @LastEditTime: 2024-12-16 23:52:26
 * @FilePath: \cloud_platform_ui\src\views\Login\index.vue
 * @Description: 登录页
-->
<template>
  <div class="login">
    <div class="headerTextBox">
      <div class="headerName"><img src="../../assets/image/logo.png" />无人设备云平台</div>
      <div class="headerName" style="font-size: 35px">Cloud Platform For Unmanned Equipment</div>
    </div>
    <div class="loginForm">
      <div class="title">用户登录</div>
      <div class="loginWrapper">
        <el-form ref="form" :model="form" :rules="rules">
          <div class="login_input">
            <el-form-item prop="username">
              <span class="iconfont">
                <el-icon><User /></el-icon>
              </span>
              <input type="text" placeholder="请输入您的账号" v-model="form.username" />
            </el-form-item>
          </div>

          <div class="login_input">
            <el-form-item prop="password">
              <span class="iconfont">
                <el-icon><Lock /></el-icon>
              </span>
              <input type="password" placeholder="请输入您的密码" v-model="form.password" />
            </el-form-item>
          </div>
          <el-form-item>
            <div class="login_open" @click="submitForm('form')">登 录</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  import { postfromApi, getApi, postApi } from "@/api/request";
  export default {
    name: "Login",
    data() {
      return {
        form: {
          username: "",
          password: "",
          code: "",
        },
        rules: {
          username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
          password: [{ required: true, message: "请输入密码", trigger: "blur" }],
          code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
        },
        imgSrc: "",
        randerNum: "",
      };
    },
    created() {},
    mounted() {},
    methods: {
      // 登录
      submitForm(formName) {
        let _this = this;
        let params = {
          username: this.form.username,
          password: this.form.password,
        };
        this.$refs[formName].validate((valid) => {
          if (valid) {
            postApi(`${this.serverURL}/api/login/`, params)
              .then((res) => {
                if (res.status == 200) {
                  _this.$router.push("/home");
                  _this.$message.success(res.data.message);
                } else {
                  _this.$message.error(res);
                }
              })
              .catch((err) => {
                _this.$message.error(err);
              });
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      },
    },
  };
</script>

<style scoped>
  .login {
    width: 100%;
    height: 100%;
    background: url("../../assets/image/login_bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .headerTextBox {
    transform: translate(-50%, 100%);
    position: absolute;
    left: 50%;
    width: 60%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .headerTextBox img {
    width: 55px;
    margin: 0px 10px;
  }
  .headerTextBox .headerName {
    margin: 0 10px;
    background: linear-gradient(0deg, #1ab9b6 0%, #ffffff 66%);
    font-size: 45px;
    font-weight: 800;
    text-align: center;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 2.76px;
    display: flex;
    align-items: center;
  }
  .loginForm {
    width: 514px;
    height: 452px;
    background: linear-gradient(0deg, #054c8a 0%, rgba(8, 109, 197, 0) 100%);
    border: 1.5px solid #03aefc;
    border-radius: 10px;
    padding: 40px;
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -40%);
    box-shadow: 0px 0px 30px 0px #1484e3;
  }
  .title {
    color: #fff;
    font-size: 30px;
    text-align: center;
    margin-bottom: 30px;
  }

  .login_input {
    width: 100%;
    height: 50px;
    margin-bottom: 30px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .login_input .iconfont {
    position: absolute;
    color: #fff;
    font-size: 30px;
    height: 50px;
    margin-left: 10px;
  }
  .login_input input {
    width: 100%;
    height: 50px;
    padding-left: 40px;
    background: #091220;
    border: 1px solid #03aefc;
    outline: 0;
    box-sizing: border-box;
    border-radius: 6px;
    font-size: 18px;
    color: #fff;
  }
  .login_input .code_input {
    width: 90%;
  }
  .login_input .code_img {
    width: 120px;
    height: 48px;
  }
  .login_open {
    width: 100%;
    height: 50px;
    font-size: 24px;
    background: linear-gradient(1deg, #091220 0%, #182d4d 95%);
    border-radius: 6px;
    letter-spacing: 10px;
    color: #fff;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
  }
  .el-form-item {
    width: 100% !important;
    margin-bottom: 0 !important;
  }
</style>
