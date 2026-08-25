# ElectionTrack — Admin Dashboard

A web dashboard that lets election administrators monitor field workers in real time on election day — live GPS tracking, polling station status, task-day scheduling, dataset uploads, and exportable reports.

## Features

- **Live map tracking** — real-time GPS location of field workers on an interactive map (Leaflet)
- **Dashboard overview** — polling locations, stations, mobile parties, and ballot box counts at a glance
- **Task-day scheduling** — set and manage the official task/election day
- **Dataset upload & management** — import worker/polling data (Excel/CSV) and browse/edit it in-app
- **Data export** — export tracked field data (ballot collection, handover status, timestamps) for reporting
- **Authenticated admin access** — protected routes, token-based login

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router v7** for routing
- **Tailwind CSS v4** + **Radix UI** components
- **Leaflet / React-Leaflet** for live map tracking
- **Axios** for API communication
- **Recharts** for data visualization
- **SheetJS (xlsx)** for spreadsheet import/export

## Getting Started

### Prerequisites
- Node.js 18+

### Setup
\```bash
cd frontend/app
npm install
npm run dev
\```

The app runs at `http://localhost:5173` by default.

### Environment Variables
Copy `.env.example` to `.env` inside `frontend/app` (defaults to the live backend, or point it at your local backend instead):

\```
VITE_API_BASE_URL=https://electiontrackwebsitebackend.onrender.com
\```

### Build for production
\```bash
npm run build
\```

## Project Structure

\```
frontend/app/
├── src/
│   ├── api/           # Axios instance & API config
│   ├── app/
│   │   ├── components/  # Shared UI components (map, sidebar, cards, etc.)
│   │   └── pages/       # Route-level pages (Dashboard, MapTracking, ExportData, ...)
│   └── styles/
\```

## Backend

This is the frontend for the ElectionTrack platform. It communicates with a separate backend API (FastAPI) that handles authentication, worker tracking, and data storage.

---

*Built as a real-time election-day monitoring tool for administrators to track field worker activity, polling status, and ballot handling.*
