<template>
  <div class="login">
    <div class="headerTextBox">
      <div class="headerName"><img src="../../assets/logo.png" />无人设备云平台</div>
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
  import { postfromApi, getApi } from "@/api/request";
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
    created() {
      // if (sessionStorage.getItem("userToken")) {
      //   this.$router.push("/map");
      //   history.pushState(null, null, document.URL);
      //   window.addEventListener(
      //     "popstate",
      //     function (e) {
      //       history.pushState(null, null, document.URL);
      //     },
      //     false
      //   );
      // }
    },
    mounted() {
      console.log("123123", this.$bus);
    },
    methods: {
      // 登录
      submitForm(formName) {
        let _this = this;
        let header = {
          "Content-Type": "",
          Authorization: "",
        };
        let params = {
          username: this.form.username,
          password: this.form.password,
        };
        this.$refs[formName].validate((valid) => {
          if (valid) {
            _this.$router.push("/home");
            // postfromApi(`${this.serverURL}/oauth/token?`, params, header)
            //   .then((res) => {
            //     sessionStorage.setItem("userToken", res.data.access_token);
            //     sessionStorage.setItem("userName", res.data.username);
            //     sessionStorage.setItem("nick", res.data.nick);
            //     sessionStorage.setItem("userId", res.data.user_id);
            //     sessionStorage.setItem("orgId", res.data.org_id);
            //     getApi(`${this.serverURL}/sys/user/perms`).then((res) => {
            //       let arr = res.data.data;
            //       let audit = arr.indexOf("bsh:compo:check");
            //       let collect = arr.indexOf("bsh:compo:collect");
            //       sessionStorage.setItem("auditPermission", audit);
            //       sessionStorage.setItem("collectPermission", collect);
            //       _this.$router.push("/map");
            //       history.pushState(null, null, document.URL);
            //       window.addEventListener(
            //         "popstate",
            //         function (e) {
            //           history.pushState(null, null, document.URL);
            //         },
            //         false
            //       );
            //     });
            //   })
            //   .catch((err) => {
            //     _this.$message.error(err.response.data.msg);
            //   });
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
    background: url("../../assets/login_bg.png");
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
