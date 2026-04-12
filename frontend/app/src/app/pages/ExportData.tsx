import { useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X
} from "lucide-react";

/* ---------------- TYPES ---------------- */
interface DataRow {
  id: number;
  workerId: string;
  name: string;
  rank: string;
  location: string;
  contact: string;
  status: string;
}

/* ---------------- MOCK DATA ---------------- */
const generateMockData = (): DataRow[] => {
  const ranks = ["Senior Officer", "Officer", "Field Agent", "Assistant", "Supervisor"];
  const locations = [
    "Downtown District",
    "North Zone",
    "South Zone",
    "East Sector",
    "West Sector",
    "Central Area",
    "Harbor District",
    "Industrial Zone"
  ];
  const statuses = ["Active", "In Progress", "Completed", "Pending"];

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    workerId: `FW${String(i + 1).padStart(4, "0")}`,
    name: `Worker ${i + 1}`,
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    contact: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }));
};

/* Only these fields are editable */
const editableFields: (keyof DataRow)[] = [
  "name",
  "rank",
  "location",
  "contact"
];

/* ---------------- COMPONENT ---------------- */
export default function ExportData() {
  /* -------- EXPORT -------- */
  const [selectedDate, setSelectedDate] = useState("");

  const handleExport = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/admin/export-tasks/${selectedDate}`,
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
  const [data, setData] = useState<DataRow[]>(generateMockData());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<DataRow | null>(null);

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

  /* -------- EDIT HANDLERS -------- */
  const handleEdit = (row: DataRow) => {
    setEditingId(row.id);
    setEditedRow({ ...row });
  };

  const handleSave = () => {
    if (!editedRow) return;

    setData((prev) =>
      prev.map((row) => (row.id === editedRow.id ? editedRow : row))
    );

    setEditingId(null);
    setEditedRow(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedRow(null);
  };

  const handleInputChange = (field: keyof DataRow, value: string) => {
    if (!editedRow) return;

    setEditedRow({
      ...editedRow,
      [field]: value
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-8">

      {/* ================= EXPORT ================= */}
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

      {/* ================= TABLE ================= */}
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
                <th className="px-4 py-3 text-left">Worker ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2">{row.workerId}</td>

                  {editableFields.map((field) => (
                    <td key={field} className="px-4 py-2">
                      {editingId === row.id ? (
                        <input
                          value={editedRow?.[field] ?? ""}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        row[field]
                      )}
                    </td>
                  ))}

                  <td className="px-4 py-2">{row.status}</td>

                  <td className="px-4 py-2">
                    {editingId === row.id ? (
                      <div className="flex gap-2">
                        <button onClick={handleSave}>
                          <Save className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={handleCancel}>
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(row)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
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