import { useState } from "react"
import api from "../../api/axios"

export function TaskDay() {
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!date) {
      alert("Please select a date")
      return
    }

    try {
      setLoading(true)
      await api.post("/admin/set-task-day", { date })
      alert("Task day set successfully")
    } catch (err) {
      console.error(err)
      alert("Failed to set task day")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-semibold">
        Set Task Day
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-md">

        {/* DATE INPUT */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Set Task Day"}
        </button>

      </div>
    </div>
  )
}