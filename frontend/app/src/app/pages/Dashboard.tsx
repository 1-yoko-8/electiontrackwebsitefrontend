import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import api from "../../api/axios";

/* ---------------- TYPES ---------------- */

interface DistrictDetails {
  totalPollingLocations: number;
  totalPollingStations: number;
  totalMobileParties: number;
  totalBallotBoxes: number;
}

interface PollingStatus {
  collectedAndDeparted: number;
  ballotBoxesCollected: number;
  partiesInTransit: number;
  partiesReached: number;
  ballotBoxesHandedOver: number;
}

interface DashboardResponse {
  districtDetails: DistrictDetails;
  dayBeforeStatus: PollingStatus;
  pollingDayStatus: PollingStatus;
}

type ColorType = "blue" | "green" | "purple" | "orange" | "indigo";

interface CardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: ColorType;
  loading: boolean;
}

interface StatusSectionProps {
  title: string;
  data: PollingStatus;
  loading: boolean;
}

/* ---------------- COLORS ---------------- */

const colorClasses: Record<ColorType, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
};

/* ---------------- DEFAULTS ---------------- */

const defaultDistrict: DistrictDetails = {
  totalPollingLocations: 0,
  totalPollingStations: 0,
  totalMobileParties: 0,
  totalBallotBoxes: 0,
};

const defaultStatus: PollingStatus = {
  collectedAndDeparted: 0,
  ballotBoxesCollected: 0,
  partiesInTransit: 0,
  partiesReached: 0,
  ballotBoxesHandedOver: 0,
};

/* ---------------- DASHBOARD ---------------- */

export default function Dashboard() {
  const navigate = useNavigate();

  const [districtDetails, setDistrictDetails] =
    useState<DistrictDetails>(defaultDistrict);

  const [dayBeforeStatus, setDayBeforeStatus] =
    useState<PollingStatus>(defaultStatus);

  const [pollingDayStatus, setPollingDayStatus] =
    useState<PollingStatus>(defaultStatus);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await api.get<DashboardResponse>("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        setDistrictDetails(res.data.districtDetails ?? defaultDistrict);
        setDayBeforeStatus(res.data.dayBeforeStatus ?? defaultStatus);
        setPollingDayStatus(res.data.pollingDayStatus ?? defaultStatus);
      } catch (err: unknown) {
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response: unknown }).response === "object" &&
          (err as { response: { status: number } }).response?.status === 401
        ) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!isMounted) return;

        setDistrictDetails(defaultDistrict);
        setDayBeforeStatus(defaultStatus);
        setPollingDayStatus(defaultStatus);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-14">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Monitor polling operations in real-time
        </p>
      </div>

      {/* DISTRICT OVERVIEW */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          District Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <Card icon={MapPin} label="Total Polling Locations"
            value={districtDetails.totalPollingLocations}
            color="blue" loading={loading} />

          <Card icon={TrendingUp} label="Total Polling Stations"
            value={districtDetails.totalPollingStations}
            color="green" loading={loading} />

          <Card icon={Truck} label="Total Mobile Parties"
            value={districtDetails.totalMobileParties}
            color="purple" loading={loading} />

          <Card icon={Package} label="Total Ballot Boxes"
            value={districtDetails.totalBallotBoxes}
            color="indigo" loading={loading} />
        </div>
      </div>

      {/* STATUS */}
      <StatusSection
        title="Day Before Polling Status"
        data={dayBeforeStatus}
        loading={loading}
      />

      <StatusSection
        title="Polling Day Status"
        data={pollingDayStatus}
        loading={loading}
      />
    </div>
  );
}

/* ---------------- CARD ---------------- */

function Card({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: CardProps) {
  const styles = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border hover:shadow-lg transition">

      <div className={`p-4 w-fit mb-5 rounded-xl ${styles.bg}`}>
        <Icon className={`w-8 h-8 ${styles.text}`} />
      </div>

      <div className="text-center">
        <p className="text-base text-gray-600 mb-3">{label}</p>

        <p className="text-5xl font-bold text-gray-900">
          {loading ? "—" : value}
        </p>
      </div>
    </div>
  );
}

/* ---------------- STATUS SECTION ---------------- */

function StatusSection({
  title,
  data,
  loading,
}: StatusSectionProps) {

  const items = [
    { label: "Mobile Parties Collected & Departed", value: data.collectedAndDeparted, icon: Package, color: "blue" },
    { label: "Ballot Boxes Collected", value: data.ballotBoxesCollected, icon: Package, color: "green" },
    { label: "Mobile Parties in Transit", value: data.partiesInTransit, icon: Truck, color: "orange" },
    { label: "Mobile Parties Reached & Handed Over", value: data.partiesReached, icon: MapPin, color: "purple" },
    { label: "Ballot Boxes Handed Over", value: data.ballotBoxesHandedOver, icon: CheckCircle, color: "indigo" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {items.map((item, idx) => {
          const styles = colorClasses[item.color];

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${styles.bg}`}>
                  <item.icon className={`w-6 h-6 ${styles.text}`} />
                </div>

                <p className="text-sm text-gray-600 leading-tight">
                  {item.label}
                </p>
              </div>

              <p className="text-4xl font-bold text-gray-900">
                {loading ? "—" : item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}