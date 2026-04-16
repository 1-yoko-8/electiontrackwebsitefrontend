import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/axios";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

/* ---------------- SAFE DEFAULT ICON ---------------- */

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/* ---------------- TYPES ---------------- */

interface Worker {
  id: string;
  name: string;
  position: [number, number];
  lastGPSUpdate: Date;
  completedAllTasks: boolean;
  phoneNumber?: string | null;
}

interface GPSPing {
  userId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  currentTask: string;
}

interface Report {
  username: string;
  contact_number: string | null;
  ballot_box_handed_over_status: string;
}

/* ---------------- HELPERS ---------------- */

const extractPartyId = (username: string) => {
  const match = username.match(/\d+/);
  return match ? match[0] : "0";
};

function getStatus(worker: Worker): "active" | "idle" | "completed" {
  const now = new Date();
  const diffMinutes =
    (now.getTime() - worker.lastGPSUpdate.getTime()) / (1000 * 60);

  if (worker.completedAllTasks) return "completed";
  if (diffMinutes < 10) return "active";
  return "idle";
}

/* ---------------- CUSTOM ICON ---------------- */

const createCustomIcon = (status: string, partyId: string) => {
  const color =
    status === "active"
      ? "#22c55e"
      : status === "idle"
      ? "#f59e0b"
      : "#6b7280";

  return L.divIcon({
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
    className: "",
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

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        const [gpsRes, reportRes] = await Promise.all([
          api.get<GPSPing[]>("/gps/latest"),
          api.get<Report[]>(`/admin/reports?report_date=${today}`),
        ]);

        const reportMap = new Map(
          reportRes.data.map((r) => [r.username, r])
        );

        const now = new Date();

        const mappedWorkers: Worker[] = gpsRes.data.map((ping) => {
          const report = reportMap.get(ping.userId);

          const completed =
            report?.ballot_box_handed_over_status === "Completed";

          /* 🔥 FIX INVALID COORDS */
          let lat = ping.latitude;
          let lng = ping.longitude;

          if (!lat || !lng || (lat === 0 && lng === 0)) {
            lat = 13.0827;
            lng = 80.2707;
          }

          return {
            id: ping.userId,
            name: `Mobile Party ${extractPartyId(ping.userId)}`,
            position: [lat, lng],
            lastGPSUpdate: new Date(ping.timestamp),
            completedAllTasks: completed,
            phoneNumber: report?.contact_number ?? null,
          };
        });

        /* 🔥 KEEP COMPLETED ONLY FOR 1 MINUTE */
        const filteredWorkers = mappedWorkers.filter((worker) => {
          if (!worker.completedAllTasks) return true;

          const diffMs =
            now.getTime() - worker.lastGPSUpdate.getTime();

          return diffMs <= 60 * 1000; // 1 minute
        });

        if (isMounted) setWorkers(filteredWorkers);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /* ---------------- INIT MAP ---------------- */

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([9.9252, 78.1198], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);
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
      } else {
        marker.setLatLng(worker.position);
        marker.setIcon(createCustomIcon(status, partyId));
        marker.setPopupContent(popupContent);
      }
    });

    /* 🔥 REMOVE OLD MARKERS */
    const activeIds = new Set(workers.map((w) => w.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    /* 🔥 AUTO FIT */
    if (workers.length > 0) {
      const bounds = L.latLngBounds(workers.map((w) => w.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [workers]);

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full h-screen">
      <div ref={mapRef} className="w-full h-full rounded-xl" />

      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-xs">
        <div className="font-semibold mb-1">Legend</div>
        <div>🟢 Active</div>
        <div>🟠 Idle</div>
        <div>⚫ Completed</div>
      </div>
    </div>
  );
}