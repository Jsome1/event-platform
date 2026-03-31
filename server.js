const express = require("express");
const cors = require("cors");
const eventsRoutes = require("./routes/events");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});