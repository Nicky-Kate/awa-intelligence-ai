const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("AWA Intelligence AI läuft erfolgreich 🚀");
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});