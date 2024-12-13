<template>
  <el-dialog :title="!form.roleId ? '新增角色' : '修改角色'" :visible.sync="visible" :close-on-click-modal="false">
    <el-form ref="dataForm" :model="form" :rules="rules" label-position="right" label-width="auto">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色描述" prop="description">
        <el-input v-model="form.description" placeholder="请输入角色描述" />
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
    name: "RoleForm",
    data() {
      return {
        visible: false,
        form: {
          roleId: null,
          roleName: "",
          description: "",
        },
        rules: {
          roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
          description: [{ required: true, message: "角色描述不能为空", trigger: "blur" }],
        },
      };
    },
    mounted() {
      // 加载模拟数据
      this.getDataList();
    },
    methods: {
      // 初始化，新增/修改时
      init(isEdit, id) {
        this.visible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].resetFields();
          if (isEdit) {
            // 编辑时，查找角色数据
            let selectedRole = this.roleList.find((role) => role.roleId === id);
            if (selectedRole) {
              this.form = { ...selectedRole };
            }
          } else {
            // 新增时，清空表单
            this.form = {
              roleId: null,
              roleName: "",
              description: "",
            };
          }
        });
      },

      // 模拟角色数据加载
      getDataList() {
        // 模拟角色数据
        this.roleList = [
          { roleId: "1", roleName: "管理员", description: "拥有所有权限" },
          { roleId: "2", roleName: "用户", description: "普通用户，权限有限" },
          { roleId: "3", roleName: "访客", description: "查看权限" },
        ];
      },

      // 表单提交
      dataFormSubmit() {
        this.$refs["dataForm"].validate((valid) => {
          if (valid) {
            if (this.form.roleId) {
              // 编辑操作
              console.log("修改提交：", this.form);
              this.$message.success("修改成功");
            } else {
              // 新增操作
              console.log("新增提交：", this.form);
              this.$message.success("添加成功");
            }
            this.visible = false;
            this.$emit("refreshDataList");
          }
        });
      },
    },
  };
</script>
