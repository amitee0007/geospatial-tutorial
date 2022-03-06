let scene;
const THREE = window.THREE;
let linesCollection;
const lineGroup = new THREE.Group();
const pipeGroup = new THREE.Group();

let modelParms = {
  center: [-74.11872625350952, 40.73188896572489],
  rotation: new THREE.Vector3(Math.PI / 2, 0, 0),
};

const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelParms.center,0);

let modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelParms.rotation.x,
  rotateY: modelParms.rotation.y,
  rotateZ: modelParms.rotation.z,
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
};

mapboxgl.accessToken = "pk.eyJ1IjoiYW1pdGVlMDAwNyIsImEiOiJja3psM2R0ZjIxMWxrMm5sbGRudmN0emg3In0.5gZOlrQvnEdpuByBTINgDw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v9",
  zoom: 18,
  center: [-5.94227347522974,
    43.59254511932484],
  maxZoom: 21,
  pitch: 60,
  antialias: !0,
});

let convert = point=>{
  const coords = mapboxgl.MercatorCoordinate.fromLngLat([point[0], point[1]],0);
  const x = (modelAsMercatorCoordinate.x - coords.x) / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
  const y = (modelAsMercatorCoordinate.y - coords.y) / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
  return new THREE.Vector3(-x, 50 + point[2]?point[2]/100:0, -y);
}

var threejsLayer = {
  id: "custom-layer",
  type: "custom",
  renderingMode: "3d",
  onAdd: function (map_, gl_) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    for (var i = 0; i < linesCollection.features.length; i++) {
      let pointVector = [];
      for (var k = 0; k < linesCollection.features[i].geometry.coordinates.length; k++ ) {
        pointVector.push(convert(linesCollection.features[i].geometry.coordinates[k]));
      }
      const curve = new THREE.CatmullRomCurve3(pointVector);
      const points = curve.getPoints(10000);

      let colors = [];
      let size = []
      points.map((d,k)=>{

        const  step = 10;
        var hash = (k) % step;

        if(hash < step/2){
          colors.push(0.9)
          colors.push(0.9)
          colors.push(0.7)
        }else{
          colors.push(0.9)
          colors.push(0.6)
          colors.push(0.4)
        }

        // size.push(10)

      })

      const geometrye = new THREE.BufferGeometry().setFromPoints(points);


      const materiale = new THREE.LineBasicMaterial({
        color: new THREE.Color(linesCollection.features[i].properties.stroke),
        // vertexColors: THREE.VertexColors
      });
      const curveObject = new THREE.Line(geometrye, materiale);
      lineGroup.add(curveObject);

      const geometryw = new THREE.TubeBufferGeometry(curve, 10, linesCollection.features[i].properties['stroke-width']/10, 80, false);
      // console.log(geometryw)
      // geometryw.colors = colors;
      
      // geometryw.addAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3))
      // geometryw.addAttribute("size", new THREE.BufferAttribute(new Float32Array(size), 3))
      const materialw = new THREE.MeshBasicMaterial({
        color: new THREE.Color(linesCollection.features[i].properties.stroke),
        // vertexColors: THREE.VertexColors

      });

      const mesh = new THREE.Mesh(geometryw, materialw);
      mesh.geometry.colorsNeedUpdate = true
      pipeGroup.add(mesh);
    }

    this.scene.add(pipeGroup);
    scene = this.scene;

    this.map = map_;
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl_,
    });
    this.renderer.autoClear = false;
  },

  render: function (gl_, matrix_) {
    var rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    var rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    var rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    var m = new THREE.Matrix4().fromArray(matrix_);

    var l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
      )
      .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    this.camera.projectionMatrix.elements = matrix_;
    this.camera.projectionMatrix = m.multiply(l);

    this.renderer.state.reset();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  },
};

map.on("style.load", async () => {
  linesCollection = (await axios.get("./map.geojson")).data;
  map.addLayer(threejsLayer, 'waterway-label');
});

let displayLine = () => {
  scene.remove(pipeGroup);
  scene.add(lineGroup);
};

let displayPipe = () => {
  scene.remove(lineGroup);
  scene.add(pipeGroup);
};

let displayPipecolored = () => {
  scene.remove(lineGroup);
  scene.add(pipeGroup);
  const texture = new THREE.TextureLoader().load("./pipe.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 3);

  pipeGroup.children.map((mesh) => {
    // mesh.material.color = new THREE.Color("whiteSmoke");
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
  });
};
