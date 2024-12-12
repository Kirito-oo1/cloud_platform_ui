<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-12-12 23:07:33
 * @Description: 陀螺仪：IMU可视化
-->
<template>
  <div id="attitude"></div>
</template>

<script>
  import $ from "jquery";
  import "@/static/js/jquery.flightindicators";
  import "@/static/css/flightindicators.css";
  export default {
    name: "flightIndicator",
    props: {},
    data() {
      return {
        indicator: null,
      };
    },
    mounted() {
      this.createIndicator();
      this.$bus.$on("IMUdata", (data) => {
        this.updateIndicator(data);
      });
    },
    beforeDestroy() {
      //组件卸载之前,解绑事件总线事件
      this.$bus.$off("IMUdata");
    },
    methods: {
      createIndicator() {
        var type = "attitude"; // The type may be attitude, heading, variometer, airspeed or altimeter
        var options = {
          size: 270, // 设置仪表的大小
          roll: 0, // 初始横滚角度
          pitch: 0, // 初始俯仰角度
          heading: 0, // 初始航向角度
          vario: 0, // 初始垂直速度
          airspeed: 0, // 初始空速
          altitude: 0, // 初始高度
          pressure: 1000, // 初始气压
          showBox: true, // 显示外部框架
          img_directory: "/assets/flighticatorimg/", // 图像路径
        };
        this.indicator = $.flightIndicator("#attitude", type, options);
      },
      updateIndicator(data) {
        // 提取 IMU 数据
        const orientation = data.orientation || {};
        const angular_velocity = data.angular_velocity || {};
        const linear_acceleration = data.linear_acceleration || {};

        // 更新姿态信息：roll, pitch, heading
        const roll = this.toDegrees(orientation.x); // 转换为度数
        const pitch = this.toDegrees(orientation.y); // 转换为度数
        const heading = this.toDegrees(angular_velocity.z); // 假设角速度的z轴代表航向

        // 更新仪表的参数
        if (this.indicator) {
          this.indicator.setRoll(roll); // 设置横滚角度
          this.indicator.setPitch(pitch); // 设置俯仰角度
          this.indicator.setHeading(heading); // 设置航向角度
        }
        // 可以根据需要继续设置其他参数，比如：速度、海拔、加速度等
        // attitude.setRoll(30); // 设置横滚角度为30度
        // indicator.setRoll(roll); // 设置姿态指示器的横滚角度
        // indicator.setPitch(pitch); // 设置姿态指示器的俯仰角度
        // indicator.setHeading(heading); // 设置航向指示器的航向角度
        // indicator.setVario(vario); // 设置垂直速度指示器的爬升速度
        // indicator.setAirSpeed(speed); // 设置空速指示器的飞行速度
        // indicator.setAltitude(altitude); // 设置高度计的海拔高度
        // indicator.setPressure(pressure); // 设置高度计的气压
        // indicator.resize(size); // 设置仪表的大小
        // indicator.showBox(); // 显示仪表外部的框架
        // indicator.hideBox(); // 隐藏仪表外部的框架
      },
      toDegrees(radians) {
        return radians * (180 / Math.PI); // 将弧度转换为度数
      },
    },
  };
</script>

<style></style>
