<template>
  <el-dialog :title="!form.userId ? '新增' : '修改'" :visible.sync="visible" :close-on-click-modal="false">
    <el-form ref="dataForm" :model="form" :rules="rules" label-position="right" label-width="auto">
      <el-form-item label="昵称" prop="nick">
        <el-input v-model="form.nick" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item v-if="!form.userId" label="密码" prop="password">
        <el-input v-model="form.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIdList">
        <el-select style="width: 100%" v-model="form.roleIdList" multiple placeholder="请选择角色">
          <el-option v-for="item in roleList" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
        </el-select>
      </el-form-item>
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
  export default {
    name: "UserForm",
    data() {
      return {
        visible: false, // 控制弹窗是否显示
        form: {
          userId: null,
          username: "",
          nick: "",
          password: "",
          mobile: "",
          email: "",
          roleIdList: [], // 角色列表应该是一个数组
        },
        userList: [], // 模拟用户数据
        roleList: [], // 角色数据
        rules: {
          nick: [{ required: true, message: "昵称不能为空", trigger: "blur" }],
          password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
          roleIdList: [{ required: true, message: "角色不能为空", trigger: "change" }],
        },
      };
    },
    mounted() {
      this.getDataList(); // 加载模拟数据
    },
    methods: {
      // 初始化，新增/修改时
      init(isEdit, id) {
        this.visible = true; // 显示弹窗
        this.$nextTick(() => {
          this.$refs["dataForm"].resetFields(); // 重置表单
          if (isEdit) {
            // 编辑时，根据 userId 查找用户数据
            let selectedUser = this.userList.find((user) => user.userId === id);
            if (selectedUser) {
              this.form = { ...selectedUser };
              this.form.roleIdList = [this.form.roleId]; // 假设后端数据返回的是单个角色ID，转换为数组
            }
          } else {
            // 新增时清空表单
            this.form = {
              userId: null,
              username: "",
              nick: "",
              password: "",
              mobile: "",
              email: "",
              roleIdList: [], // 清空角色
            };
          }
        });
      },

      // 模拟数据加载
      getDataList() {
        // 模拟用户数据
        this.userList = [
          { userId: "123", username: "admin", nick: "管理员", roleId: 1, roleName: "管理员", mobile: "18812340000", email: "zzy@cnu.edu.com" },
          { userId: "124", username: "user01", nick: "小郑", roleId: 2, roleName: "用户", mobile: "18800002233", email: "" },
          { userId: "125", username: "user02", nick: "小诗", roleId: 2, roleName: "用户", mobile: "", email: "dsq@cnu.edu.com" },
        ];

        // 模拟角色数据
        this.roleList = [
          { roleId: 1, roleName: "管理员" },
          { roleId: 2, roleName: "用户" },
        ];
      },

      // 表单提交
      dataFormSubmit() {
        this.$refs["dataForm"].validate((valid) => {
          if (valid) {
            // 判断是新增还是修改
            if (this.form.userId) {
              // 编辑操作
              console.log("修改提交：", this.form);
              this.$message.success("修改成功");
            } else {
              // 新增操作
              console.log("新增提交：", this.form);
              this.$message.success("添加成功");
            }
            // 关闭弹窗并通知父组件刷新
            this.visible = false;
            this.$emit("refreshDataList");
          }
        });
      },
    },
  };
</script>
