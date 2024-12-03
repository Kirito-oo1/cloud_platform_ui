/*
 * @Author: hechen 15291492336@163.com
 * @Date: 2022-06-25 16:27:40
 * @LastEditors: hechen 15291492336@163.com
 * @LastEditTime: 2022-06-30 23:31:03
 * @FilePath: \3dview_web\static\js\cesium-components.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// 初始化底图
function initMap(Cesium, dom) {
  let viewer = new Cesium.Viewer(dom, {
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
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
    }),
    // imageryProvider: new Cesium.TileMapServiceImageryProvider({
    //   url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
    // }), //修改默认贴图
  });
  viewer._cesiumWidget._creditContainer.style.display = "none"; //去除底部版权信息
  //   viewer.imageryLayers.get(0).show = false; //设置cesium默认底图不显示
  viewer.scene.postProcessStages.fxaa.enabled = true; // 开启抗锯齿

  viewer.scene.skyAtmosphere.show = false; //去掉大气层

  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50; //设置最小缩放
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 10000; //设置最大缩放

  // 构建图形模块
  viewer.graphicsLayer = new Cesium.CustomDataSource("graphicsLayer");
  viewer.dataSources.add(viewer.graphicsLayer);

  installCityLineMaterial(Cesium);
  initWallCustomMaterialProperty(Cesium);
  installFlowMaterialfunction(Cesium);
  installWaveCircleMaterial(Cesium);
  installCss3Renderer(Cesium, viewer);
  return { Cesium, viewer };
}
// 添加天地图
function addTdtLayer(Cesium, viewer, tdtUrlHost, subdomains, tk, type) {
  let imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
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
  viewer.imageryLayers.addImageryProvider(imageryProvider);
}
// 添加白模
function addWriteModules(Cesium, viewer, options) {
  let tileset = new Cesium.Cesium3DTileset({
    url: options.url,
  });
  // 添加到球体上
  viewer.scene.primitives.add(tileset);

  tileset.style = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [["true", options.color]],
    },
  });
  //实现渐变效果
  if (options.animation) {
    tileset.tileVisible.addEventListener(function (tile) {
      var content = tile.content;
      var featuresLength = content.featuresLength;
      for (let i = 0; i < featuresLength; i += 2) {
        let feature = content.getFeature(i);
        let model = feature.content._model;

        if (model && model._sourcePrograms && model._rendererResources) {
          Object.keys(model._sourcePrograms).forEach((key) => {
            let program = model._sourcePrograms[key];
            let fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
            let v_position = "";
            if (fragmentShader.indexOf(" v_positionEC;") != -1) {
              v_position = "v_positionEC";
            } else if (fragmentShader.indexOf(" v_pos;") != -1) {
              v_position = "v_pos";
            }
            const color = `vec4(${feature.color.toString()})`;

            model._rendererResources.sourceShaders[program.fragmentShader] = `
                varying vec3 ${v_position};
                void main(void){
                  vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
                  gl_FragColor = ${color}; // 颜色
                  gl_FragColor *= vec4(vec3(position.z / 40.0), 0.8); // 渐变
                 
                  // 动态光环
                  float time = fract(czm_frameNumber / 180.0);
                  time = abs(time - 0.5) * 2.0;
                  float glowRange = 180.0; // 光环的移动范围(高度)
                  float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
                  gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
                }
              `;
          });
          model._shouldRegenerateShaders = true;
        }
      }
    });
  }
  viewer.flyTo(tileset);
}

//添加模型并移动位置
function load3DTilesBuild(Cesium, viewer, uri, params) {
  var tileset3 = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: uri,
      maximumScreenSpaceError: 2,
      maximumMemoryUsage: 200,
      maximumNumberOfLoadedTiles: 1900,
    })
  );

  tileset3.readyPromise.then(function (tile) {
    // 调整模型高度，使紧贴地球的地形
    var cartographic = Cesium.Cartographic.fromCartesian(tile.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height); // cartographic.height
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, params.height);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    tile.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    tileset3.readyPromise.then(function (argument) {
      update3dtilesMaxtrix(Cesium, viewer, tileset3, params);
    });
  });
}
//模型移动更新
function update3dtilesMaxtrix(Cesium, viewer, tileset, params) {
  var heading = 0; // 方位角
  // 1、旋转
  let hpr = new Cesium.Matrix3();
  // new Cesium.HeadingPitchRoll(heading, pitch, roll)
  // heading围绕负z轴的旋转。pitch是围绕负y轴的旋转。Roll是围绕正x轴的旋转
  let hprObj = new Cesium.HeadingPitchRoll(Math.PI, Math.PI, Math.PI);
  //  Cesium.Matrix3.fromHeadingPitchRoll （headingPitchRoll，result）
  hpr = Cesium.Matrix3.fromHeadingPitchRoll(hprObj, hpr);
  // 2、平移
  // 2.3储存平移的结果
  let modelMatrix = Cesium.Matrix4.multiplyByTranslation(
    // 2.1从以度为单位的经度和纬度值返回Cartesian3位置
    // 2.2计算4x4变换矩阵
    Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude, params.height)),
    new Cesium.Cartesian3(),
    new Cesium.Matrix4()
  );
  /// 3、应用旋转
  // Cesium.Matrix4.multiplyByMatrix3 （矩阵，旋转，结果）
  Cesium.Matrix4.multiplyByMatrix3(modelMatrix, hpr, modelMatrix);
  tileset._root.transform = modelMatrix;
  viewer.scene.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude, 1400),
  });
}

//雨天特效
function setRainEffect(Cesium, viewer) {
  if (viewer) {
    var fs =
      "uniform sampler2D colorTexture;\n\
    varying vec2 v_textureCoordinates;\n\
    \n\
    float hash(float x){\n\
    return fract(sin(x*23.3)*13.13);\n\
    }\n\
    \n\
    void main(){\n\
        float time = czm_frameNumber / 60.0;\n\
        vec2 resolution = czm_viewport.zw;\n\
        vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
        vec3 c=vec3(.6,.7,.8);\n\
        float a=-.4;\n\
        float si=sin(a),co=cos(a);\n\
        uv*=mat2(co,-si,si,co);\n\
        uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
        float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
        float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
        c*=v*b;\n\
        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), 0.2);\n\
    }\n\
    ";
    return viewer.scene.postProcessStages.add(
      new Cesium.PostProcessStage({
        name: "rainEffect",
        fragmentShader: fs,
      })
    );
  }
}
//雪天特效
function setSnowEffect(Cesium, viewer) {
  if (viewer) {
    var fs =
      "uniform sampler2D colorTexture;\n\
      varying vec2 v_textureCoordinates;\n\
      \n\
      float snow(vec2 uv,float scale){\n\
          float time = czm_frameNumber / 60.0;\n\
          float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
          if(w<.1)return 0.;\n\
          uv+=time/scale;\n\
          uv.y+=time*2./scale;\n\
          uv.x+=sin(uv.y+time*.5)/scale;\n\
          uv*=scale;\n\
          vec2 s=floor(uv),f=fract(uv),p;\n\
          float k=3.,d;\n\
          p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
          d=length(p);\n\
          k=min(d,k);\n\
          k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
          return k*w;\n\
      }\n\
      \n\
      void main(){\n\
          vec2 resolution = czm_viewport.zw;\n\
          vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
          vec3 finalColor=vec3(0);\n\
          float c = 0.0;\n\
          c+=snow(uv,30.)*.0;\n\
          c+=snow(uv,20.)*.0;\n\
          c+=snow(uv,15.)*.0;\n\
          c+=snow(uv,10.);\n\
          c+=snow(uv,8.);\n\
          c+=snow(uv,6.);\n\
          c+=snow(uv,5.);\n\
          finalColor=(vec3(c));\n\
          gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
          \n\
      }\n\
      ";
    return viewer.scene.postProcessStages.add(
      new Cesium.PostProcessStage({
        name: "snowEffect",
        fragmentShader: fs,
      })
    );
  }
}

//创建点信息
function createPointsGraphics(Cesium, viewer, options) {
  if (options && options.positions) {
    let position = options.positions;
    let entity = new Cesium.Entity();
    entity.name = options.name || "";
    entity.oid = options.oid || "point";
    entity.position = position;
    if (options.point) entity.point = getPointGraphics(Cesium);
    if (options.billboard) entity.billboard = getBillboardGraphics(Cesium, options.billboard);
    if (options.label) entity.label = getLabelGraphics(Cesium, options.label);
    viewer.graphicsLayer.entities.add(entity);
  }
}

//点
function getPointGraphics(Cesium, options) {
  options = options || {};
  if (options) {
    return new Cesium.PointGraphics({
      color: options.color || Cesium.Color.GREEN,
      pixelSize: options.pixelSize || 5,
      outlineColor: options.outlineColor || Cesium.Color.WHITE,
      outlineWidth: options.outlineWidth || 1,
    });
  }
}

//标签
function getLabelGraphics(Cesium, options) {
  options = options || {};
  if (options && options.l_text) {
    return new Cesium.LabelGraphics({
      //文字标签
      text: options.l_text,
      font: options.l_font || "14px sans-serif",
      fillColor: options.l_fillColor || Cesium.Color.GOLD,
      style: options.l_style || Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: options.l_outlineWidth || 2,
      showBackground: options.l_showBackground || false,
      backgroundColor: options.l_backgroundColor || new Cesium.Color(0.165, 0.165, 0.165, 0.8),
      verticalOrigin: options.l_verticalOrigin || Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: options.l_pixelOffset || new Cesium.Cartesian2(0, -30),
      //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    });
  }
}
//广告牌
function getBillboardGraphics(Cesium, options) {
  options = options || {};
  if (options && options.b_img) {
    return new Cesium.BillboardGraphics({
      image: options.b_img,
      width: options.b_width || 35,
      height: options.b_height || 35,
      clampToGround: options.b_clampToGround || true,
      scale: options.b_scale || 1,
      // eyeOffset :new Cesium.Cartesian2(0, -20),
      pixelOffset: options.b_pixelOffset || new Cesium.Cartesian2(0, -20),
      scaleByDistance: options.b_scaleByDistance || undefined,
      // heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
    });
  }
}

//动态旋转圆
function craeteDynamicCricleGraphics(Cesium, viewer, options) {
  if (options && options.positions) {
    var entity = new Cesium.Entity(),
      _radius = options.radius || 800,
      _rotateAmount = options.rotateAmount || 0.05,
      _stRotation = 0,
      _height = options.height || 1,
      heading = 0,
      pitch = 0,
      roll = 0,
      _scale = options.scale || null,
      _scale2 = options.scale2 || null,
      _material =
        options.material ||
        new Cesium.ImageMaterialProperty({
          image: options.imge,
          transparent: true,
        });

    entity.position = options.positions;

    entity.orientation = new Cesium.CallbackProperty(function () {
      return Cesium.Transforms.headingPitchRollQuaternion(options.positions, new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), Cesium.Math.toRadians(pitch), Cesium.Math.toRadians(roll)));
    }, false);
    let bg_scale = _radius,
      flag = false;
    var updateScalerAxis = () => {
      if (_radius >= _scale || _radius <= bg_scale) {
        flag = !flag;
      }
      flag ? (_radius += 2) : (_radius -= 2);
    };
    var updateScalerAxis2 = () => {
      _scale2 >= _radius ? (_radius += 2) : (_radius = bg_scale);
    };
    entity.ellipse = {
      material: _material,
      height: _height,
      semiMajorAxis: new Cesium.CallbackProperty(function () {
        return _radius;
      }, false),
      semiMinorAxis: new Cesium.CallbackProperty(function () {
        return _radius;
      }, false),
      stRotation: new Cesium.CallbackProperty(function () {
        if (_rotateAmount > 0) {
          _stRotation += _rotateAmount;
          if (_stRotation >= 360) {
            _stRotation = 0;
          }
        }
        if (_scale) updateScalerAxis();
        if (_scale2) updateScalerAxis2();
        return _stRotation;
      }, false),
    };
    viewer.graphicsLayer.entities.add(entity);
  }
}

//构建动态范围线
function craeteDynamicPolyLineGraphics(Cesium, viewer) {
  if (options && options.positions) {
    var entity = new Cesium.Entity();
    entity.polyline = {
      //   name:
      show: true,
      positions: [],
      material: options.material || Cesium.Color.CHARTREUSE,
      width: options.width || 5,
      clampToGround: options.clampToGround || false,
    };

    entity.polyline.positions = new Cesium.CallbackProperty(function () {
      return options.positions;
    }, false);

    return viewer.graphicsLayer.entities.add(entity);
  }
}
// 轨迹流动线
function installFlowMaterialfunction(Cesium) {
  var Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    createPropertyDescriptor = Cesium.createPropertyDescriptor,
    Property = Cesium.Property,
    Material = Cesium.Material;

  function PolylineFlowMaterialProperty(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Color.fromBytes(0, 255, 255, 255);
    this._duration = undefined;
    this._durationSubscription = undefined;
    this.duration = defaultValue(options.duration, 45);
  }

  defineProperties(PolylineFlowMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
  });

  PolylineFlowMaterialProperty.prototype.getType = function (time) {
    return Material.PolylineFlowType;
  };

  PolylineFlowMaterialProperty.prototype.getValue = function (time, result) {
    if (!result) {
      result = {};
    }
    result.color = Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.duration = this._duration;
    return result;
  };
  PolylineFlowMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof PolylineFlowMaterialProperty && Property.equals(this._color, other._color));
  };
  defineProperties(PolylineFlowMaterialProperty.prototype, {
    color: createPropertyDescriptor("color"),
    duration: createPropertyDescriptor("duration"),
  });

  Cesium.PolylineFlowMaterialProperty = PolylineFlowMaterialProperty;
  Material.PolylineFlowType = "PolylineFlow";
  Material._materialCache.addMaterial(Material.PolylineFlowType, {
    fabric: {
      type: Material.PolylineFlowType,
      uniforms: {
        color: new Color(1.0, 1.0, 2.0, 0.7),
        duration: 45,
      },
      source: _getFlowLineShader({ get: true }),
    },
    translucent: function (material) {
      return true;
    },
  });
}
// 流动线
function _getFlowLineShader(options) {
  if (options && options.get) {
    return "uniform vec4 color;\n\
  uniform float duration;\n\
  \n\
  czm_material czm_getMaterial(czm_materialInput materialInput){\n\
      czm_material material = czm_getDefaultMaterial(materialInput);\n\
      vec2 st = materialInput.st;\n\
      float t =fract(czm_frameNumber / duration);\n\
      t *= 1.03;\n\
      float alpha = smoothstep(t- 0.03, t, st.s) * step(-t, -st.s);\n\
      alpha += 0.1;\n\
      vec4 fragColor;\n\
      fragColor.rgb = (color.rgb) / 0.5;\n\
      fragColor = czm_gammaCorrect(fragColor);\n\
      material.diffuse = fragColor.rgb;\n\
      material.alpha = alpha;\n\
      material.emission = fragColor.rgb;\n\
      return material;\n\
  }\n\
  ";
  }
}

// 城市光效线
function installCityLineMaterial(Cesium) {
  var Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defined = Cesium.defined,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    createPropertyDescriptor = Cesium.createPropertyDescriptor,
    Property = Cesium.Property,
    Material = Cesium.Material,
    defaultColor = Color.WHITE;

  function PolylineCityLinkMaterialProperty(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Cesium.Color.BLUE;
    this.duration = options.duration || 1000;
    this._time = undefined;
    this.image = options.image || null;

    Material.PolylineCityLinkType = "PolylineCityLink";
    Material._materialCache.addMaterial(Material.PolylineCityLinkType, {
      fabric: {
        type: Material.PolylineCityLinkType,
        uniforms: {
          color: options.color,
          image: options.image,
          time: 0,
        },
        source: getDynamicLightLineShader({ get: true }),
      },
      translucent: function () {
        return true;
      },
    });
  }

  defineProperties(PolylineCityLinkMaterialProperty.prototype, {
    isvarant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
    color: createPropertyDescriptor("color"),
  });
  PolylineCityLinkMaterialProperty.prototype.getType = function (time) {
    return Material.PolylineCityLinkType;
  };
  PolylineCityLinkMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
      result = {};
    }
    result.color = Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
    result.image = Material.PolylineCityLinkImage;
    if (this._time === undefined) {
      this._time = time.secondsOfDay;
    }
    result.image = this.image;
    result.time = ((time.secondsOfDay - this._time) * 1000) / this.duration;
    return result;
  };
  PolylineCityLinkMaterialProperty.prototype.equals = function (other) {
    return (
      this === other || //
      (other instanceof PolylineCityLinkMaterialProperty && Property.equals(this._color, other._color))
    );
  };

  Cesium.PolylineCityLinkMaterialProperty = PolylineCityLinkMaterialProperty;
}

function getDynamicLightLineShader(options) {
  if (options && options.get) {
    return "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        vec2 st = materialInput.st;\n\
        \n\
        vec4 colorImage = texture2D(image, vec2(fract(1.0 *st.s - time), fract(st.t)));\n\
        \n\
        vec4 fragColor;\n\
        fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\
        fragColor = czm_gammaCorrect(fragColor);\n\
        material.diffuse = colorImage.rgb;\n\
        material.alpha = colorImage.a;\n\
        material.emission = fragColor.rgb;\n\
        \n\
        return material;\n\
    }\n\
    ";
  }
}

// 动态初始化材质线
function initWallCustomMaterialProperty(Cesium) {
  var Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defined = Cesium.defined,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    createPropertyDescriptor = Cesium.createPropertyDescriptor,
    Property = Cesium.Property,
    Material = Cesium.Material,
    MaterialType = "wallType" + parseInt(Math.random() * 1000);

  function WallLinkCustomMaterialProperty(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Color.BLUE;
    this.duration = options.duration || 3000;
    this._time = new Date().getTime();
    this.image = options.image;

    //动态墙
    Material._materialCache.addMaterial(MaterialType, {
      fabric: {
        type: MaterialType,
        uniforms: {
          color: new Color(1.0, 0.0, 0.0, 0.5),
          image: options.image,
          time: 0,
        },
        source: _getDirectionWallShader({
          get: true,
          count: options.count,
          freely: options.freely,
          direction: options.direction,
        }),
      },
      translucent: function (material) {
        return true;
      },
    });
  }

  defineProperties(WallLinkCustomMaterialProperty.prototype, {
    isvarant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
    color: createPropertyDescriptor("color"),
  });
  WallLinkCustomMaterialProperty.prototype.getType = function (time) {
    return MaterialType;
  };
  WallLinkCustomMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
      result = {};
    }
    result.color = Property.getValueOrClonedDefault(this._color, time, Color.WHITE, result.color);
    result.image = this.image;
    result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
    return result;
  };
  WallLinkCustomMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof WallLinkCustomMaterialProperty && Property.equals(this._color, other._color));
  };
  Cesium.WallLinkCustomMaterialProperty = WallLinkCustomMaterialProperty;
}
/**
 * 带方向的墙体
 * @param {*} options
 */
