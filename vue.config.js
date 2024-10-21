const { defineConfig } = require("@vue/cli-service");
const path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  //自定义端口
  devServer: { port: 8088 },
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
  //前端解决跨域
  // devServer: {
  //   proxy: {
  //     "./api": {
  //       target: "",
  //       changOrigin: true,
  //     },
  //   },
  // },
});
