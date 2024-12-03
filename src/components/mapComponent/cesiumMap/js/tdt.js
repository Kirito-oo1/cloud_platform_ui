/*
 * @Descripttion: 加载天地图，包括矢量底图、影像底图、地形底图
 * @version: 版本1.0
 * @Author: Xiongwei Ji
 * @Date: 2021-09-15 11:10:56
 * @LastEditors: 大地测绘ZZY
 * @LastEditTime: 2023-03-16 15:54:25
 */

const tk = "0d21d6e9998e6fb62f95746508cbc32a";
const tdtUrlHost = "https://{s}.tianditu.gov.cn/";
const subdomains = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];

/**
 * 添加天地图图层
 * @param {*} Cesium cesium对象
 * @param {*} viewer 三维视图对象
 * @param {*} vec:矢量底图；cva：矢量注记；img：影像底图；cia：影像注记；ibo：国界线
 */
export function addTdtLayer(type, index) {
  let tdtLayer = new window.Cesium.WebMapTileServiceImageryProvider({
    url:
      tdtUrlHost +
      type +
      "_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=" +
      type +
      "&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      tk,
    layer: type + "_w", //WMTS请求的层名称
    style: "default", //WMTS请求的样式名称
    format: "tiles", //MIME类型，用于从服务器检索图像
    tileMatrixSetID: "GoogleMapsCompatible", //	用于WMTS请求的TileMatrixSet的标识符
    subdomains: subdomains, //天地图8个服务器
    minimumLevel: 0, //最小层级
    maximumLevel: 18, //最大层级
  });
  window.viewer.imageryLayers.addImageryProvider(tdtLayer, index);
}

/**
 * 添加天地图地形
 * @param {*} viewer 三维视图对象
 */
export function addTdtTerrain() {
  let terrainUrls = new Array();
  subdomains.forEach((subdomain) => {
    let url = tdtUrlHost.replace("{s}", subdomain) + "mapservice/swdx?tk=" + tk;
    terrainUrls.push(url);
  });
  let tdtTerriain = new window.Cesium.GeoTerrainProvider({
    urls: terrainUrls,
  });
  window.viewer.terrainProvider = tdtTerriain;
}
