console.log('Hello from client side');

export const displayMap = (locations) => {
  const map = L.map('map', { zoomControl: false });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  const greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -50],
  });

  const points = [];
  locations.forEach((loc) => {
    // create points
    points.push({ lat: loc.coordinates[1], lng: loc.coordinates[0] });

    // Add markers
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}:  ${loc.description} </p>`, {
        autoClose: false,
        className: 'mapPopup',
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};
