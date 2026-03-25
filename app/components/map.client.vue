<template>
  <div class="map-wrapper">
    <div ref="mapEl" class="map" />

    <div class="map-controls">
      <button :class="{ active: isDrawing }" @click="toggleDrawing">
        {{
          isDrawing
            ? `Click point ${drawingPoints.length + 1} of 4`
            : gameArea
              ? "Redraw Area"
              : "Draw Game Area"
        }}
      </button>
      <button v-if="gameArea" @click="clearGameArea">Clear Area</button>
    </div>
    <!-- 
    <div
      v-if="playerInsideArea !== null"
      class="area-indicator"
      :class="playerInsideArea ? 'inside' : 'outside'"
    >
      {{ playerInsideArea ? "✓ Inside game area" : "✗ Outside game area" }}
    </div> -->

    <div v-if="isDrawing" class="map-hint">
      Click point {{ drawingPoints.length + 1 }} of 4 to define the game area
    </div>

    <div v-if="selectedBug" class="bug-popup">
      <button class="bug-popup__close" @click="selectedBug = null">✕</button>
      <img :src="selectedBug.image_url" class="bug-popup__image" />
      <div class="bug-popup__body">
        <span class="bug-popup__category">{{ selectedBug.category }}</span>
        <p class="bug-popup__description">{{ selectedBug.description }}</p>
        <div class="bug-popup__meta">
          <span>👤 {{ selectedBug.reported_by }}</span>
          <span
            >🕐
            {{ new Date(selectedBug.reported_at).toLocaleDateString() }}</span
          >
        </div>
        <div v-if="selectedBug.operating_system" class="bug-popup__meta">
          <span>💻 {{ selectedBug.operating_system }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";

export interface Bug {
  id: number;
  session_code: string;
  image_url: string;
  description: string;
  category: string;
  operating_system: string | null;
  reported_by: string;
  reported_at: string;
  latitude: number;
  longitude: number;
}

const props = defineProps<{
  bugs: Bug[];
  playerName: string;
  sessionCode: string;
}>();

// Map
const mapEl = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let bugMarkers: L.Marker[] = [];
let playerMarker: L.Marker | null = null;
let gameAreaPolygon: L.Polygon | null = null;
let drawingMarkers: L.CircleMarker[] = [];
let drawingPolyline: L.Polyline | null = null;

// State
const isDrawing = ref(false);
const drawingPoints = ref<L.LatLng[]>([]);
const gameArea = ref<L.LatLng[] | null>(null);
const selectedBug = ref<Bug | null>(null);
const playerInsideArea = ref<boolean | null>(null);
const playerLatLng = ref<L.LatLng | null>(null);

// -------------------------------------------------------
// Nickname → avatar
// A simple hash turns the player's name into a consistent
// hue and emoji so every player gets a unique but stable icon
// -------------------------------------------------------
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const AVATARS = ["🐸", "🤖", "👾", "🦊", "🐙", "🦋", "🐳", "🦄", "🐝", "🦁"];

const saveGameArea = async (points: L.LatLng[]) => {
  try {
    await $fetch(`/api/sessions/${props.sessionCode}/area`, {
      method: "POST",
      body: {
        points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      },
    });
  } catch (e) {
    console.error("Failed to save game area:", e);
  }
};

const loadGameArea = async () => {
  try {
    const session = await $fetch<{
      game_area: { lat: number; lng: number }[] | null;
    }>(`/api/sessions/${props.sessionCode}`);

    if (session.game_area && map) {
      gameArea.value = session.game_area.map((p) => L.latLng(p.lat, p.lng));

      gameAreaPolygon = L.polygon(gameArea.value, {
        color: "#00FF88",
        weight: 2,
        fillOpacity: 0.1,
        dashArray: "6 4",
      }).addTo(map);
    }
  } catch (e) {
    console.error("Failed to load game area:", e);
  }
};

const getPlayerAvatar = (name: string): string | undefined => {
  return AVATARS[hashString(name) % AVATARS.length];
};

const getPlayerColor = (name: string): string => {
  const hue = hashString(name) % 360;
  return `hsl(${hue}, 80%, 55%)`;
};

const createPlayerIcon = (name: string) => {
  const avatar = getPlayerAvatar(name);
  const color = getPlayerColor(name);
  return L.divIcon({
    className: "",
    html: `
      <div class="player-marker" style="background: ${color}; box-shadow: 0 0 0 3px ${color}44">
        <span class="player-marker__avatar">${avatar}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const bugIcon = L.divIcon({
  className: "",
  html: `<div class="bug-marker">🐛</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// -------------------------------------------------------
// Point-in-polygon (ray casting algorithm)
// Works for any convex or concave polygon
// -------------------------------------------------------
const isPointInPolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (!polygon[i] || polygon[j]) {
      return false;
    }
    const xi = polygon[i]?.lat || 0;
    const yi = polygon[i]?.lng || 0;
    const xj = polygon[j]?.lat || 0;
    const yj = polygon[j]?.lng || 0;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

// -------------------------------------------------------
// Map init
// -------------------------------------------------------
onMounted(async () => {
  console.log("Map component mounted, mapEl:", mapEl.value);

  await nextTick();

  console.log("After nextTick, mapEl:", mapEl.value);
  console.log(
    "mapEl dimensions:",
    mapEl.value?.offsetWidth,
    mapEl.value?.offsetHeight,
  );

  if (!mapEl.value) {
    console.error("mapEl is null, map cannot initialize");
    return;
  }

  try {
    map = L.map(mapEl.value).setView([51.505, -0.09], 18);
    console.log("Map initialized:", map);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    console.log("Tile layer added");
    placeBugMarkers();

    map.on("click", handleMapClick);
    map.invalidateSize();
    watchPlayerPosition(); // ← this was missing
    loadGameArea();
  } catch (e) {
    console.error("Leaflet failed to initialize:", e);
  }
});

onBeforeUnmount(() => {
  map?.remove();
  if (positionWatcher !== null) {
    navigator.geolocation.clearWatch(positionWatcher);
  }
});

// -------------------------------------------------------
// Bug markers
// -------------------------------------------------------
const placeBugMarkers = () => {
  if (!map) return;
  bugMarkers.forEach((m) => m.remove());
  bugMarkers = [];

  props.bugs.forEach((bug) => {
    if (!bug.latitude || !bug.longitude) return;
    const marker = L.marker([bug.latitude, bug.longitude], { icon: bugIcon })
      .addTo(map!)
      .on("click", () => {
        selectedBug.value = bug;
      });
    bugMarkers.push(marker);
  });
};

watch(() => props.bugs, placeBugMarkers, { deep: true });

// -------------------------------------------------------
// Player position
// -------------------------------------------------------
let positionWatcher: number | null = null;

const watchPlayerPosition = () => {
  if (!navigator.geolocation) return;

  positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      playerLatLng.value = latlng;

      if (!playerMarker) {
        playerMarker = L.marker(latlng, {
          icon: createPlayerIcon(props.playerName),
        })
          .addTo(map!)
          .bindTooltip(props.playerName, {
            permanent: true,
            direction: "top",
            offset: [0, -20],
          });

        // Fly to player on first fix with a close zoom
        map!.flyTo(latlng, 18, { duration: 1.5 });
      } else {
        playerMarker.setLatLng(latlng);
      }

      checkPlayerInArea();
    },
    (err) => console.warn("Geolocation error:", err),
    { enableHighAccuracy: true },
  );
};

// -------------------------------------------------------
// Draw game area (4 points → polygon)
// -------------------------------------------------------
const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value;
  drawingPoints.value = [];
  drawingMarkers.forEach((m) => m.remove());
  drawingMarkers = [];
  drawingPolyline?.remove();
  drawingPolyline = null;

  if (map) {
    map.getContainer().style.cursor = isDrawing.value ? "crosshair" : "";
  }
};

const clearGameArea = () => {
  gameAreaPolygon?.remove();
  gameAreaPolygon = null;
  gameArea.value = null;
};

const handleMapClick = async (e: L.LeafletMouseEvent) => {
  if (!isDrawing.value || !map) return;

  drawingPoints.value.push(e.latlng);

  // Show a dot for each clicked point
  const dot = L.circleMarker(e.latlng, {
    radius: 5,
    fillColor: "#FF5722",
    fillOpacity: 1,
    color: "white",
    weight: 2,
  }).addTo(map);
  drawingMarkers.push(dot);

  // Draw a preview line connecting clicked points
  drawingPolyline?.remove();
  drawingPolyline = L.polyline(drawingPoints.value, {
    color: "#FF5722",
    dashArray: "6 4",
    weight: 2,
  }).addTo(map);

  if (drawingPoints.value.length === 4) {
    // Close and finalize the polygon
    clearGameArea();

    gameArea.value = [...drawingPoints.value];

    gameAreaPolygon = L.polygon(gameArea.value, {
      color: "#00FF88",
      weight: 2,
      fillOpacity: 0.1,
      dashArray: "6 4",
    }).addTo(map);

    // Clean up drawing state
    drawingMarkers.forEach((m) => m.remove());
    drawingMarkers = [];
    drawingPolyline?.remove();
    drawingPolyline = null;
    drawingPoints.value = [];
    isDrawing.value = false;
    map.getContainer().style.cursor = "";

    await saveGameArea(gameArea.value);
  }
};
</script>

<style>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.map-controls button {
  background: white;
  color: black;
  border: 2px solid #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  min-height: unset;
  text-transform: none;

  &.active {
    border-color: #ff5722;
    color: #ff5722;
  }
}

.area-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1000;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;

  &.inside {
    background: rgba(0, 255, 136, 0.9);
    color: black;
  }

  &.outside {
    background: rgba(255, 87, 34, 0.9);
    color: white;
  }
}

.map-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.bug-marker {
  font-size: 24px;
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.player-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.player-marker__avatar {
  font-size: 20px;
  line-height: 1;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}

.bug-popup {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.bug-popup__close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  min-height: unset;
  height: 28px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bug-popup__image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.bug-popup__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bug-popup__category {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  color: green;
}

.bug-popup__description {
  margin: 0;
  font-size: 0.9rem;
}

.bug-popup__meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #666;
}
</style>
