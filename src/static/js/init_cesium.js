/*
 * @Author: hechen 15291492336@163.com
 * @Date: 2022-05-24 17:02:05
 * @LastEditors: hechen
 * @LastEditTime: 2023-02-14 11:48:19
 * @FilePath: \bsh-visual-ui\static\js\init_cesium.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from 'cesium/Cesium'
import 'cesium/Widgets/Widgets.css'
import {
  addTdtLayer
} from "./tdt";
import {installCss3Renderer,installWaveCircleMaterial} from './cesium-components';
export function initMap() {
  Cesium.Camera.DEFAULT_VIEW_FACTOR=0//摄像机视口远近参数，可设置地球大小
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(90, -20, 110, 90);//西南东北，默认显示中国
  window.viewer = new Cesium.Viewer("cesiumMap", {
    scene3DOnly: true, //每个几何实例将以3D渲染以节省GPU内存,默认false
    infoBox: false, //点击要素之后显示的信息控件，默认true
    selectionIndicator: false, //选中元素显示控件，默认true
    shadows: false, //确定阴影是否由光源投射，默认false
    shouldAnimate: true,
    animation: false, //动画控制，默认true
    baseLayerPicker: false, //地图切换控件是否显示，默认true
    geocoder: false, //地名查找,默认true
    timeline: false, //时间线，默认true
    sceneModePicker: false, //切换2D、3D 控件,默认true
    fullscreenButton: false, //全屏按钮
    homeButton: false, //跳转默认视角按钮，默认true
    navigationHelpButton: false, //导航帮助按钮，默认true
    vrButton: false, //双屏模式，默认true 
    imageryProvider: new Cesium.TileMapServiceImageryProvider({
      url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
    }), //修改默认贴图
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: 'https://data.mars3d.cn/terrain',//地形服务器的地址
    })
  })
  window.viewer._cesiumWidget._creditContainer.style.display = "none"; //去除底部版权信息
  window.viewer.imageryLayers.get(0).show = false; //设置cesium默认底图不显示
  window.viewer.scene.postProcessStages.fxaa.enabled = true // 开启抗锯齿
  window.viewer.scene.globe.depthTestAgainstTerrain = true;
  window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // 取消左键双击事件

  let supportsImageRenderingPixelated = Cesium.FeatureDetection.supportsImageRenderingPixelated();//判断是否支持图像渲染像素化处理
  if (supportsImageRenderingPixelated) {
      var vtxf_dpr = window.devicePixelRatio;
      window.viewer.resolutionScale = vtxf_dpr;
  }
  installCss3Renderer(Cesium,window.viewer);
  installWaveCircleMaterial(Cesium,window.viewer);
  window.Cesium = Cesium;
  //添加天地图影像、注记及国界线
  addTdtLayer("img",0); // 影像
  addTdtLayer("cia",2); // 注记
  addTdtLayer("ibo",1); // 国界线
}
