const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    // 自定义端口
    port: 8088,
    // 前端解决跨域
    proxy: {
      "/api": {
        // 代理所有以 /api 开头的请求
        target: "http://127.0.0.1:8000", // 后端服务器地址
        changeOrigin: true, // 修改请求头中的 Origin
        // pathRewrite: { "^/api": "" }, // 可选，重写路径（去掉 /api）
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