function _getDirectionWallShader(options) {
  if (options && options.get) {
    var materail =
      "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
        {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        vec2 st = materialInput.st;\n\
        \n ";
    if (options.freely == "vertical") {
      //（由下到上）

      materail += "vec4 colorImage = texture2D(image, vec2(fract(float(" + options.count + ")*st.t " + options.direction + " time), fract(st.s)));\n ";
    } else {
      //（逆时针）

      materail += "vec4 colorImage = texture2D(image, vec2(fract(float(" + options.count + ")*st.s " + options.direction + " time), fract(st.t)));\n ";
    }
    //泛光
    materail +=
      "vec4 fragColor;\n\
        fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\
        fragColor = czm_gammaCorrect(fragColor);\n ";

    materail +=
      " material.diffuse = colorImage.rgb;\n\
        material.alpha = colorImage.a;\n\
        material.emission = fragColor.rgb;\n\
        \n\
        return material;\n\
        }\n\
        ";
    return materail;
  }
}

/**
 * 计算链路的点集
 * @param startPoint 开始节点
 * @param endPoint 结束节点
 * @param angularityFactor 曲率
 * @param numOfSingleLine 点集数量
 * @returns {Array}
 */
function getLinkedPointList(Cesium, viewer, startPoint, endPoint, angularityFactor, numOfSingleLine) {
  if (viewer) {
    var result = [];
    var startPosition = Cesium.Cartographic.fromCartesian(startPoint);
    var endPosition = Cesium.Cartographic.fromCartesian(endPoint);

    var startLon = (startPosition.longitude * 180) / Math.PI;
    var startLat = (startPosition.latitude * 180) / Math.PI;
    var endLon = (endPosition.longitude * 180) / Math.PI;
    var endLat = (endPosition.latitude * 180) / Math.PI;

    var dist = Math.sqrt((startLon - endLon) * (startLon - endLon) + (startLat - endLat) * (startLat - endLat));
    //var dist = Cesium.Cartesian3.distance(startPoint, endPoint);
    var angularity = dist * angularityFactor;

    var startVec = Cesium.Cartesian3.clone(startPoint);
    var endVec = Cesium.Cartesian3.clone(endPoint);

    var startLength = Cesium.Cartesian3.distance(startVec, Cesium.Cartesian3.ZERO);
    var endLength = Cesium.Cartesian3.distance(endVec, Cesium.Cartesian3.ZERO);

    Cesium.Cartesian3.normalize(startVec, startVec);
    Cesium.Cartesian3.normalize(endVec, endVec);

    if (Cesium.Cartesian3.distance(startVec, endVec) == 0) {
      return result;
    }

    var omega = Cesium.Cartesian3.angleBetween(startVec, endVec);

    result.push(startPoint);
    for (var i = 1; i < numOfSingleLine - 1; i++) {
      var t = (i * 1.0) / (numOfSingleLine - 1);
      var invT = 1 - t;

      var startScalar = Math.sin(invT * omega) / Math.sin(omega);
      var endScalar = Math.sin(t * omega) / Math.sin(omega);

      var startScalarVec = Cesium.Cartesian3.multiplyByScalar(startVec, startScalar, new Cesium.Cartesian3());
      var endScalarVec = Cesium.Cartesian3.multiplyByScalar(endVec, endScalar, new Cesium.Cartesian3());

      var centerVec = Cesium.Cartesian3.add(startScalarVec, endScalarVec, new Cesium.Cartesian3());

      var ht = t * Math.PI;
      var centerLength = startLength * invT + endLength * t + Math.sin(ht) * angularity;
      centerVec = Cesium.Cartesian3.multiplyByScalar(centerVec, centerLength, centerVec);

      result.push(centerVec);
    }

    result.push(endPoint);

    return result;
  }
}

// 波动圆材质
function installWaveCircleMaterial(Cesium) {
  var Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    Property = Cesium.Property,
    Material = Cesium.Material;

  function CircleWaveMaterialProperty(options) {
    options = options || {};
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this._duration = undefined;
    this._durationSubscription = undefined;
    this.color = defaultValue(options.color, Color.fromBytes(0, 255, 255, 255));
    this.duration = defaultValue(options.duration, 45);
    this.count = Math.max(defaultValue(options.count, 2), 1);
    this.gradient = defaultValue(options.gradient, 0.1);
    if (this.gradient < 0) {
      this.gradient = 0;
    } else if (this.gradient > 1) {
      this.gradient = 1;
    }
  }

  defineProperties(CircleWaveMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
  });

  CircleWaveMaterialProperty.prototype.getType = function (time) {
    return Material.CircleWaveType;
  };
  CircleWaveMaterialProperty.prototype.getValue = function (time, result) {
    if (!result) {
      result = {};
    }
    result.color = Property.getValueOrUndefined(this._color, time);
    result.duration = this._duration;
    result.count = this.count;
    result.gradient = this.gradient;
    return result;
  };
  CircleWaveMaterialProperty.prototype.equals = function (other) {
    return this === other || (other instanceof CircleWaveMaterialProperty && Cesium.Property.equals(this._color, other._color));
  };

  defineProperties(CircleWaveMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor("color"),
    duration: Cesium.createPropertyDescriptor("duration"),
  });

  Cesium.CircleWaveMaterialProperty = CircleWaveMaterialProperty;
  Material.CircleWaveType = "CircleWave";
  Material._materialCache.addMaterial(Material.CircleWaveType, {
    fabric: {
      type: Material.CircleWaveType,
      uniforms: {
        color: new Color(1.0, 0.0, 0.0, 0.7),
        duration: 45,
        count: 1,
        gradient: 0.1,
      },
      source: getDynamicCircleShader({ get: true }),
    },
    translucent: function (material) {
      return true;
    },
  });
}
// 波动圆
function getDynamicCircleShader(options) {
  if (options && options.get) {
    return "uniform vec4 color;\n\
    uniform float duration;\n\
    uniform float count;\n\
    uniform float gradient;\n\
    \n\
    czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        material.diffuse = 1.5 * color.rgb;\n\
        vec2 st = materialInput.st;\n\
        vec3 str = materialInput.str;\n\
        float dis = distance(st, vec2(0.5, 0.5));\n\
        float per = fract(czm_frameNumber / duration);\n\
        if(abs(str.z) > 0.001){\n\
            discard;\n\
        }\n\
        if(dis > 0.5){\n\
            discard;\n\
        } else {\n\
            float perDis = 0.5 / count;\n\
            float disNum;\n\
            float bl = .0;\n\
            for (int i = 0; i <= 10; i++) {\n\
                if (float(i) <= count) {\n\
                    disNum = perDis * float(i) - dis + per / count;\n\
                    if (disNum > 0.0) {\n\
                        if (disNum < perDis) {\n\
                            bl = 1.0 - disNum / perDis;\n\
                        } else if (disNum - perDis < perDis) {\n\
                            bl = 1.0 - abs(1.0 - disNum / perDis);\n\
                        }\n\
                        material.alpha = pow(bl, gradient);\n\
                    }\n\
                }\n\
            }\n\
        }\n\
        return material;\n\
    }\n\
    ";
  }
}
// 视频投放
function createVideoPlaneGraphics(Cesium, viewer, options) {
  if (options && options.position) {
    var entity = new Cesium.Entity();
    entity.position = options.position;
    entity.plane = {
      plane: new Cesium.Plane(options.normal || Cesium.Cartesian3.UNIT_Y, 0.0),
      dimensions: options.dimensions || new Cesium.Cartesian2(200.0, 150.0),
      material: new Cesium.ImageMaterialProperty({
        image: options.videoElement,
      }),
    };
    return viewer.graphicsLayer.entities.add(entity);
  }
}

