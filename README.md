# ElectionTrack — Admin Dashboard

A web dashboard that enables election administrators to monitor field workers in real time on election day. The platform provides live GPS tracking, polling station monitoring, task-day scheduling, dataset management, and exportable reports.

## Features

* **Live Map Tracking** — Track the real-time GPS locations of field workers using an interactive map powered by Leaflet.
* **Dashboard Overview** — View polling locations, polling stations, mobile parties, and ballot box counts at a glance.
* **Task-Day Scheduling** — Set and manage the official election or task day.
* **Dataset Upload & Management** — Import worker and polling data from Excel or CSV files, then browse and edit the data within the application.
* **Data Export** — Export tracked field data, including ballot collection, handover status, and timestamps, for reporting and analysis.
* **Authenticated Admin Access** — Secure administrative routes with token-based authentication.

## Tech Stack

* **React 19** + **TypeScript** + **Vite**
* **React Router v7** for routing
* **Tailwind CSS v4** + **Radix UI** for the user interface
* **Leaflet / React-Leaflet** for real-time map tracking
* **Axios** for API communication
* **Recharts** for data visualization
* **SheetJS (`xlsx`)** for spreadsheet import and export

## Getting Started

### Prerequisites

* Node.js 18 or later

### Setup

```bash
cd frontend/app
npm install
npm run dev
```

The application runs at `http://localhost:5173` by default.

## Environment Variables

Copy `.env.example` to `.env` inside `frontend/app`.

By default, the application connects to the deployed backend:

```env
VITE_API_BASE_URL=https://electiontrackwebsitebackend.onrender.com
```

You can also update this value to point to a locally running backend.

## Build for Production

```bash
npm run build
```

## Project Structure

```text
frontend/app/
├── src/
│   ├── api/                 # Axios instance and API configuration
│   ├── app/
│   │   ├── components/      # Shared UI components (maps, sidebar, cards, etc.)
│   │   └── pages/           # Route-level pages (Dashboard, MapTracking, ExportData, etc.)
│   └── styles/              # Global styles
```

## Backend

This repository contains the frontend for the ElectionTrack platform. It communicates with a separate **FastAPI** backend responsible for:

* Authentication and authorization
* Field worker GPS tracking
* Polling and ballot status management
* Dataset processing and storage
* Data export and reporting

---

*Built as a real-time election-day monitoring platform that helps administrators track field worker activity, polling status, and ballot handling.*
