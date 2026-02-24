var map = L.map("map").setView([22.5726, 88.3639], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let start, end;

map.on("click", function (e) {
  if (!start) {
    start = [e.latlng.lng, e.latlng.lat];
    L.marker(e.latlng).addTo(map);
  } else {
    end = [e.latlng.lng, e.latlng.lat];
    L.marker(e.latlng).addTo(map);
  }
});

function findRoute() {
  fetch("http://127.0.0.1:5000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end }),
  })
    .then((res) => res.json())
    .then((data) => {
      let coords = data.routes[0].geometry.coordinates;

      let latlngs = coords.map((c) => [c[1], c[0]]);
      L.polyline(latlngs, { color: "blue" }).addTo(map);
    });
}
