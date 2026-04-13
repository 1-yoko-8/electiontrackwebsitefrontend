import { useState, useMemo, useEffect } from "react";
import api from "../../api/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
}

interface Report {
  username: string;
  name: string | null;
  rank: string | null;
  contact_number: string | null;

  ballot_box_collected_status: string | null;
  collected_timestamp: string | null;

  ballot_box_handed_over_status: string | null;
  handed_over_timestamp: string | null;
}

/* ---------------- COMPONENT ---------------- */

export default function ExportData() {
  /* -------- STATE -------- */

  const [data, setData] = useState<DataRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  /* -------- FETCH -------- */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await api.get<Report[]>("/admin/reports");

        const mapped: DataRow[] = res.data
          .map((r, index) => ({
            id: index + 1,
            workerId: r.username,
            name: r.name ?? "N/A",
            rank: r.rank ?? "N/A",
            contact: r.contact_number ?? "N/A",

            // 🔥 RAW VALUES (NO YES/NO TRANSFORMATION)
            ballotCollected: r.ballot_box_collected_status ?? "Not Started",
            collectedTimestamp: r.collected_timestamp
              ? new Date(r.collected_timestamp).toLocaleString()
              : "N/A",

            handedOver: r.ballot_box_handed_over_status ?? "Not Started",
            handedOverTimestamp: r.handed_over_timestamp
              ? new Date(r.handed_over_timestamp).toLocaleString()
              : "N/A",
          }))
          .sort((a, b) => a.workerId.localeCompare(b.workerId));

        setData(mapped);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* -------- SEARCH -------- */

  const filteredData = useMemo(() => {
    return data.filter(
      (row) =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.rank.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  /* -------- PAGINATION -------- */

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* -------- UI -------- */

  return (
    <div className="space-y-8">

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border">

        {/* SEARCH */}
        <div className="p-6 border-b">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search..."
            className="w-full max-w-md px-4 py-2 border rounded-lg"
          />
        </div>

        {/* TABLE BODY */}
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">S.No</th>
                  <th className="px-4 py-3 text-left">Mobile Party</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Collected Status</th>
                  <th className="px-4 py-3 text-left">Collected Time</th>
                  <th className="px-4 py-3 text-left">Handed Over Status</th>
                  <th className="px-4 py-3 text-left">Handed Over Time</th>
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

                    {/* RAW DB VALUES */}
                    <td className="px-4 py-2">{row.ballotCollected}</td>
                    <td className="px-4 py-2">{row.collectedTimestamp}</td>

                    <td className="px-4 py-2">{row.handedOver}</td>
                    <td className="px-4 py-2">{row.handedOverTimestamp}</td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* PAGINATION */}
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