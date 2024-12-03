<!-- 
 * @Author:Zhiyu Zheng
 * @Company: 首都师范大学
 * @LastEditTime: 2024-12-03 20:34:49
 * @Description: 系统首页
-->
<template>
  <div class="container">
    <el-row style="height: 50%; width: 99%; margin: 10px auto">
      <el-carousel :interval="3000" type="card" height="380px" style="">
        <el-carousel-item v-for="item in imgsrclist" :key="item.url">
          <el-image style="width: 100%; height: 100%" :src="item.url" fit="cover"></el-image>
        </el-carousel-item>
      </el-carousel>
    </el-row>
    <el-row style="height: 50%; height: 50%; width: 99%; margin: 10px auto; display: flex; justify-content: space-between">
      <el-col :span="11">
        <div id="echartFlytime" style="width: 100%; height: 400px"></div>
      </el-col>
      <el-col :span="11">
        <div id="echartFlydistance" style="width: 100%; height: 400px"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        imgsrclist: [{ url: require("@/assets/image/RotationImg/img2.jpg") }, { url: require("@/assets/image/RotationImg/img3.jpg") }, { url: require("@/assets/image/RotationImg/img4.jpg") }],
      };
    },
    mounted() {
      this.onInitEchartFlytime();
      this.onInitEchartFlydistance();
    },
    created() {},

    methods: {
      //飞行时间图
      onInitEchartFlytime() {
        let myChart = this.$echarts.init(document.getElementById("echartFlytime"), "walden");
        let option = {
          title: {
            text: "飞行时间",
            subtext: "(h)",
          },
          tooltip: {
            trigger: "axis",
          },
          legend: {
            data: ["flytime"],
          },
          toolbox: {
            show: true,
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ["line", "bar"] },
              restore: { show: true },
              saveAsImage: { show: true },
            },
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              // prettier-ignore
              data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
          ],
          yAxis: [
            {
              type: "value",
            },
          ],
          series: [
            {
              name: "flytime",
              type: "bar",
              data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
              markPoint: {
                data: [
                  { type: "max", name: "Max" },
                  { type: "min", name: "Min" },
                ],
              },
              markLine: {
                data: [{ type: "average", name: "Avg" }],
              },
              itemStyle: {
                normal: {
                  color: "#6cd999",
                },
              },
            },
          ],
        };
        myChart.setOption(option);
      },
      //飞行距离图
      onInitEchartFlydistance() {
        let myChart = this.$echarts.init(document.getElementById("echartFlydistance"), "walden");
        let option = {
          title: {
            text: "飞行距离",
            subtext: "(km)",
          },
          tooltip: {
            trigger: "axis",
          },
          legend: {
            data: ["flydistance"],
          },
          toolbox: {
            show: true,
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ["line", "bar"] },
              restore: { show: true },
              saveAsImage: { show: true },
            },
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              // prettier-ignore
              data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
          ],
          yAxis: [
            {
              type: "value",
            },
          ],
          series: [
            {
              name: "flydistance",
              type: "bar",
              data: [10, 6, 16, 25.3, 25.6, 50.1, 15, 70.2, 51, 20.0, 6.4, 3.3],
              markPoint: {
                data: [
                  { type: "max", name: "Max" },
                  { type: "min", name: "Min" },
                ],
              },
              markLine: {
                data: [{ type: "average", name: "Avg" }],
              },
              itemStyle: {
                normal: {
                  color: "#3b89e3",
                },
              },
            },
          ],
        };
        myChart.setOption(option);
      },
    },
  };
</script>
<style>
  .container {
    width: 100%;
    height: 100%;
  }
  .carousel-item {
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    justify-content: center;
  }
  .carousel-img {
    max-width: 100%;
    max-height: 100%;
  }
  .row-panereal {
    background-color: white;
    border: 1px solid #dfe4ed;
    height: 65%;
    margin: 20px 10px 10px 10px !important;
    border: 1px solid #dfe4ed;
    box-shadow: 0px 0px 2px 2px lightgrey;
  }
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
  }
</style>
