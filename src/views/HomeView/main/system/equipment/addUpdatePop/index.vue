<template>
  <div class="pop_container">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="form_wrap">
      <el-row :gutter="20">
        <!-- 设备名称 -->
        <el-col :span="12">
          <el-form-item label="设备名称">
            <el-input v-if="type !== 2" v-model="ruleForm.name" clearable placeholder="请输入设备名称"></el-input>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.name }}
            </span>
          </el-form-item>
        </el-col>

        <!-- 设备编号 -->
        <el-col :span="12">
          <el-form-item label="设备编号">
            <el-input v-if="type !== 2" v-model="ruleForm.id" clearable placeholder="请输入设备编号"></el-input>
            <span v-else>
              <span style="margin-left: -15px">:</span>
              {{ ruleForm.id }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 设备状态 -->
      <el-row :gutter="20" v-if="type !== 2">
        <el-col :span="12">
          <el-form-item label="设备状态" :prop="type !== 2 ? 'status' : ''">
            <el-select v-if="type !== 2" v-model="ruleForm.status" clearable placeholder="请选择设备状态">
              <el-option :label="'启用'" :value="'enabled'"></el-option>
              <el-option :label="'禁用'" :value="'disabled'"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 设备类型 -->
      <el-row :gutter="20" v-if="type !== 2">
        <el-col :span="12">
          <el-form-item label="设备类型" :prop="type !== 2 ? 'type' : ''">
            <el-input v-if="type !== 2" v-model="ruleForm.type" clearable placeholder="请输入设备类型"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 设备型号 -->
      <el-row :gutter="20" v-if="type !== 2">
        <el-col :span="12">
          <el-form-item label="设备型号" :prop="type !== 2 ? 'model' : ''">
            <el-input v-if="type !== 2" v-model="ruleForm.model" clearable placeholder="请输入设备型号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 经纬度位置 -->
      <el-row :gutter="20" v-if="type !== 2">
        <el-col :span="12">
          <el-form-item label="设备位置(经度)" :prop="type !== 2 ? 'lng' : ''">
            <el-input v-if="type !== 2" v-model="ruleForm.lng" clearable placeholder="请输入经度"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备位置(纬度)" :prop="type !== 2 ? 'lat' : ''">
            <el-input v-if="type !== 2" v-model="ruleForm.lat" clearable placeholder="请输入纬度"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- ROS相关信息，在详情页展示 -->
      <el-row :gutter="20" v-if="type === 2">
        <el-col :span="24">
          <el-form-item label="ROS IP 地址">
            <el-input v-model="ruleForm.rosIp" clearable placeholder="请输入 ROS IP 地址" :disabled="!isEditing"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20" v-if="type === 2">
        <el-col :span="24">
          <el-form-item label="ROS 节点">
            <div v-for="(node, index) in ruleForm.rosNodes" :key="index" class="ros-node-item">
              <el-row :gutter="20">
                <!-- 节点名称 -->
                <el-col :span="10">
                  <el-form-item :label="'节点名称 ' + (index + 1)">
                    <el-input v-model="node.nodeName" :disabled="!isEditing" clearable placeholder="请输入节点名称"></el-input>
                  </el-form-item>
                </el-col>

                <!-- 节点类型 -->
                <el-col :span="10">
                  <el-form-item :label="'节点类型 ' + (index + 1)">
                    <el-input v-model="node.nodeType" :disabled="!isEditing" clearable placeholder="请输入节点类型"></el-input>
                  </el-form-item>
                </el-col>

                <!-- 删除节点 -->
                <el-col :span="2" v-if="isEditing">
                  <el-button @click="removeNode(index)" type="danger" icon="el-icon-delete"></el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 新增节点 -->
            <el-button v-if="isEditing" @click="addNode" type="primary" icon="el-icon-plus">新增节点</el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <el-form-item class="foot_wrap" v-if="type !== 2">
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确定</el-button>
      </el-form-item>

      <!-- 详情页修改按钮 -->
      <el-form-item class="foot_wrap" v-if="type === 2">
        <el-button type="primary" @click="handleEdit" style="width: 100%">修改</el-button>
      </el-form-item>

      <!-- 提交修改按钮 -->
      <el-form-item class="foot_wrap" v-if="isEditing">
        <el-button type="primary" @click="submitRosChanges" style="width: 100%">提交ROS修改</el-button>
        <el-button @click="cancelEdit" style="width: 100%">取消修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    props: ["type", "id", "euqipmentTypeList"], // type 是页签类型 (新增/编辑/详情)，id 是传递的设备ID
    data() {
      return {
        isEditing: false, // 是否处于ROS编辑模式
        ruleForm: {
          id: "", // 设备编号
          name: "", // 设备名称
          status: "", // 设备状态
          type: "", // 设备类型
          model: "", // 设备型号
          lat: "", // 纬度
          lng: "", // 经度
          rosIp: "", // ROS IP地址
          rosNodes: [{ nodeName: "", nodeType: "" }], // ROS节点信息（允许多个节点）
        },
      };
    },
    mounted() {
      if (this.type === 2) {
        this.getDeviceDetail(this.id); // 获取设备详情（含ROS信息）
      } else if (this.type === 1) {
        this.getDeviceDetail(this.id); // 获取并回填已有设备信息（不涉及ROS信息）
      } else {
        this.initializeForm(); // 新增时初始化表单
      }
    },
    methods: {
      // 获取设备详情信息
      getDeviceDetail(id) {
        // 模拟数据获取逻辑
        const deviceDetails = [
          {
            id: "143rasdwtfb",
            name: "DJI_Mavic_3E",
            status: "enabled",
            type: "无人机",
            model: "大疆Mavic3E",
            lat: "39.904987",
            lng: "116.405289",
            rosIp: "192.168.1.1",
            rosNodes: [
              { nodeName: "/stereo_camera/right/image_raw", nodeType: "sensor_msgs/Image" },
              { nodeName: "/cloud_registered", nodeType: "sensor_msgs/PointCloud2" },
              { nodeName: "/mavros/imu/data", nodeType: "sensor_msgs/Imu" },
            ],
          },
          {
            id: "123fas123ds",
            name: "轻舟机器人",
            status: "disabled",
            type: "无人车",
            model: "CUN01",
            lat: "34.0522° N",
            lng: "118.2437° W",
            rosIp: "192.168.1.2",
            rosNodes: [
              { nodeName: "节点A", nodeType: "执行器" },
              { nodeName: "节点B", nodeType: "传感器" },
            ],
          },
        ];

        // 查找设备数据并回填
        const device = deviceDetails.find((item) => item.id === id);
        if (device) {
          this.ruleForm = { ...device }; // 填充表单数据
        }
      },

      // 初始化表单（新增）
      initializeForm() {
        this.ruleForm = {
          id: "",
          name: "",
          status: "enabled",
          type: "",
          model: "",
          lat: "",
          lng: "",
          rosIp: "",
          rosNodes: [{ nodeName: "", nodeType: "" }],
        };
      },

      // 提交表单
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$emit("closePop"); // 关闭弹窗
            this.$message.success("提交成功!");
          } else {
            this.$message.error("表单验证失败!");
          }
        });
      },

      // 重置表单
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },

      // 进入编辑模式
      handleEdit() {
        this.isEditing = true; // 开启ROS信息编辑
      },

      // 退出编辑模式
      cancelEdit() {
        this.isEditing = false; // 取消编辑
        this.getDeviceDetail(this.id); // 恢复原始数据
      },

      // 提交ROS节点的修改
      submitRosChanges() {
        this.$message.success("ROS节点修改成功!");
        this.isEditing = false;
      },

      // 新增ROS节点
      addNode() {
        this.ruleForm.rosNodes.push({ nodeName: "", nodeType: "" });
      },

      // 删除ROS节点
      removeNode(index) {
        this.ruleForm.rosNodes.splice(index, 1);
      },
    },
  };
</script>

<style scoped>
  .pop_container {
    padding: 20px;
  }
  .form_wrap {
    margin-top: 10px;
  }
  .foot_wrap {
    display: flex;
    justify-content: flex-end;
  }
  .ros-node-item {
    margin-bottom: 15px;
  }
</style>
