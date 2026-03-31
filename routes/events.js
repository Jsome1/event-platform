const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get("/:id", (req, res) => {
  db.get("SELECT * FROM events WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "Event not found" });
    res.json(row);
  });
});

router.post("/", (req, res) => {
  const { title, description, date, time, location, category, capacity } = req.body;
  db.run(
    `INSERT INTO events (title, description, date, time, location, category, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, date, time, location, category, capacity],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.put("/:id", (req, res) => {
  const { title, description, date, time, location, category, capacity } = req.body;
  db.run(
    `UPDATE events SET title=?, description=?, date=?, time=?, location=?, category=?, capacity=? WHERE id=?`,
    [title, description, date, time, location, category, capacity, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: true });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.run("DELETE FROM events WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

router.post("/:id/register", (req, res) => {
  const { fullName, email, phone } = req.body;
  const eventId = req.params.id;

  db.get("SELECT capacity FROM events WHERE id = ?", [eventId], (err, event) => {
    if (err || !event) return res.status(404).json({ message: "Event not found" });

    db.get("SELECT COUNT(*) as count FROM registrations WHERE eventId = ?", [eventId], (err, row) => {
      if (row.count >= event.capacity) {
        return res.status(400).json({ message: "Capacity full error" });
      }

      db.run(
        `INSERT INTO registrations (eventId, fullName, email, phone) VALUES (?, ?, ?, ?)`,
        [eventId, fullName, email, phone],
        function (err) {
          if (err) {
            if (err.message.includes("UNIQUE")) {
              return res.status(400).json({ message: "Duplicate email error" });
            }
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ success: true });
        }
      );
    });
  });
});

router.get("/:id/attendees", (req, res) => {
  db.all("SELECT * FROM registrations WHERE eventId = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;