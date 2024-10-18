import L from "leaflet";
import "leaflet/dist/leaflet.css";

export { createMap, zoomTo };

/**
 * 创建地图
 * @param {String} divId div容器ID
 * @return {Map} 返回map
 */
function createMap(divId) {
  map = L.map(divId, {
    center: [29.12495511624777, 113.57457709047115],
    zoom: 5,
    zoomControl: false, // 禁用 + - 按钮
    doubleClickZoom: false, // 禁用双击放大
    attributionControl: false, // 移除右下角leaflet标识
  });

  return map;
}

/**
 * 缩放至点
 * @param {MapView} mapView
 * @param {Array} center
 * @param {BigInt} zoom
 */
function zoomTo(mapView, center, zoom) {
  let opts = { duration: 500 }; //移动所需时间
  mapView.goTo(
    {
      center: center,
      zoom: zoom,
    },
    opts
  );
}