function installCss3Renderer(Cesium, viewer) {
  function Css3Renderer(elements, isBackHide, viewHeight, domName, maxViewHeight) {
    this._scratch = new Cesium.Cartesian2();
    this._viewer = viewer;
    (this._scene = viewer.scene), (this._camera = viewer.camera);

    this._container = null;
    this._elements = elements;
    this._isBackHide = isBackHide;
    this._viewHeight = viewHeight;
    this._domName = domName;
    this._maxViewHeight = maxViewHeight;

    this.init();
  }
  Css3Renderer.prototype.init = function () {
    var container = document.createElement("div");
    container.className = this._domName;
    document.body.appendChild(container);
    this._container = container;

    this._elements.forEach(function (e) {
      container.insertAdjacentHTML("beforeend", e.element);
    });
    var $this = this;
    this._scene.preRender.addEventListener(function () {
      //
      for (var i = 0; i < container.children.length; i++) {
        var p = Cesium.Cartesian3.fromDegrees($this._elements[i].position[0], $this._elements[i].position[1], $this._elements[i].position[2] || 0);
        var canvasPosition = $this._scene.cartesianToCanvasCoordinates(p, $this._scratch);
        if (Cesium.defined(canvasPosition)) {
          container.children[i].style.left = parseFloat(canvasPosition.x) + parseFloat(-container.children[i].offsetWidth / 2) + "px";
          container.children[i].style.top = parseFloat(canvasPosition.y) + parseFloat($this._elements[i].offset[1]) + "px";
          if ($this._isBackHide) {
            var j = $this._camera.position,
              n = $this._scene.globe.ellipsoid.cartesianToCartographic(j).height;
            n += $this._scene.globe.ellipsoid.maximumRadius;
            if (
              !(Cesium.Cartesian3.distance(j, p) > n) &&
              window.viewer.camera.positionCartographic.height >= $this._viewHeight &&
              window.viewer.camera.positionCartographic.height <= $this._maxViewHeight
            ) {
              container.children[i].style.display = "block";
            } else {
              container.children[i].style.display = "none";
            }
          }
        }
      }
    });
  };
  Css3Renderer.prototype.remove = function (id) {
    this._elements = this._elements.filter(function (e) {
      e.id !== id;
    });
    this._container.removeChild(document.getElementById(id));
  };

  Css3Renderer.prototype.append = function (object) {
    this._elements.push(object);
    this._container.insertAdjacentHTML("beforeend", object.element);
  };

  Css3Renderer.prototype.removeEntityLayer = function (id) {
    this._viewer.entities.removeById(id);
    this.remove(id);
  };

  Css3Renderer.prototype.addEntityLayer = function (object) {
    //可自定义其他实体叠加
    // 只要弹出框
    let $this = this;
    setTimeout(function () {
      $this.append(object, true);
    }, 100);
  };
  Cesium.Css3Renderer = Css3Renderer;
}
export {
  initMap,
  addTdtLayer,
  addWriteModules,
  setRainEffect,
  setSnowEffect,
  load3DTilesBuild,
  craeteDynamicPolyLineGraphics,
  getLinkedPointList,
  createPointsGraphics,
  craeteDynamicCricleGraphics,
  createVideoPlaneGraphics,
  installCss3Renderer,
  installWaveCircleMaterial,
};
