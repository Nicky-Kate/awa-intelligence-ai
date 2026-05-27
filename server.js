const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("AWA Intelligence AI läuft!");
});

app.get("/ai", (req, res) => {
  res.json({
    name: "AWA Intelligence AI",
    status: "online",
    signal: "HOLD",
    message: "KI-Server ist bereit für die App"
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});