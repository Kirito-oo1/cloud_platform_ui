/*
 * @Descripttion: 加载天地图，包括矢量底图、影像底图、地形底图
 * @version: 版本1.0
 * @Author: Xiongwei Ji
 * @Date: 2021-09-15 11:10:56
 * @LastEditors: 大地测绘ZZY
 * @LastEditTime: 2023-03-16 15:54:25
 */

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TDT_TK = "0d21d6e9998e6fb62f95746508cbc32a";
/**
 * 创建天地图图层
 * @param {string} type vec:矢量底图;cva：矢量注记;img：影像底图;cia：影像注记;ter:地形底图；cta：地形注记
 * @return {WebTileLayer} 返回创建的天地图图层
 */
function createTdtLayer(type) {
  let url = "";
  let layerId = type + "_c";
  let tileInfo = new TileInfo({
    dpi: 90.71428571427429,
    rows: 256,
    cols: 256,
    compressionQuality: 0,
    origin: {
      x: -180,
      y: 90,
    },
    spatialReference: {
      wkid: 4326,
    },
    lods: [
      {
        level: 2,
        levelValue: 2,
        resolution: 0.3515625,
        scale: 147748796.52937502,
      },
      {
        level: 3,
        levelValue: 3,
        resolution: 0.17578125,
        scale: 73874398.264687508,
      },
      {
        level: 4,
        levelValue: 4,
        resolution: 0.087890625,
        scale: 36937199.132343754,
      },
      {
        level: 5,
        levelValue: 5,
        resolution: 0.0439453125,
        scale: 18468599.566171877,
      },
      {
        level: 6,
        levelValue: 6,
        resolution: 0.02197265625,
        scale: 9234299.7830859385,
      },
      {
        level: 7,
        levelValue: 7,
        resolution: 0.010986328125,
        scale: 4617149.8915429693,
      },
      {
        level: 8,
        levelValue: 8,
        resolution: 0.0054931640625,
        scale: 2308574.9457714846,
      },
      {
        level: 9,
        levelValue: 9,
        resolution: 0.00274658203125,
        scale: 1154287.4728857423,
      },
      {
        level: 10,
        levelValue: 10,
        resolution: 0.001373291015625,
        scale: 577143.73644287116,
      },
      {
        level: 11,
        levelValue: 11,
        resolution: 0.0006866455078125,
        scale: 288571.86822143558,
      },
      {
        level: 12,
        levelValue: 12,
        resolution: 0.00034332275390625,
        scale: 144285.93411071779,
      },
      {
        level: 13,
        levelValue: 13,
        resolution: 0.000171661376953125,
        scale: 72142.967055358895,
      },
      {
        level: 14,
        levelValue: 14,
        resolution: 8.58306884765625e-5,
        scale: 36071.483527679447,
      },
      {
        level: 15,
        levelValue: 15,
        resolution: 4.291534423828125e-5,
        scale: 18035.741763839724,
      },
      {
        level: 16,
        levelValue: 16,
        resolution: 2.1457672119140625e-5,
        scale: 9017.8708819198619,
      },
      {
        level: 17,
        levelValue: 17,
        resolution: 1.0728836059570313e-5,
        scale: 4508.9354409599309,
      },
      {
        level: 18,
        levelValue: 18,
        resolution: 5.3644180297851563e-6,
        scale: 2254.4677204799655,
      },
      {
        level: 19,
        levelValue: 19,
        resolution: 2.68220901489257815e-6,
        scale: 1127.23386023998275,
      },
      {
        level: 20,
        levelValue: 2,
        resolution: 1.341104507446289075e-6,
        scale: 563.616930119991375,
      },
    ],
  });
  //vec:矢量底图;cva：矢量注记;img：影像底图;cia：影像注记:;ter:地形底图；cta：地形注记
  switch (type) {
    case "vec":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=vec_c&x={col}&y={row}&l={level}";
      break;
    case "cva":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=cva_c&x={col}&y={row}&l={level}";
      break;
    case "img":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=img_c&x={col}&y={row}&l={level}";
      break;
    case "cia":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=cia_c&x={col}&y={row}&l={level}";
      break;
    case "ter":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=ter_c&x={col}&y={row}&l={level}";
      break;
    case "cta":
      url = "http://{subDomain}.tianditu.gov.cn/DataServer?tk=" + TDT_TK + "&T=cta_c&x={col}&y={row}&l={level}";
      break;
    default:
  }
  let tdtLayer = L.tileLayer({
    urlTemplate: url,
    subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    tileInfo: tileInfo,
    id: layerId,
    spatialReference: {
      wkid: 4326,
    },
  });
  return tdtLayer;
}

export { createTdtLayer };

// var tiledLayer = new WebTiledLayer("http://{subDomain}.tianditu.gov.cn/DataServer?T=vec_w&x={col}&y={row}&l={level}&tk=c23d6e82c861b552fe383ba7af62cead",
//                 { subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"] }
//             );

// var tiledLayer_poi = new WebTiledLayer("http://{subDomain}.tianditu.gov.cn/DataServer?T=cva_w&x={col}&y={row}&l={level}&tk=c23d6e82c861b552fe383ba7af62cead",
//                 { subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"] }
//             );
//  map.addLayers([tiledLayer, tiledLayer_poi]); 天地图3857
