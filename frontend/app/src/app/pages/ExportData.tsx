import { useState, useMemo } from "react";
import api from "../../api/axios";
import axios from "axios"; // ✅ ADD THIS
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */
interface DataRow {
  id: number;
  workerId: string;
  name: string;
  rank: string;
  contact: string;

  ballotCollected: string;
  collectedTimestamp: string;

  handedOver: string;
  handedOverTimestamp: string;

  location: string;
}

/* ---------------- MOCK DATA ---------------- */
const generateMockData = (): DataRow[] => {
  const ranks = ["Senior Officer", "Officer", "Field Agent", "Assistant"];

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    workerId: `FW${String(i + 1).padStart(4, "0")}`,
    name: `Worker ${i + 1}`,
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    contact: `+91-9${Math.floor(Math.random() * 900000000 + 100000000)}`,

    ballotCollected: Math.random() > 0.5 ? "Yes" : "No",
    collectedTimestamp: new Date().toLocaleString(),

    handedOver: Math.random() > 0.5 ? "Yes" : "No",
    handedOverTimestamp: new Date().toLocaleString(),

    location: "View on Map",
  }));
};

/* ---------------- COMPONENT ---------------- */
export default function ExportData() {
  const navigate = useNavigate();

  /* -------- EXPORT -------- */
  const [selectedDate, setSelectedDate] = useState("");

  const handleExport = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    try {
      const response = await api.get(
        `/admin/export-tasks/${selectedDate}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tasks_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: unknown) { // ✅ FIXED TYPE
      if (axios.isAxiosError(error)) { // ✅ CORRECT WAY
        alert(
          error.response?.status === 404
            ? "No data found for selected date"
            : "Failed to export file"
        );
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  /* -------- TABLE STATE -------- */
  const [data] = useState<DataRow[]>(generateMockData());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(
      (row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.rank.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-8">

      {/* EXPORT */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Export Task Events</h2>

        <div className="flex gap-4 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border">

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">S.No</th>
                <th className="px-4 py-3 text-left">Mobile Party</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Contact No.</th>
                <th className="px-4 py-3 text-left">Collected</th>
                <th className="px-4 py-3 text-left">Collected Time</th>
                <th className="px-4 py-3 text-left">Handed Over</th>
                <th className="px-4 py-3 text-left">Handed Time</th>
                <th className="px-4 py-3 text-left">Location</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={row.id} className="border-t">

                  <td className="px-4 py-2">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  <td className="px-4 py-2">{row.workerId}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.rank}</td>
                  <td className="px-4 py-2">{row.contact}</td>

                  <td className="px-4 py-2">{row.ballotCollected}</td>
                  <td className="px-4 py-2">{row.collectedTimestamp}</td>

                  <td className="px-4 py-2">{row.handedOver}</td>
                  <td className="px-4 py-2">{row.handedOverTimestamp}</td>

                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate("/map-tracking")}
                      className="text-blue-600 underline"
                    >
                      View on Map
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between p-4 border-t">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}