import turf, { feature } from 'turf';
import { changeBuildColor } from './layer';
export {
  identify,
  highlightFeature,
  clearHighlightModel,
  searchId
};
/**
 * 空间查询
 * @param {String} url wfs服务地址
 * @param {String} geoFieldName 几何字段名称，数据源为shp时对应的是the_geom,数据源为数据库时对应的是geom
 * @param {String} point 查询点[long,lat]
 * @return {Array} 返回查询到的要素集合 
 */
function identify(viewer, url, geoFieldName, point, bufferDis) {
  let queryGeo = constructQueryGeo(point, bufferDis);
  let selectCode = sessionStorage.getItem("selectCode");
  url = url + "&cql_filter=code like '" + selectCode + "%25' AND INTERSECTS(" + geoFieldName + ",POLYGON((" + queryGeo + ")))";
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      return data;
    }).catch(err => {
      rejectedPromise(err);
    });

};


//构建空间查询条件
function constructQueryGeo(point, bufferDis) {
  let queryPoint = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": point
    }
  };
  let queryGeo = turf.buffer(queryPoint, bufferDis, 'meters');
  let queryGeoCoords = queryGeo.geometry.coordinates[0];
  let i = 0;
  let queryGeoCoordStr = '';
  queryGeoCoords.forEach(geoCoord => {
    if (i == 0) {
      queryGeoCoordStr += geoCoord[0] + ' ' + geoCoord[1];
    } else {
      queryGeoCoordStr = queryGeoCoordStr + ',' + geoCoord[0] + ' ' + geoCoord[1];
    }
    i++;
  });
  return queryGeoCoordStr;
}

/**
 * 高亮显示模型
 * @param {*} viewer 地图视图
 * @param {*} feature 要素
 */
function highlightFeature(viewer, feature) {
  clearHighlightModel(viewer, feature);
  //单体化
  var promise = Cesium.GeoJsonDataSource.load(feature.feature.geometry, {
    clampToGround: true,
    fill: Cesium.Color.fromAlpha(Cesium.Color.LIGHTSEAGREEN, 0.5),
  });
  promise.then((datasource) => {
    let entities = datasource.entities.values;
    datasource.name = "tilemodel";
    window.viewer.dataSources.add(datasource).then((res) => {
      res.name = feature.layerId;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i]
        var positions = entity.polygon.hierarchy._value.positions;
        entity.polyline = {
          positions: positions,
          width: 10,
          material: Cesium.Color.fromAlpha(Cesium.Color.LIGHTSEAGREEN, 0.5),
          clampToGround: true
        }
        entity.polygon.hierarchy = new Cesium.PolygonHierarchy(positions);
      }
    })
  });
}

//清除高亮显示的三维模型
function clearHighlightModel(viewer, feature) {
  var dataSources = viewer.dataSources.getByName(feature.layerId);
  for (var i = 0; i < dataSources.length; i++) {
    viewer.dataSources.remove(dataSources[i], true);
  }
}

//输出错误信息
function rejectedPromise() {
  console.error('未点击到楼栋或此处没有数据');
}

/**
 * ID查询待附色
 * @param {String} url 
 * @param {String} buildname 
 * @param {String} layername 
 * @return {Array} 返回查询到的要素集合 
 */
function searchId(url, buildname, layername) {
  let selectCode = sessionStorage.getItem("selectCode");
  url = url + "&cql_filter=name = '" + `${buildname}` + "' and code = '" + selectCode + "'";
  // console.log("编码",encodeURIComponent(url)); 
  // let encodeUrl = encodeURIComponent(url)
  // console.log("解码",decodeURIComponent(encodeUrl)); 
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      var promise = Cesium.GeoJsonDataSource.load(data.features[0], {
        clampToGround: true,
      });
      promise.then((qxdatasource) => {
        qxdatasource.name = layername;
        window.viewer.dataSources.add(qxdatasource);
        let entities = qxdatasource.entities.values;
        let buildIdd = JSON.parse(sessionStorage.getItem('buildArr'));
        changeBuildColor(buildIdd, entities);
      })
    }).catch(err => {
      console.error('倾斜模型附色错误');
    });

};
