import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DATA_FILE = path.join(process.cwd(), "data.json");

  // Initial data structure
  const initialData = {
    tournamentInfo: {
      title: "KEJOHANAN BOLA SEPAK SEKOLAH RENDAH MSSD TUARAN",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MSSD",
      organizer: "MSSD Tuaran",
      manager: "SK Tuaran",
      startDate: "2026-06-01",
      endDate: "2026-06-05",
      time: "08:00 AM - 05:00 PM",
      venue: "Kompleks Sukan Tuaran",
      mapUrl: "",
      motivationQuote: "Majulah Sukan Untuk Negara!",
      isRegistrationOpen: true
    },
    teams: [],
    matches: [],
    groups: ['A', 'B', 'C', 'D'],
    quickLinks: []
  };

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }

  const getData = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const saveData = (data: any) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // API Routes
  app.get("/api/data", (req, res) => {
    res.json(getData());
  });

  app.post("/api/update", (req, res) => {
    saveData(req.body);
    res.json({ success: true });
  });

  app.post("/api/reset", (req, res) => {
    const { password } = req.body;
    if (password === "Adzeem06022023") {
      saveData(initialData);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Password salah" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
