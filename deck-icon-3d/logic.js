let { MapboxLayer, GeoJsonLayer,TextLayer, IconLayer} = deck;
let layericon;
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
    "atm"
  ];

mapboxgl.accessToken = "pk.eyJ1IjoiYW1pdGVlMDAwNyIsImEiOiJja3psM2R0ZjIxMWxrMm5sbGRudmN0emg3In0.5gZOlrQvnEdpuByBTINgDw";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v9",
  zoom: 16,
  center: [-74.08783257007599, 40.719379779163965],
  maxZoom: 21,
  pitch: 60,
  antialias: !0,
});

map.on("load", () => {
  axios.get("../icon-3d/map.geojson").then(res=>{
    const t = new MapboxLayer({
    id: "building",
    type: GeoJsonLayer,
    data: res.data,
    opacity: 0.95,
    stroked: true,
    getPointRadius: 5,
    filled: true,
    wireframe: true,
    getElevation: (e) => 100,
    getFillColor: [110, 182, 196],
    getLineColor: [9, 9, 9],
    // sizeUnits: "meters",
  });

  map.addLayer(t);

  let d = res.data.features;
  d.map((f,k)=>{
      if(aminaties[k])
      f.properties.type = aminaties[k]
  })

  const layer = new MapboxLayer({
    id: 'text-layer',
    type : TextLayer,
    data: res.data.features,
    pickable: true,
    getPosition: d => [...d.geometry.coordinates,25],
    getText: d => d.properties.type,
    getColor: [255,255,255,2555],
    getSize: 30,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center'
  });

  map.addLayer(layer)

  layericon = new MapboxLayer({
    id: 'icon-layer',
    type: IconLayer,
    data: res.data.features,
    getIcon: d => ({
        url: d.properties.type+'.png',
        width: 128,
        height: 128,
        anchorY: 128
      }),
    sizeMinPixels: 20,
    sizeMaxPixels: 90,
    sizeScale: 15,
    getPosition: d => [...d.geometry.coordinates,1],
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  });

  })
});

let display3dBuilding = ()=>{
  if(!map.getLayer('icon-layer')) map.addLayer(layericon)
}

let display2dBuilding = ()=>{

    if(map.getLayer('icon-layer')) map.removeLayer('icon-layer');

}
