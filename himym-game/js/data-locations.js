// ============================================================
// LOCATION DEL MONDO DI GIORNO
// Ogni location è una zona nel mondo 3D. "trigger" è il raggio
// entro cui il giocatore può interagire (tasto E).
// ============================================================
window.Game = window.Game || {};

window.Game.LOCATIONS = [
  {
    id: 'casa',
    label: 'Casa',
    icon: '🏠',
    position: { x: -10, z: -8 },
    size: { w: 4, d: 4, h: 3.2 },
    color: 0xD9A066,
    trigger: 3.2
  },
  {
    id: 'lavoro',
    label: 'Lavoro',
    icon: '💼',
    position: { x: 9, z: -9 },
    size: { w: 5, d: 4, h: 5 },
    color: 0x6C7A89,
    trigger: 3.6
  },
  {
    id: 'parco',
    label: 'Parco',
    icon: '🌳',
    position: { x: -9, z: 9 },
    size: { w: 4.5, d: 4.5, h: 0.4 },
    color: 0x5CA45C,
    trigger: 3.8
  },
  {
    id: 'bar',
    label: 'MacLaren’s',
    icon: '🍸',
    position: { x: 10, z: 9 },
    size: { w: 5, d: 4, h: 3.6 },
    color: 0x8C4B3A,
    trigger: 3.6
  }
];

window.Game.getLocation = function (id) {
  return window.Game.LOCATIONS.find(l => l.id === id);
};
