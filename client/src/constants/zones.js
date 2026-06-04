// Zone rectangles matching the visual layout of the office map.
// x, y = top-left corner. w, h = width/height in canvas pixels.
// type: 'meeting' → full notification + occupant panel
//       'area'    → soft label, no notification

// All source images are 1600×912 (ratio 1.754:1)
// Canvas is 1280×720, divided into a 3-column layout:
//   Left col (320px): Phone Booth top, Pantry bottom
//   Centre col (640px): 5 desks
//   Right col (320px): Meeting Room top, Outdoor bottom

// Zone image display size — 30% smaller than before
export const ZONE_W = 266;
export const ZONE_H = 152;

// Desk sprite display size — 30% bigger than before
export const DESK_W = 273;
export const DESK_H = 156;

//  Layout (1280×720):
//  [Phone Booth 380×217]   desk1  desk2  desk3   [Meeting Room 380×217]
//                              desk4  desk5
//  [Pantry 380×217]          (open walk area)    [Outdoor Park 380×217]

export const ZONE_IMAGES = [
  { id: 'workout',     src: '/workout-space.png', x: 0,    y: 0   },
  { id: 'meeting',     src: '/meeting-room.png',  x: 1014, y: 0   },
  { id: 'pantry',      src: '/pantry.png',         x: 0,    y: 568 },
  { id: 'outdoor',     src: '/outdoor-park.png',  x: 1014, y: 568 },
];

export const DESK_POSITIONS = [
  { id: 'desk1', src: '/desk1.png', x: 10,  y: 264, label: 'Desk 1' },
  { id: 'desk2', src: '/desk2.png', x: 300, y: 40,  label: 'Desk 2' },
  { id: 'desk3', src: '/desk3.png', x: 590, y: 40,  label: 'Desk 3' },
  { id: 'desk4', src: '/desk4.png', x: 300, y: 215, label: 'Desk 4' },
  { id: 'desk5', src: '/desk5.png', x: 590, y: 215, label: 'Desk 5' },
];

export const ZONES = [
  { id: 'workout',     label: '💪 Workout Space', x: 0,    y: 0,   w: ZONE_W, h: ZONE_H, type: 'area'    },
  { id: 'meeting',     label: '🗓️ Meeting Room',  x: 1014, y: 0,   w: ZONE_W, h: ZONE_H, type: 'meeting' },
  { id: 'pantry',      label: '☕ Pantry',          x: 0,    y: 568, w: ZONE_W, h: ZONE_H, type: 'area'    },
  { id: 'outdoor',     label: '🌿 Nature',          x: 1014, y: 568, w: ZONE_W, h: ZONE_H, type: 'area'    },
  { id: 'work_area',   label: '💻 Work Area',       x: 280,  y: 25,  w: 720,    h: 360,    type: 'area'    },
];

export function getZoneAt(x, y) {
  for (const z of ZONES) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z;
  }
  return null;
}

