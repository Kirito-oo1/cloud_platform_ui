# 项目管理

## 依赖安装

```
npm install
```

### 启动

```
npm run serve
```

### 打包

```
npm run build
```

# 环境

### 前端

```
nodejs、vue2、element、leaflet、vue-ros3djs、three.js、tween.js、roslib
```

### 后端

```
java or python
```

### 机器人端

```
rosbridge-server、tf2-ros-publish、web-video-server
```

## 安装(前置 ros-noetic):

```
sudo apt install ros-noetic-rosbridge-suite
sudo apt install ros-noetic-tf2-web-republisher
sudo apt install ros-noetic-web-video-server
```

条件: ip 互通、话题一致

### 启动:

roscore --首先启动
roslaunch rosbridge_server rosbridge_websocket.launch
rosrun tf2_web_republisher tf2_web_republisher
rosrun web_video_server web_video_server

# 预览

![Image text](https://github.com/Kirito-oo1/cloud_platform_ui/blob/main/examplePageImage/home.png)
![Image text](https://github.com/Kirito-oo1/cloud_platform_ui/blob/main/examplePageImage/uva20241120.png)


关于高斯模型的启动
cd supersplat
//npm i
npm run develop
