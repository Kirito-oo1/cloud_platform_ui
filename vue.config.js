/*
 * @Author: Zhiyu Zheng
 * @Date: 2024-10-18 22:26:08
 * @LastEditors: Zhiyu Zheng
 * @LastEditTime: 2024-12-17 20:47:34
 * @FilePath: \cloud_platform_ui\vue.config.js
 * @Description:
 */
const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    open: true,
    // 自定义端口
    port: 8088,
    proxy: {
      "/api": {
        // 代理所有以 /api 开头的请求
        target: "http://127.0.0.1:8000", // 后端服务器地址
        changeOrigin: true, // 修改请求头中的 Origin
      },
    },
  },
  //第三方插件less配置
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [path.join(__dirname, "./src/assets/style/index.less")],
    },
    lintOnSave: false /* 关闭语法检查 */,
  },
  configureWebpack: {
    resolve: {
      fallback: {
        timers: require.resolve("timers-browserify"),
      },
    },
  },
});
