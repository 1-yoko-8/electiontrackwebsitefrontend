import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/cards";
import { WorkerMap } from "../components/WorkerMap";

export default function MapTracking() {
  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Map Tracking
        </h1>
        <p className="text-gray-500 mt-1">
          Live GPS tracking of field workers in real-time
        </p>
      </div>

      {/* MAP CARD */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Live Worker Map</CardTitle>

          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
            Live
          </span>
        </CardHeader>

        {/* ✅ FIX: give map proper height */}
        <CardContent className="p-0">
          <div className="w-full h-[500px] lg:h-[600px]">
            <WorkerMap />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}