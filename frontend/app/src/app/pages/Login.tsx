import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../api/axios";

/* 🔥 CORRECT ICON FIX (NO require) */
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

type Worker = {
  id: number;
  name: string;
  position: [number, number];
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);

  /* ================= MAP INIT ================= */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([13.0827, 80.2707], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    mapInstanceRef.current = map;

    console.log("✅ Map initialized");

    return () => {
      map.remove(); // cleanup (important)
    };
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/gps/latest");

        console.log("📡 RAW GPS:", res.data);

        const mapped: Worker[] = res.data.map((item: any) => {
          let lat = item.latitude;
          let lng = item.longitude;

          /* 🔥 FORCE FIX INVALID DATA */
          if (!lat || !lng || (lat === 0 && lng === 0)) {
            lat = 13.0827;
            lng = 80.2707;
          }

          return {
            id: item.userId,
            name: `Worker ${item.userId}`,
            position: [lat, lng],
          };
        });

        console.log("✅ PROCESSED:", mapped);

        setWorkers(mapped);
      } catch (err) {
        console.error("❌ API ERROR:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= MARKERS ================= */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    console.log("📍 Workers:", workers);

    /* 🔥 CLEAR OLD MARKERS */
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (workers.length === 0) return;

    const bounds: L.LatLngExpression[] = [];

    workers.forEach((worker) => {
      console.log("➡️ Adding marker:", worker.position);

      L.marker(worker.position)
        .addTo(map)
        .bindPopup(worker.name);

      bounds.push(worker.position);
    });

    /* 🔥 AUTO FIT ALL MARKERS */
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [workers]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}