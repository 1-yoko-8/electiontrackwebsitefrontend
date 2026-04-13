import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/axios";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

/* ---------------- LEAFLET ICON FIX ---------------- */

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

/* ---------------- TYPES ---------------- */

interface Worker {
  id: string; // username (e.g. mp_001)
  name: string; // Mobile Party 1
  rank: string;
  currentTask: string;
  position: [number, number];
  lastGPSUpdate: Date;
  completedAllTasks: boolean;
  phoneNumber?: string | null;
}

/* API TYPES */

interface GPSPing {
  userId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  currentTask: string;
}

interface Report {
  username: string;
  phone_number: string | null;
  ballot_box_handed_over_status: string;
}

/* ---------------- HELPERS ---------------- */

const extractPartyId = (username: string) => {
  const match = username.match(/\d+/);
  return match ? match[0] : "0";
};

/* ---------------- STATUS ---------------- */

function getStatus(worker: Worker): "active" | "idle" | "completed" {
  const now = new Date();
  const diffMinutes =
    (now.getTime() - worker.lastGPSUpdate.getTime()) / (1000 * 60);

  if (worker.completedAllTasks) return "completed";
  if (diffMinutes < 10) return "active";
  return "idle";
}

/* ---------------- ICON ---------------- */

const createCustomIcon = (status: string, partyId: string) => {
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
        width: 34px;
        height: 34px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      ">
        ${partyId}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

/* ---------------- COMPONENT ---------------- */

export function WorkerMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [workers, setWorkers] = useState<Worker[]>([]);

  /* ---------------- FETCH API ---------------- */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [gpsRes, reportRes] = await Promise.all([
          api.get<GPSPing[]>("/gps/latest"),
          api.get<Report[]>("/reports"),
        ]);

        const reportMap = new Map(
          reportRes.data.map((r) => [r.username, r])
        );

        const mappedWorkers: Worker[] = gpsRes.data.map((ping) => {
          const report = reportMap.get(ping.userId);

          return {
            id: ping.userId,
            name: `Mobile Party ${extractPartyId(ping.userId)}`,
            rank: "Field Worker",
            currentTask: ping.currentTask,
            position: [ping.latitude, ping.longitude],
            lastGPSUpdate: new Date(ping.timestamp),

            completedAllTasks:
              report?.ballot_box_handed_over_status === "Completed",

            phoneNumber: report?.phone_number ?? null,
          };
        });

        if (isMounted) setWorkers(mappedWorkers);
      } catch (err) {
        console.error("Failed to fetch worker data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ---------------- INIT MAP ---------------- */

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([13.0827, 80.2707], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 0);
  }, []);

  /* ---------------- MARKERS ---------------- */

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    workers.forEach((worker) => {
      const status = getStatus(worker);
      const partyId = extractPartyId(worker.id);

      const popupContent = `
        <b>${worker.name}</b><br/>
        Username: ${worker.id}<br/>
        Phone: ${worker.phoneNumber ?? "N/A"}
      `;

      let marker = markersRef.current.get(worker.id);

      if (!marker) {
        marker = L.marker(worker.position, {
          icon: createCustomIcon(status, partyId),
        }).addTo(map);

        marker.bindPopup(popupContent);
        markersRef.current.set(worker.id, marker);
      }

      marker.setLatLng(worker.position);
      marker.setIcon(createCustomIcon(status, partyId));
      marker.setPopupContent(popupContent);
    });

    const activeIds = new Set(workers.map((w) => w.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });
  }, [workers]);

  /* ---------------- UI ---------------- */

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
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "white",
          padding: "12px 14px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 9999,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
          Legend
        </div>

        <div style={{ fontSize: "12px", lineHeight: "18px" }}>
          <div>🟢 Active</div>
          <div>🟠 Idle</div>
          <div>⚫ Completed</div>
        </div>
      </div>
    </div>
  );
}