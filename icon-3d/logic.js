let scene, camera;
const THREE = window.THREE;
let linesCollection;
const lineGroup = new THREE.Group();
const pipeGroup = new THREE.Group();

const aminaties = [
  "atm",
  "bar",
  "bank",
  "bus",
  "cafe",
  "college",
  "restorent",
  "school",
  "taxi",
];
const aminatiesIcon = [];

let modelParms = {
  center: [-74.08783257007599, 40.719379779163965],
  rotation: new THREE.Vector3(Math.PI / 2, 0, 0),
};

const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
  modelParms.center,
  0
);

let modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelParms.rotation.x,
  rotateY: modelParms.rotation.y,
  rotateZ: modelParms.rotation.z,
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
};

mapboxgl.accessToken =
  "pk.eyJ1IjoiYW1pdGVlMDAwNyIsImEiOiJja3psM2R0ZjIxMWxrMm5sbGRudmN0emg3In0.5gZOlrQvnEdpuByBTINgDw";

  var map = window.map  = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v9",
  zoom: 18,
  center: modelParms.center,
  maxZoom: 21,
  pitch: 60,
  antialias: !0,
});


map.getCanvasContainer().id ="mapbox"; 
canvas = document.createElement("canvas");
document.getElementById("mapbox").appendChild(canvas);
var ctx = canvas.getContext("2d");
console.log(ctx)
window.addEventListener("resize", resizeWindow, false);
resizeWindow();

function resizeWindow(){ 
    
    var bbox = document.body.getBoundingClientRect();
    var width = bbox.width;
    var height = bbox.height
    var container = map.getCanvasContainer();

    canvas.width = width * 2;
    canvas.height = height * 2;
    
    map.resize();

}


let convert = (point) => {
  const coords = mapboxgl.MercatorCoordinate.fromLngLat(
    [point[0], point[1]],
    0
  );
  const x =
    (modelAsMercatorCoordinate.x - coords.x) /
    modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
  const y =
    (modelAsMercatorCoordinate.y - coords.y) /
    modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
  return new THREE.Vector3(-x, 50 + point[2] ? point[2] / 100 : 0, -y);
};

var threejsLayer = {
  id: "custom-layer",
  type: "custom",
  renderingMode: "3d",
  onAdd: function (map_, gl_) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
    scene = this.scene;
    camera = this.camera;

    const loader = new THREE.SVGLoader();

    for (let i = 0; i < aminaties.length; i++) {
      // load a SVG resource
      loader.load(
        // resource URL
        "./"+aminaties[i]+".svg",
        // called when the resource is loaded
        function (data) {
            console.log(data)

          const paths = data.paths;
          const group = new THREE.Group();
          let position = convert(linesCollection.features[i].geometry.coordinates);

        //   const ratio = remapFloat(100, 6, 60, 2.8, 8.0);
        //   const ds = ratio;
        //   const dr = ds / 2.0 / Math.cos(Math.PI/6);
        //   const dh = 100 / (0.25 * ds * ds * 1.0 / Math.sqrt(3));
            
          linesCollection.features[i].properties.labelPosition = new THREE.Vector3(position.x, 10, position.z);


          group.position.set(position.x,position.y+40,position.z);

          if(aminaties[i] == "bus")
          group.scale.multiplyScalar( 0.03 );
          else if(aminaties[i] == "cafe" || aminaties[i] == "taxi" || aminaties[i] == "bar")
          group.scale.multiplyScalar( 0.3 );
          else if(aminaties[i] == "college")
          group.scale.multiplyScalar( 2.5 );
          else if(aminaties[i] == "bank" )
          group.scale.multiplyScalar( .7 );
          else if( aminaties[i] == "atm")
          group.scale.multiplyScalar( .15 );


          else
          group.scale.multiplyScalar( 0.05 );



          group.scale.y *= - 1;


          for (let i = 0; i < paths.length; i++) {
            const path = paths[i];

            const material = new THREE.MeshBasicMaterial({
              color: path.color,
              side: THREE.DoubleSide,
              depthWrite: false,
              transparent: false
            });


            const shapes = THREE.SVGLoader.createShapes(path);


            for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j];
              const geometry = new THREE.ShapeGeometry(shape);
              const mesh = new THREE.Mesh(geometry, material);
              mesh.scale.set(0.5,0.5,0.5)

              group.add(mesh);
            }
          }

        //   group.lookAt(camera.position)
          scene.add(group);
        },
        // called when loading is in progresses
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        function (error) {
          console.log(error);
        }
      );
    }

    // this.scene.add(lineGroup);
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
      .scale(
        new THREE.Vector3(
          modelTransform.scale,
          -modelTransform.scale,
          modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    this.camera.projectionMatrix.elements = matrix_;
    this.camera.projectionMatrix = m.multiply(l);
    renderHUD(this.camera);
    this.renderer.state.reset();
    this.renderer.render(this.scene, this.camera);
    this.map.triggerRepaint();
  },
};


function renderHUD(camera_) {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for(var i = 0; i < linesCollection.features.length; i++){
    
        if(aminaties[i] && linesCollection.features[i].properties.labelPosition){
            console.log(linesCollection.features[i].properties.labelPosition)

            var screen = worldToScreen(linesCollection.features[i].properties.labelPosition, camera_);
            console.log(screen)
            var side = 1;
            if(screen.x > canvas.width / 2) { side = -1; }
            ctx.strokeStyle = "#000000";
    
            // ctx.beginPath();
            // ctx.moveTo(screen.x - side * 256 - side * extra - side * 16, screen.y - 64 + 28);
            // ctx.lineTo(screen.x - side * 64, screen.y - 64+6);
            // ctx.lineTo(screen.x - side * 256, screen.y - 64);
            // ctx.stroke();
    
            ctx.textAlign = "start"; 
            // if(side == -1) { ctx.textAlign = "end"; }
            
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "70px serif";
            ctx.textAlign = "center"
            var extra = ctx.measureText(aminaties[i]).width;
            ctx.fillText(aminaties[i], screen.x  , screen.y -150 );

            ctx.strokeText(aminaties[i], screen.x  , screen.y -150 );


            
            // ctx.fillStyle = "#FFFFFF";
            // ctx.font = "italic 200px Arial";
            // var extra = ctx.measureText(aminaties[i] + " Feets").width;
            // ctx.fillText(aminaties[i] + " Feets", screen.x - side * 256 - side * extra - side * 16, screen.y - 64 + 28);

            // console.log(ctx)
        }

        
    }

}

function worldToScreen(vec3_, camera_){

    var pos = new THREE.Vector3(vec3_.x, vec3_.y, vec3_.z);
    pos.project(camera_);

    pos.x = (pos.x * canvas.width / 2) + canvas.width / 2;
    pos.y = -(pos.y * canvas.height / 2) + canvas.height / 2;
    pos.z = 0;

    return { x: pos.x , y: pos.y };
    
}

function remapFloat(v_, min0_, max0_, min1_, max1_) { return min1_ + (v_ - min0_) / (max0_ - min0_) * (max1_ - min1_); }





map.on("style.load", async () => {
  linesCollection = (await axios.get("./map.geojson")).data;
  map.addLayer(threejsLayer, "waterway-label");
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
    mesh.material.color = new THREE.Color("whiteSmoke");
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
  });
};
