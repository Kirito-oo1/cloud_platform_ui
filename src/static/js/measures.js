var Cesium = require('cesium/Cesium');

export default {
    measureLength(measureCallback) {
        clearEvents();
        window.handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);

        var _tempPoints = [];
        var _tempEntities = [];
        var _poly = null;
        var _pointMoving = null;

        var LenTextPrimitive = (function() {
            function _(point, txt) {
                this.option = {
                    name: 'measure_label',
                    position: point,
                    label: {
                        font: '16px sans-serif',
                        fillColor: Cesium.Color.CRIMSON,
                        style: Cesium.LabelStyle.FILL,
                        outlineWidth: 2,
                        outlineColor: Cesium.Color.BLACK,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        text: txt,
                        showBackground: true,
                        backgroundColor: Cesium.Color.WHITE.withAlpha(1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                };
                this.position = point;
                this.text = txt;
                this.entity = null;
                this._init();
            }

            _.prototype._init = function() {
                var _self = this;
                _self.entity = addEntity(this.option);
            };
            return _;

        })();

        // 量测线，包含2个点的直线段，和位于线段中间的距离注记
        var MeasureLinePrimitive = (function() {
            function _(positions) {
                this.option = {
                    name: 'measure_length',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CRIMSON,
                        width: 3,
                        clampToGround: true,
                    },
                    label: {
                        font: '16px sans-serif',
                        fillColor: Cesium.Color.CRIMSON,
                        style: Cesium.LabelStyle.FILL,
                        outlineWidth: 2,
                        outlineColor: Cesium.Color.BLACK,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        showBackground: true,
                        backgroundColor: Cesium.Color.WHITE.withAlpha(1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                };
                this.positions = positions;
                this.entity = null;
                this.text = null;
                this._init();
            }


            _.prototype._init = function() {
                var _self = this;
                var _update = function() {
                    return _self.positions;
                };
                var _update_label = function() {
                    var len = _self.positions.length;
                    return _self.positions[len - 1];
                };
                var _text = function() {
                    var len = _self.positions.length;
                    var totle = 0;
                    for (var i = 0; i < len - 1; i++) {
                        totle += getDistance(_self.positions[i], _self.positions[i + 1])
                    }
                    _self.text = getDistanceString(totle);
                    return _self.text;
                };
                this.option.polyline.positions = new Cesium.CallbackProperty(_update, false);
                this.option.position = new Cesium.CallbackProperty(_update_label, false);
                this.option.label.text = new Cesium.CallbackProperty(_text, false);
                _self.entity = addEntity(this.option);
            };
            return _;
        })();

        window.handler.setInputAction(function(click) {
            if (_tempPoints.length > 0) {
                if (_pointMoving) {
                    _tempPoints.pop();
                }
            }
            var _cartesian = screen2Map(click.position);
            if (_cartesian) {
                var canAdd = true;
                if (_tempPoints.length > 0) {
                    var pt = _tempPoints[_tempPoints.length - 1];
                    if (Math.abs(pt.x - _cartesian.x) < Cesium.Math.EPSILON4 && Math.abs(pt.y - _cartesian.y) < Cesium.Math.EPSILON4 && Math.abs(pt.z - _cartesian.z) < Cesium.Math.EPSILON4) {
                        canAdd = false;
                    }
                }
                if (canAdd) {
                    _tempPoints.push(_cartesian.clone());
                }
            }
            _pointMoving = null;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        window.handler.setInputAction(function(position) {
            if (_tempPoints.length >= 1) {
                var pt = screen2Map(position.endPosition);
                if (pt) {
                    if (_pointMoving) {
                        _tempPoints.pop();
                    } else if (_tempEntities.length + 1 < _tempPoints.length) {
                        var txt = new LenTextPrimitive(_tempPoints[_tempPoints.length - 1], _poly.text);
                        _tempEntities.push(txt.entity);
                    }
                    _pointMoving = pt;
                    _tempPoints.push(_pointMoving);
                    if (!Cesium.defined(_poly)) {
                        _poly = new MeasureLinePrimitive(_tempPoints);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        window.handler.setInputAction(function(position) {
            _tempPoints = [];
            _poly = null;
            _pointMoving = null;
            _tempEntities = [];
            clearEvents();
            measureCallback();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        window.handler.setInputAction(function(click) {
            if (_tempPoints.length > 2) {
                // 如果有移动店，则先删除最后的那个移动的点
                if (_pointMoving) {
                    _tempPoints.pop();
                }
                // 删除最后一个长度注记
                removeEntity(_tempEntities[_tempEntities.length - 1]);
                _tempEntities.pop();
                // 删除最后的一个固定点
                _tempPoints.pop();
                // 将当前点添加为移动点
                var pt = screen2Map(click.position);
                _pointMoving = pt;
                _tempPoints.push(_pointMoving);
            } else if (_tempPoints.length == 2) {
                if (_poly) {
                    removeEntity(_poly.entity);
                    _poly = null;
                }
                _pointMoving = null;
                _tempPoints = [];
            } else {
                _tempPoints = [];
                _poly = null;
                _pointMoving = null;
                _tempEntities = [];
                clearEvents();
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },

    measureArea(measureCallback) {
        clearEvents();
        window.handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);

        var _tempPoints = [];
        var _pointMoving = null;
        var _clamline = null;
        var _labelDynText = null;
        var _polygon = null;
        var _labelCenter = null;
        var _labelText = null;

        var ClampLinePrimitive = (function() {
            function _(positions) {
                this.option = {
                    name: 'measure_line',
                    polyline: {
                        show: true,
                        positions: [],
                        width: 2,
                        material: Cesium.Color.CRIMSON.withAlpha(0.7),
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this.entity = null;
                this._init();
            }

            _.prototype._init = function() {
                var _self = this;
                var _update = function() {
                    return _self.positions;
                }
                this.option.polyline.positions = new Cesium.CallbackProperty(_update, false);
                _self.entity = addEntity(this.option);
            };
            return _;
        })();

        var TextPrimitive = (function() {
            function _(point, txt) {
                this.option = {
                    name: 'measure_label',
                    position: point,
                    label: {
                        font: '16px sans-serif',
                        fillColor: Cesium.Color.CRIMSON,
                        style: Cesium.LabelStyle.FILL,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        text: txt,
                        showBackground: true,
                        backgroundColor: Cesium.Color.WHITE.withAlpha(1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                };
                this.position = point;
                this.text = txt;
                this.entity = null;
                this._init();
            }

            _.prototype._init = function() {
                var _self = this;
                var _updatePosition = function() {
                    return _self.position;
                }
                var _updateText = function() {
                    return _self.text;
                }
                this.option.position = new Cesium.CallbackProperty(_updatePosition, false);
                this.option.label.text = new Cesium.CallbackProperty(_updateText, false);
                _self.entity = addEntity(this.option);
            };
            return _;

        })();

        function getAreaString(points) {
            var _points = [];
            for (var e in points) {
                var cartographic = Cesium.Cartographic.fromCartesian(points[e]);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                _points.push([Number(lng), Number(lat)]);
            }

            var _area = calculateArea(_points);
            var dw = "平方米";
            if (_area / 1000000 > 1) {
                _area = _area / 1000000;
                dw = "平方公里";
            }
            return _area.toFixed(2) + dw;
        }

        function drawPolygon(positionData) {
            var shape;
            shape = addEntity({
                name: 'measure_area',
                polygon: {
                    hierarchy: positionData,
                    material: new Cesium.ColorMaterialProperty(Cesium.Color.CRIMSON.withAlpha(0.5)),
                    // clampToGround: true,
                    geometryHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    outline: true,
                    outlineWidth: 3,
                    outlineColor: Cesium.Color.CRIMSON
                },
                // polyline: {
                //   positions: positionData.getValue().positions,
                //   show: true,
                //   width: 3,
                //   material: Cesium.Color.CRIMSON
                // }
            });
            return shape;
        }

        window.handler.setInputAction(function(click) {
            var _cartesian = screen2Map(click.position);
            if (_cartesian) {
                if (_pointMoving) {
                    _tempPoints.pop();
                    _pointMoving = null;
                }
                _tempPoints.push(_cartesian);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        window.handler.setInputAction(function(movement) {
            if (_tempPoints.length >= 1) {
                if (_pointMoving) {
                    _tempPoints.pop();
                }
                _pointMoving = screen2Map(movement.endPosition);
                if (!_pointMoving) return;
                _tempPoints.push(_pointMoving);
                //两个点，绘制连线
                if (_tempPoints.length == 2) {
                    if (!Cesium.defined(_clamline)) {
                        _clamline = new ClampLinePrimitive(_tempPoints);
                    }
                } else if (_tempPoints.length > 2) {
                    if (!Cesium.defined(_polygon)) {
                        var dynamicPositions = new Cesium.CallbackProperty(function() {
                            return new Cesium.PolygonHierarchy(_tempPoints);
                        }, false);
                        _polygon = drawPolygon(dynamicPositions);
                        //_polygon = new MeasureAreaPrimitive(_tempPoints);
                    }
                    // 删掉第一和第二个点之间的动态连线
                    if (Cesium.defined(_clamline)) {
                        removeEntity(_clamline.entity);
                        _clamline = null;
                    }
                    var tempht = Cesium.Cartographic.fromCartesian(_pointMoving);
                    _labelCenter = Cesium.Cartesian3.fromDegrees(tempht.longitude * 180 / Math.PI, tempht.latitude * 180 / Math.PI, tempht.height);
                    _labelText = getAreaString(_tempPoints);
                    if (!Cesium.defined(_labelDynText)) {
                        _labelDynText = new TextPrimitive(_labelCenter, _labelText);
                    } else {
                        _labelDynText.position = _labelCenter;
                        _labelDynText.text = _labelText;
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        window.handler.setInputAction(function(movement) {
            if (Cesium.defined(_clamline)) {
                removeEntity(_clamline.entity);
            }
            _pointMoving = null;
            _labelDynText = null;
            _clamline = null;
            clearEvents();
            measureCallback();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        window.handler.setInputAction(function(movement) {
            var _tempLength = _tempPoints.length;
            if (_tempLength > 3) {
                _tempPoints.splice(_tempLength - 2, 1); // 删除倒数第二个点
            } else {
                if (Cesium.defined(_polygon)) {
                    removeEntity(_polygon);
                    _polygon = null;
                }
                if (Cesium.defined(_labelDynText)) {
                    removeEntity(_labelDynText.entity);
                    _labelDynText = null;
                }
                if (_tempLength == 3) {
                    // 只有3个点，表示绘制的面，需要删除中间的点，变换为线模式
                    _tempPoints.splice(1, 1);
                    if (!Cesium.defined(_clamline)) {
                        _clamline = new ClampLinePrimitive(_tempPoints);
                    }
                } else if (_tempLength == 2) {
                    // 还没有成面，则右键清空点集合中的数据
                    _tempPoints = [];
                    _pointMoving = null;
                    if (Cesium.defined(_clamline)) {
                        removeEntity(_clamline.entity);
                        _clamline = null;
                    }
                } else {
                    // 结束操作
                    _pointMoving = null;
                    _labelDynText = null;
                    _clamline = null;
                    _polygon = null;
                    _tempPoints = [];
                    clearEvents();
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        var earthRadiusMeters = 6371000.0;
        var metersPerDegree = 2.0 * Math.PI * earthRadiusMeters / 360.0;
        var radiansPerDegree = Math.PI / 180.0;
        var degreesPerRadian = 180.0 / Math.PI;

        function calculateArea(points) {
            if (points.length > 2) {
                var areaMeters2 = PlanarPolygonAreaMeters2(points);
                if (areaMeters2 > 1000000.0) {
                    areaMeters2 = SphericalPolygonAreaMeters2(points);
                }
            }
            return areaMeters2;
        }

        /*球面多边形面积计算*/
        function SphericalPolygonAreaMeters2(points) {
            var totalAngle = 0;
            for (var i = 0; i < points.length; i++) {
                var j = (i + 1) % points.length;
                var k = (i + 2) % points.length;
                totalAngle += Angle(points[i], points[j], points[k]);
            }
            var planarTotalAngle = (points.length - 2) * 180.0;
            var sphericalExcess = totalAngle - planarTotalAngle;
            if (sphericalExcess > 420.0) {
                totalAngle = points.length * 360.0 - totalAngle;
                sphericalExcess = totalAngle - planarTotalAngle;
            } else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
                sphericalExcess = Math.abs(360.0 - sphericalExcess);
            }
            return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
        }

        /*角度*/
        function Angle(p1, p2, p3) {
            var bearing21 = Bearing(p2, p1);
            var bearing23 = Bearing(p2, p3);
            var angle = bearing21 - bearing23;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        }


        /*方向*/
        function Bearing(from, to) {
            var lat1 = from[1] * radiansPerDegree;
            var lon1 = from[0] * radiansPerDegree;
            var lat2 = to[1] * radiansPerDegree;
            var lon2 = to[0] * radiansPerDegree;
            var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            angle = angle * degreesPerRadian;
            return angle;
        }

        /*平面多边形面积*/
        function PlanarPolygonAreaMeters2(points) {
            var a = 0;
            for (var i = 0; i < points.length; ++i) {
                var j = (i + 1) % points.length;
                var xi = points[i][0] * metersPerDegree * Math.cos(points[i][1] * radiansPerDegree);
                var yi = points[i][1] * metersPerDegree;
                var xj = points[j][0] * metersPerDegree * Math.cos(points[j][1] * radiansPerDegree);
                var yj = points[j][1] * metersPerDegree;
                a += xi * yj - xj * yi;
            }
            return Math.abs(a / 2);
        }
    },

    measureTriangle(measureCallback) {
        clearEvents();
        window.handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);

        var _tri_ln_hor = null;
        var _tri_ln_ver = null;
        var _tri_ln_slp = null;
        var _tri_pts_hor = [];
        var _tri_pts_slp = [];
        var _tri_pts_ver = [];
        var _pointMoving = null;

        // 量测线，包含2个点的直线段，和位于线段中间的距离注记
        var TriLinePrimitive = (function() {
            function _(positions) {
                this.option = {
                    name: 'measure_dist',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CRIMSON,
                        width: 2,
                    },
                    label: {
                        font: '16px sans-serif',
                        fillColor: Cesium.Color.CRIMSON,
                        style: Cesium.LabelStyle.FILL,
                        outlineWidth: 3,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        showBackground: true,
                        backgroundColor: Cesium.Color.WHITE.withAlpha(1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                };
                this.positions = positions;
                this.entity = null;
                this._init();
            }


            _.prototype._init = function() {
                var _self = this;
                var _update = function() {
                    return _self.positions;
                };
                var _update_label = function() {
                    return new Cesium.Cartesian3((_self.positions[1].x + _self.positions[0].x) / 2, (_self.positions[1].y + _self.positions[0].y) / 2, (_self.positions[1].z + _self.positions[0].z) / 2);
                };
                var _text = function() {
                    return getDistanceString(getDistance(_self.positions[0], _self.positions[1]));
                };
                this.option.polyline.positions = new Cesium.CallbackProperty(_update, false);
                this.option.position = new Cesium.CallbackProperty(_update_label, false);
                this.option.label.text = new Cesium.CallbackProperty(_text, false);
                _self.entity = addEntity(this.option);
            };
            return _;

        })();


        window.handler.setInputAction(function(click) {
            if (_tri_pts_slp.length == 0) {
                var _cartesian = screen2Map(click.position);
                if (_cartesian) {
                    _tri_pts_slp.push(_cartesian.clone());
                    _tri_pts_ver.push(_cartesian.clone());
                }
            } else {
                _tri_ln_hor = null;
                _tri_ln_ver = null;
                _tri_ln_slp = null;
                _tri_pts_slp = [];
                _tri_pts_ver = [];
                _tri_pts_hor = [];
                clearEvents();
                measureCallback();
            }
            _pointMoving = null;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        window.handler.setInputAction(function(movement) {
            if (_tri_pts_slp.length >= 1) {
                if (_pointMoving) {
                    _tri_pts_slp.pop();
                    _tri_pts_ver.pop();
                }
                _pointMoving = screen2Map(movement.endPosition);
                if (!_pointMoving) return;
                _tri_pts_slp.push(_pointMoving);
                //两个点，绘制连线
                if (_tri_pts_slp.length == 2) {
                    if (!Cesium.defined(_tri_ln_slp)) {
                        _tri_ln_slp = new TriLinePrimitive(_tri_pts_slp);
                    }
                    var car1 = Cesium.Cartographic.fromCartesian(_tri_pts_slp[0]);
                    var car2 = Cesium.Cartographic.fromCartesian(_tri_pts_slp[1]);
                    _tri_pts_ver.push(Cesium.Cartesian3.fromDegrees(car1.longitude * 180 / Math.PI, car1.latitude * 180 / Math.PI, car2.height));
                    if (!Cesium.defined(_tri_ln_ver)) {
                        _tri_ln_ver = new TriLinePrimitive(_tri_pts_ver);
                    }
                    if (_tri_pts_hor.length == 2) {
                        _tri_pts_hor.pop();
                        _tri_pts_hor.pop();
                    }
                    _tri_pts_hor.push(_pointMoving);
                    _tri_pts_hor.push(Cesium.Cartesian3.fromDegrees(car1.longitude * 180 / Math.PI, car1.latitude * 180 / Math.PI, car2.height));
                    if (!Cesium.defined(_tri_ln_hor)) {
                        _tri_ln_hor = new TriLinePrimitive(_tri_pts_hor);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        window.handler.setInputAction(function(movement) {
            if (_tri_pts_slp.length == 0) {
                _tri_ln_hor = null;
                _tri_ln_ver = null;
                _tri_ln_slp = null;
                _tri_pts_slp = [];
                _tri_pts_ver = [];
                _tri_pts_hor = [];
                clearEvents();
            } else {
                if (_tri_ln_hor) {
                    removeEntity(_tri_ln_hor.entity);
                    _tri_ln_hor = null;
                }
                if (_tri_ln_ver) {
                    removeEntity(_tri_ln_ver.entity);
                    _tri_ln_ver = null;
                }
                if (_tri_ln_slp) {
                    removeEntity(_tri_ln_slp.entity);
                    _tri_ln_slp = null;
                }
                _tri_pts_slp = [];
                _tri_pts_ver = [];
                _tri_pts_hor = [];
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },

    clearDraw(){
        removeEntity();
        clearEvents();
    }
}
var arr = [];
function addEntity(entity) {
    var el = window.viewer.entities.add(entity);
    arr.push(el);
    return el;
}

function getDistance(point1, point2) {
    return Math.sqrt((point2.x - point1.x) * (point2.x - point1.x) + (point2.y - point1.y) * (point2.y - point1.y) + (point2.z - point1.z) * (point2.z - point1.z));
}

function getDistanceString(distance) {
    var dist = distance;
    var dw = "米";
    if (dist / 10000 > 1) {
        dist = dist / 1000;
        dw = "公里";
    }
    return dist.toFixed(2) + dw;
}

function screen2Map(screenPoint) {
    var ray = window.viewer.scene.camera.getPickRay(screenPoint);
    var position1 = window.viewer.scene.globe.pick(ray, window.viewer.scene);
    var feature = window.viewer.scene.pick(screenPoint);
    if (window.viewer.scene.pickPositionSupported && Cesium.defined(feature)) {
        var cartesian = window.viewer.scene.pickPosition(screenPoint);
        if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height; //模型高度
            if (height > 0) {
                return Cesium.Cartesian3.fromDegrees(lng, lat, height);
            }
        }
    }
    return position1;
}

function removeEntity(entity) {
  if(entity != undefined){
    window.viewer.entities.remove(entity);
  }else{
    arr.forEach(item => {
      window.viewer.entities.remove(item);
    })
    arr = [];
  }
}

function clearEvents() {
    document.getElementById("cesiumMap").style.cursor = "default";
    if (window.handler) {
        window.handler.destroy();
        window.handler = undefined;
    }
    window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
}