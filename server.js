// ==================== INIT / ENV ====================
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json()); // Parse JSON body

// ==================== DATABASE INIT ====================
const dbFolder = path.join(__dirname, "database");
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder);

const dbPath = path.join(dbFolder, "uniform.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) throw err;
  console.log("Database connected.");

  // Create Tables
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    class TEXT,
    stream TEXT,
    gender TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT,
    total_stock INTEGER,
    issued INTEGER,
    price REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    item TEXT,
    quantity INTEGER,
    price REAL,
    payment REAL,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    amount REAL,
    method TEXT,
    date TEXT
  )`);
});

// ==================== ROUTES ====================

// ---------- STUDENTS ----------
app.get("/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

app.get("/students/:id", (req, res) => {
  db.get("SELECT * FROM students WHERE id=?", [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: "Student not found" });
    res.json(row);
  });
});

app.post("/students", (req, res) => {
  const { id, name, class: cls, stream, gender } = req.body;
  db.run(
    "INSERT INTO students (id, name, class, stream, gender) VALUES (?, ?, ?, ?, ?)",
    [id, name, cls, stream, gender],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.json({ success: true });
    }
  );
});

app.post("/students/:id/update", (req, res) => {
  const { name, class: cls, stream, gender } = req.body;
  db.run(
    "UPDATE students SET name=?, class=?, stream=?, gender=? WHERE id=?",
    [name, cls, stream, gender, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update error" });
      res.json({ success: true });
    }
  );
});

app.delete("/students/:id", (req, res) => {
  db.run("DELETE FROM students WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete error" });
    res.json({ success: true });
  });
});

// ---------- ISSUES ----------
app.get("/issues", (req, res) => {
  db.all("SELECT * FROM issues", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

app.post("/students/:id/add-issue", (req, res) => {
  const { item, quantity, price, payment } = req.body;
  const date = new Date().toISOString();

  db.run(
    "INSERT INTO issues (student_id, item, quantity, price, payment, date) VALUES (?, ?, ?, ?, ?, ?)",
    [req.params.id, item, quantity, price, payment, date],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.json({ success: true });
    }
  );
});

// ---------- PAYMENTS ----------
app.post("/students/:id/add-payment", (req, res) => {
  const { amount, method } = req.body;
  const date = new Date().toISOString();

  db.run(
    "INSERT INTO payments (student_id, amount, method, date) VALUES (?, ?, ?, ?)",
    [req.params.id, amount, method, date],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.json({ success: true });
    }
  );
});

// ---------- INVENTORY ----------
app.get("/inventory", (req, res) => {
  db.all("SELECT * FROM inventory", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
  });
});

app.post("/inventory", (req, res) => {
  const { item, total_stock, issued, price } = req.body;

  db.run(
    "INSERT INTO inventory (item, total_stock, issued, price) VALUES (?, ?, ?, ?)",
    [item, total_stock, issued, price],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert error" });
      res.json({ success: true });
    }
  );
});

// ---------- FRONTEND ----------
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});