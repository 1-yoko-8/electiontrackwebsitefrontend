import { useState } from "react";
import axios from "axios";

export default function ExportData() {
  const [selectedDate, setSelectedDate] = useState("");

  const handleExport = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/admin/export-tasks/${selectedDate}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tasks_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          alert("No data found for the selected date");
        } else {
          alert("Failed to export file");
        }
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div>
      <h3>Export Task Events</h3>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <button onClick={handleExport}>Export</button>
    </div>
  );
}