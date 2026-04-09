import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Worker {
  id: number;
  name: string;
  rank: string;
  currentTask: string;
  position: [number, number];
  status: 'active' | 'idle' | 'completed';
}

interface GPSPing {
  id: number;
  userId: string;
  timestamp: string;  
  latitude: number;
  longitude: number;
  currentTask: string;
}

// Custom marker icons with different colors based on status
const createCustomIcon = (status: string) => {
  const color =
    status === 'active' ? '#22c55e' : status === 'idle' ? '#f59e0b' : '#6b7280';

  return L.divIcon({
    className: 'custom-marker',
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
          ${status === 'active' ? 'animation: pulse 2s infinite;' : ''}
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

export function WorkerMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Fetch latest GPS pings
  const fetchLatestGPS = async () => {
  try {
    const res = await axios.get<GPSPing[]>('http://localhost:8000/gps/latest');

    const updatedWorkers: Worker[] = res.data.map(ping => ({
      id: Number(ping.userId),
      name: `User ${ping.userId}`,
      rank: 'Field Worker',
      currentTask: ping.currentTask,
      position: [ping.latitude, ping.longitude],
      status: 'active' as const,
    }));

    setWorkers(updatedWorkers);
  } catch (err) {
    console.error('Failed to fetch GPS data', err);
  }
};

useEffect(() => {
  const initFetch = async () => {
    await fetchLatestGPS();
  };

  initFetch();

  const interval = setInterval(fetchLatestGPS, 10000);
  return () => clearInterval(interval);
}, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when workers change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    workers.forEach((worker) => {
      let marker = markersRef.current.get(worker.id);

      if (!marker) {
        // Create new marker
        marker = L.marker(worker.position, {
          icon: createCustomIcon(worker.status),
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: 600; color: #111827; margin-bottom: 8px; font-size: 14px;">
              ${worker.name}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Rank:</span>
                <span style="font-weight: 500; color: #111827;">${worker.rank}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Status:</span>
                <span style="font-weight: 500; color: ${
                  worker.status === 'active' ? '#16a34a' : 
                  worker.status === 'idle' ? '#ea580c' : '#6b7280'
                }; text-transform: capitalize;">
                  ${worker.status}
                </span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 11px;">Current Task:</span>
                <p style="color: #111827; font-weight: 500; margin-top: 4px; font-size: 12px;">
                  ${worker.currentTask}
                </p>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.set(worker.id, marker);
      } else {
        // Update existing marker position and icon
        const currentLatLng = marker.getLatLng();
        const from: [number, number] = [currentLatLng.lat, currentLatLng.lng];
        const to = worker.position;

        // ✅ Only animate if position actually changed
        if (from[0] !== to[0] || from[1] !== to[1]) {
          animateMarker(marker as AnimatedMarker, from, to);
        }
        marker.setIcon(createCustomIcon(worker.status));
      }
    });

    // Remove markers for workers that are no longer in the list
    const activeIds = new Set(workers.map(w => w.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

  }, [workers]);

  return (
    <div className="relative">
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .leaflet-container {
          height: 450px;
          width: 100%;
          border-radius: 0.75rem;
        }
      `}</style>

      <div ref={mapRef} style={{ height: '600px', width: '100%', borderRadius: '0.75rem' }} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-1000">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
          Worker Status
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-xs text-gray-700">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnimatedMarker extends L.Marker {
  _animId?: ReturnType<typeof setTimeout>;
}

function animateMarker(
  marker: AnimatedMarker,
  from: [number, number],
  to: [number, number],
  duration = 1000
) {
  const frames = 20;
  const interval = duration / frames;

  let step = 0;

  // store animation id on marker
  if (marker._animId) {
  clearTimeout(marker._animId);
}

  const latStep = (to[0] - from[0]) / frames;
  const lngStep = (to[1] - from[1]) / frames;

  const move = () => {
    step++;
    const newLat = from[0] + latStep * step;
    const newLng = from[1] + lngStep * step;

    marker.setLatLng([newLat, newLng]);

    if (step < frames) {
    marker._animId = setTimeout(move, interval);
  }

  };
  move();
}