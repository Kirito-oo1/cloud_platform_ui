export { flyToExtent, flyTo };
/**
 * 视角跳转四角坐标
 * @param {*} viewer  三维视图对象
 * @param {*} leftX 左下角经度
 * @param {*} bottomY 左下角纬度
 * @param {*} rightX 右上角经度
 * @param {*} upperY 右上角纬度
 */
function flyToExtent(leftX, bottomY, rightX, upperY) {
  let rectangle = new window.Cesium.Rectangle.fromDegrees(leftX, bottomY, rightX, upperY);
  window.viewer.camera.flyTo({
    destination: rectangle,
  });
}

/**
 * 视角跳转相机飞入
 * @param {*} viewer
 * @param {*} lng
 * @param {*} lat
 * @param {*} height
 * @param {*} heading
 * @param {*} pitch
 * @param {*} roll
 */
function flyTo(lng, lat, height, heading, pitch, roll) {
  window.viewer.camera.flyTo({
    destination: new window.Cesium.Cartesian3.fromDegrees(lng, lat, height),
    orientation: {
      heading: heading,
      pitch: pitch,
      roll: roll,
    },
    duration: 1, // 飞行到目标的时间（秒）
  });
}
