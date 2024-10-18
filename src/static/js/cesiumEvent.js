import $ from 'jquery';
export function cesiumEvent(type, callback) {
  let handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
  //取消左键双击事件
  handler.setInputAction(function (movement) {
    viewer.trackedEntity = undefined;
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 左键点击事件
  let leftclick = Cesium.ScreenSpaceEventType.LEFT_CLICK;
  window.viewer.screenSpaceEventHandler.removeInputAction(leftclick);
  handler.setInputAction((e) => {
    let pickObj = window.viewer.scene.pick(e.position);
    if (Cesium.defined(pickObj)) {
      let id = pickObj.id;
      console.log('点击获取到的实体', pickObj);
      //点击3DTile
      if (pickObj.primitive instanceof Cesium.Cesium3DTileset) {
        //3dTiles的子模型属性
        let cartesian = window.viewer.scene.pickPosition(e.position);
        if (!Cesium.defined(cartesian)) {
          return;
        }
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lonString = Cesium.Math.toDegrees(
          cartographic.longitude
        );
        let latString = Cesium.Math.toDegrees(
          cartographic.latitude
        );
        let elev = window.viewer.scene.globe.getHeight(cartographic);
        let name = "tilemodel"
        let tilepostion = {
          name,
          lonString,
          latString
        }
        callback(tilepostion);
        // //设置Popup属性
        let values = Cesium.Cartesian3.fromDegrees(lonString, latString, elev);
        let scratch = new Cesium.Cartesian3();
        window.viewer.scene.postRender.addEventListener(function () {
          let selectCenter = null;
          selectCenter = values;
          var canvasPosition = window.viewer.scene.cartesianToCanvasCoordinates(selectCenter,scratch); //转换为屏幕坐标
          if (Cesium.defined(canvasPosition)) {
            $(".cardBox").css("top", parseFloat(canvasPosition.y) - parseFloat($(".cardBox").outerHeight()) + 'px');
            $(".cardBox").css("left", parseFloat(canvasPosition.x) + 'px');
            let camerPosition = window.viewer.camera.position;
            let height =
              window.viewer.scene.globe.ellipsoid.cartesianToCartographic(
                camerPosition
              ).height;
            height += window.viewer.scene.globe.ellipsoid.maximumRadius;
            if (
              !(
                Cesium.Cartesian3.distance(camerPosition, selectCenter) >
                height
              ) &&
              window.viewer.camera.positionCartographic.height < 50000000
            ) {
              $(".cardBox").css("display", "block");
            } else {
              $(".cardBox").css("display", "none");
            }
          }
        });
      }

      //点击Entity
      if (id && id instanceof Cesium.Entity) {
        if(id.name == "measure_length" || id.name =="measure_line" || id.name == "measure_area" || id.name == "measure_dist"){
          return
        }
        // 屏幕坐标转经纬度
        let cartesian = window.viewer.scene.globe.pick(window.viewer.camera.getPickRay(e.position), window.viewer.scene);
        // 世界坐标转换为弧度
        let ellipsoid = window.viewer.scene.globe.ellipsoid;
        let cartographic = ellipsoid.cartesianToCartographic(cartesian);
        let lonString = Cesium.Math.toDegrees(
          cartographic.longitude
        );
        let latString = Cesium.Math.toDegrees(
          cartographic.latitude
        );
        let elev = window.viewer.scene.globe.getHeight(cartographic);
        callback(id);
        let values = Cesium.Cartesian3.fromDegrees(lonString, latString, elev);
        let scratch = new Cesium.Cartesian3();
        window.viewer.scene.postRender.addEventListener(function () {
          let selectCenter = null;
          selectCenter = values;
          var canvasPosition = window.viewer.scene.cartesianToCanvasCoordinates(selectCenter,scratch); //转换为屏幕坐标
          if (Cesium.defined(canvasPosition)) {
            $(".cardBox").css("top", parseFloat(canvasPosition.y) - parseFloat($(".cardBox").outerHeight()) + 'px');
            $(".cardBox").css("left", parseFloat(canvasPosition.x) + 'px');
            let camerPosition = window.viewer.camera.position;
            let height =
              window.viewer.scene.globe.ellipsoid.cartesianToCartographic(
                camerPosition
              ).height;
            height += window.viewer.scene.globe.ellipsoid.maximumRadius;
            if (
              !(
                Cesium.Cartesian3.distance(camerPosition, selectCenter) >
                height
              ) &&
              window.viewer.camera.positionCartographic.height < 50000000
            ) {
              $(".cardBox").css("display", "block");
            } else {
              $(".cardBox").css("display", "none");
            }
          }
        });
      }

      //点击primitive
      if (pickObj.primitive instanceof Cesium.Primitive) {
        //primitive相关操作
      }

      //点击gltf/glb模型
      if (pickObj.primitive instanceof Cesium.Model) {
        if (type == "model" && callback != null) {
          pickObj.type = "model";
          callback(pickObj); // gltf ,glb 点击
          //模型gltf/glb相关操作
        }
      }


      if (pickObj.getProperty && pickObj.getProperty("name")) { //点击3DTile
        //pickObj.getProperty("name"): 子模型名称
        //模型相关操作
      }

      if (e && e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble = true
      }
      
      return
    }
  }, leftclick)

}
