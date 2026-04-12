import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

/* ---------------- LEAFLET ICON FIX ---------------- */

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

/* ---------------- TYPES ---------------- */

interface Worker {
  id: string;
  name: string;
  rank: string;
  currentTask: string;
  position: [number, number];
  lastGPSUpdate: Date;
  completedAllTasks: boolean;
}

/* ---------------- MOCK DATA ---------------- */

const initialWorkers: Worker[] = [
  {
    id: "101",
    name: "Arun",
    rank: "Field Officer",
    currentTask: "COLLECTED",
    position: [13.0827, 80.2707],
    lastGPSUpdate: new Date(),
    completedAllTasks: false,
  },
  {
    id: "102",
    name: "Priya",
    rank: "Supervisor",
    currentTask: "REACHED",
    position: [13.05, 80.25],
    lastGPSUpdate: new Date(Date.now() - 15 * 60 * 1000),
    completedAllTasks: false,
  },
  {
    id: "103",
    name: "Ravi",
    rank: "Officer",
    currentTask: "REACHED_AND_HANDED_OVER",
    position: [13.1, 80.28],
    lastGPSUpdate: new Date(),
    completedAllTasks: true,
  },
];

/* ---------------- STATUS LOGIC ---------------- */

function getStatus(worker: Worker): "active" | "idle" | "completed" {
  const now = new Date();
  const diffMinutes =
    (now.getTime() - worker.lastGPSUpdate.getTime()) / (1000 * 60);

  // COMPLETED
  if (
    worker.currentTask === "REACHED_AND_HANDED_OVER" ||
    worker.completedAllTasks
  ) {
    return "completed";
  }

  // ACTIVE
  if (diffMinutes < 10 && !worker.completedAllTasks) {
    return "active";
  }

  // IDLE
  return "idle";
}

/* ---------------- ICON ---------------- */

const createCustomIcon = (status: string) => {
  const color =
    status === "active"
      ? "#22c55e"
      : status === "idle"
      ? "#f59e0b"
      : "#6b7280";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

/* ---------------- COMPONENT ---------------- */

export function WorkerMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);

  /* ---------------- SIMULATE REALISTIC MOVEMENT ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) => {
          const moved = Math.random() > 0.3;

          return {
            ...w,
            position: moved
              ? [
                  w.position[0] + (Math.random() - 0.5) * 0.01,
                  w.position[1] + (Math.random() - 0.5) * 0.01,
                ]
              : w.position,

            lastGPSUpdate: moved ? new Date() : w.lastGPSUpdate,
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- INIT MAP ---------------- */

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([13.0827, 80.2707], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, []);

  /* ---------------- MARKER LOGIC ---------------- */

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    workers.forEach((worker) => {
      const status = getStatus(worker);

      let marker = markersRef.current.get(worker.id);

      if (!marker) {
        // CREATE MARKER
        marker = L.marker(worker.position, {
          icon: createCustomIcon(status),
        }).addTo(map);

        // ✅ POPUP ADDED (ONLY CHANGE)
        marker.bindPopup(`
          <b>${worker.name}</b><br/>
          Username: ${worker.id}
        `);

        markersRef.current.set(worker.id, marker);
      }

      // UPDATE POSITION + ICON
      marker.setLatLng(worker.position);
      marker.setIcon(createCustomIcon(status));
    });

    // REMOVE OLD MARKERS
    const activeIds = new Set(workers.map((w) => w.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [workers]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="relative">
      <style>{`
        .leaflet-container {
          height: 600px;
          width: 100%;
          border-radius: 12px;
        }
      `}</style>

      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />

      {/* LEGEND */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow">
        <p className="text-sm font-semibold mb-2">Legend</p>

        <div className="text-xs space-y-1">
          <div>🟢 Active </div>   {/* lastGPSUpdate < 10 min & not completed */}
          <div>🟠 Idle </div>   {/* lastGPSUpdate > 10 min & not completed */}
          <div>⚫ Completed </div>   {/* lastGPSUpdate < 10 min & completed */}
        </div>
      </div>
    </div>
  );
}