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
  axios.get("map.geojson").then(res=>{

  let features = res.data.features;
  features.map((f,k)=>{
      if(aminaties[k])
      f.properties.type = aminaties[k]
  })

  const layer = new MapboxLayer({
    id: 'text-layer',
    type : TextLayer,
    data: features,
    pickable: true,
    getPosition: d => [...d.geometry.coordinates,1],
    getText: d => d.properties.type,
    getColor: [255,255,255,255],
    getSize: 40,
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center'
  });

  map.addLayer(layer)


  })
});

let display3dBuilding = ()=>{
  if(!map.getLayer('icon-layer')) map.addLayer(layericon)
}

let display2dBuilding = ()=>{

    if(map.getLayer('icon-layer')) map.removeLayer('icon-layer');

}
