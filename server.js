const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

let signal = "HOLD";
let status = "ONLINE";
let balance = 1000;
let profit = 0;

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AWA Intelligence AI</title>
        <style>
          body {
            margin: 0;
            background: #050816;
            font-family: Arial, sans-serif;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }

          .card {
            width: 88%;
            max-width: 420px;
            background: #111827;
            border-radius: 28px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 0 35px rgba(0,0,0,0.5);
          }

          h1 {
            font-size: 32px;
            margin-bottom: 30px;
          }

          .label {
            color: #9ca3af;
            font-size: 16px;
            margin-top: 22px;
          }

          .value {
            font-size: 30px;
            font-weight: bold;
            color: #22c55e;
          }

          .signal {
            font-size: 46px;
            font-weight: bold;
            color: #facc15;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>AWA Intelligence AI</h1>

          <div class="label">KI Status</div>
          <div class="value">${status}</div>

          <div class="label">Signal</div>
          <div class="signal">${signal}</div>

          <div class="label">Virtuelles Guthaben</div>
          <div class="value">${balance} €</div>

          <div class="label">Gewinn / Verlust</div>
          <div class="value">${profit} €</div>
        </div>
      </body>
    </html>
  `);
});

app.get("/ai", (req, res) => {
  res.json({
    name: "AWA Intelligence AI",
    status,
    signal,
    balance,
    profit,
    message: "KI-Server ist online"
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});