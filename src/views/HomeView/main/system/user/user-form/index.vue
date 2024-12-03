<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-11-01 16:00
 * @Description: 系统首页
-->
<template>
  <el-dialog :title="!form.userId ? '新增' : '修改'" :visible.sync="visible" :close-on-click-modal="false" :before-close="closeDialog">
    <el-form ref="dataForm" :model="form" :rules="rules" label-position="right" label-width="auto">
      <el-form-item label="昵称" prop="nick">
        <el-select style="width: 100%" v-model="form.nick" filterable placeholder="请选择昵称" :disabled="userDisabled" value-key="userId" @change="handleUserInfo">
          <el-option v-for="(item, index) in usersOptions" :key="index" :label="item.name" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="!form.userId ? true : false" label="密码" prop="password">
        <el-input v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="组织机构" prop="deptId">
        <el-cascader
          style="width: 100%"
          v-model="form.deptId"
          :options="organizationList"
          :props="{
            value: 'id',
            label: 'name',
          }"
          clearable
          :show-all-levels="false"
          @change="handleOrganizationChange"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="行政区" prop="areaCodes">
        <el-cascader
          style="width: 100%"
          v-model="form.areaCodes"
          ref="cascader"
          :options="deptOptions"
          :props="{
            value: 'id',
            label: 'name',
            children: 'children',
            checkStrictly: true,
            emitPath: false,
            multiple: true,
          }"
          clearable
          :show-all-levels="false"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="角色" prop="roleIdList">
        <el-select style="width: 100%" v-model="form.roleIdList" multiple placeholder="请选择角色">
          <el-option v-for="item in roleList" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status" size="small">
              <el-radio label="0" border>正常</el-radio>
              <el-radio label="1" border style="margin-left: -20px">锁定</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dataFormSubmit">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import { getApi, postApi } from "@/api/request";

  export default {
    name: "Menu",
    data() {
      return {
        userDisabled: false,
        usersOptions: [],
        loading: true,
        deptOptions: [],
        visible: false,
        form: {
          username: "",
          nick: "",
          password: "",
          mobile: "",
          email: "",
          areaCodes: [],
          roleIdList: [],
          status: "0",
          deptId: "",
        },
        roleList: [],
        organizationList: [],
        rules: {
          nick: [{ required: true, message: "昵称不能为空", trigger: "blur" }],
          password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
          roleIdList: [{ required: true, message: "角色不能为空", trigger: "change" }],
          areaCodes: [{ required: true, message: "所属行政区不能为空", trigger: "change" }],
          deptId: [{ required: true, message: "所属机构不能为空", trigger: "change" }],
          status: [{ required: true, message: "状态不能为空", trigger: "blur" }],
        },
      };
    },
    watch: {
      // "form.nick": {
      //   handler(n, o) {
      //     this.usersOptions.map(item => {
      //       if (item.name == n) {
      //         this.form.nick = item.name;
      //         this.form.mobile = item.phone;
      //         this.form.email = item.email;
      //         this.form.username = item.code;
      //         // this.form.depId = item.actDepId;
      //       }
      //     });
      //   }
      // }
    },
    mounted() {
      this.getRoleAndAreaList();
    },
    methods: {
      init(isEdit, id) {
        this.visible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].resetFields();
          if (isEdit) {
            let params = {
              userId: id,
            };
            postApi(`/sys/user/infoUser`, params).then((res) => {
              this.form = res.data.data;
              this.form.status = this.form.status.toString();
            });
          } else {
            this.form.userId = undefined;
          }
        });
      },
      //昵称item信息回填
      handleUserInfo(e) {
        this.$nextTick(() => {
          this.form.nick = e.name;
          this.form.mobile = e.phone;
          this.form.email = e.email;
          this.form.username = e.code;
          this.form.deptId = e.actDepId;
        });
        this.$forceUpdate();
        console.log("form", this.form);
      },
      //组织机构回调
      handleOrganizationChange(e) {
        this.form.deptId = e[e.length - 1];
      },
      // 表单提交
      dataFormSubmit() {
        this.$refs["dataForm"].validate((valid) => {
          if (valid) {
            if (this.form.userId) {
              let params = this.form;
              postApi(`/sys/user/update`, params).then((res) => {
                this.$message.success("修改成功");
                this.visible = false;
                this.$emit("refreshDataList");
              });
            } else {
              let params = this.form;
              postApi(`/sys/user/save`, params).then((res) => {
                this.$message.success("添加成功");
                this.visible = false;
                this.$emit("refreshDataList");
              });
            }
          }
        });
      },

      getRoleAndAreaList() {
        getApi(`/sys/user/base-user`).then((response) => {
          this.usersOptions = response.data.data;
        });
        getApi(`/sys/role/select`).then((res) => {
          this.roleList = res.data;
        });
        getApi(`/sys/area/tree`).then((response) => {
          this.deptOptions = [];
          const dept = { id: "0", name: "中国", children: response.data.data };
          this.deptOptions.push(dept);
        });
        getApi(`/sys/dept/tree`, {}).then((res) => {
          let { data } = res;
          if (data.code == 0) {
            this.organizationList = data.data;
          }
        });
      },

      closeDialog(done) {
        this.$refs.cascader.dropDownVisible = false;
        done();
      },
    },
  };
</script>
