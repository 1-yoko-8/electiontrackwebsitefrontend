import { useState, useEffect } from "react"
import { Users, MapPin, CheckCircle, Package } from "lucide-react"
import { WorkerMap } from "../components/WorkerMap"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "../components/ui/cards"
import api from "../../api/axios"

/* ---------------- STAT CARD COMPONENT ---------------- */

interface ProgressData {
  collected: { total: number; completed: number; pending: number }
  started: { total: number; completed: number; pending: number }
  reached: { totalLocations: number; covered: number; pending: number }
  handedOver: { total: number; completed: number; pending: number }
}

interface StatCardProps {
  title: string
  icon: React.ElementType
  total: number
  completed: number
  pending: number
  color: {
  bg: string
  icon: string
  progress: string
  }
}

function StatCard({
  title,
  icon: Icon,
  total,
  completed,
  pending,
  color
}: StatCardProps) {

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">

      <CardHeader className="flex items-center justify-between">

        {/* ICON */}
        <div className={`p-3 rounded-xl shadow-inner ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.icon}`} />
        </div>

        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </span>

      </CardHeader>

      <CardContent className="space-y-3">

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total</span>
          <span className="font-semibold text-gray-900">{total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Completed</span>
          <span className="font-semibold text-green-600">{completed}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pending</span>
          <span className="font-semibold text-orange-500">{pending}</span>
        </div>

        {/* PROGRESS BAR */}
        <div className="pt-3 border-t">

          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{percent}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">

          <div className={`h-2 rounded-full transition-all duration-500 ${color.progress}`}
              style={{ width: `${percent}%` }}
            />

          </div>

        </div>

      </CardContent>

    </Card>
  )
}

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {

const [progressData, setProgressData] = useState<ProgressData | null>(null);

useEffect(() => {

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/progress")
      setProgressData(res.data)
    } catch (err) {
      console.error("Error fetching progress:", err)
    }
  }

  fetchData() // initial load

  const interval = setInterval(fetchData, 5000)

  return () => clearInterval(interval)

}, [])


if (!progressData) {
  return (
    <div className="p-6 text-gray-500">
      Loading dashboard...
    </div>
  )
}

  return (

    <div className="p-6 lg:p-8 space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Monitor field worker progress in real-time
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Live Updates • Every 5s
        </div>

      </div>

      {/* PROGRESS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Collected"
          icon={Package}
          total={progressData.collected.total}
          completed={progressData.collected.completed}
          pending={progressData.collected.pending}
          color={{
            bg: "bg-blue-100",
            icon: "text-blue-600",
            progress: "bg-blue-600"
          }}
        />

        <StatCard
          title="Started"
          icon={Users}
          total={progressData.started.total}
          completed={progressData.started.completed}
          pending={progressData.started.pending}
          color={{
          bg: "bg-purple-100",
          icon: "text-purple-600",
          progress: "bg-purple-600"
        }}
        />

        <StatCard
          title="Reached"
          icon={MapPin}
          total={progressData.reached.totalLocations}
          completed={progressData.reached.covered}
          pending={progressData.reached.pending}
          color={{
          bg: "bg-green-100",
          icon: "text-green-600",
          progress: "bg-green-600"
        }}
        />

        <StatCard
          title="Handed Over"
          icon={CheckCircle}
          total={progressData.handedOver.total}
          completed={progressData.handedOver.completed}
          pending={progressData.handedOver.pending}
          color={{
          bg: "bg-orange-100",
          icon: "text-orange-600",
          progress: "bg-orange-600"
        }}
        />

      </div>

      {/* LIVE MAP */}

      <Card className="mb-6">

        <CardHeader className="flex items-center justify-between">

          <CardTitle>
            Live Worker Tracking
          </CardTitle>

          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
            Live
          </span>

        </CardHeader>

        <CardContent className="p-4">

          <div className="rounded-b-xl overflow-hidden p-4">
            <WorkerMap />
          </div>
          <div className="h-6">
          </div>

        </CardContent>

      </Card>

    </div>
  )
}