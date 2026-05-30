
const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

let status = "ONLINE";
let signal = "HOLD";
let balance = 1000;
let profit = 0;

// Demo Live Preise
let bitcoin = 67250;
let gold = 2320;
async function updateGoldPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd"
    );

    const json = await response.json();

    if (json["tether-gold"] && json["tether-gold"].usd) {
      gold = json["tether-gold"].usd;
      console.log("Gold live:", gold);
    }
  } catch (err) {
    console.log("Gold Fehler:", err.message);
  }
}
let silver = 30;
async function updateSilverPrice() {
  try {
    const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=silver-token&vs_currencies=usd"
    );

    const json = await response.json();
console.log(json);
if (json["silver-token"] && json["silver-token"].usd) {
    silver = json["silver-token"].usd;
}

      console.log("Silver live:", silver);
    }
  } catch (err) {
    console.log("Silver Fehler:", err.message);
  }
}
async function updateBitcoinPrice() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const json = await response.json();


    if (json.bitcoin && json.bitcoin.usd) {
      bitcoin = json.bitcoin.usd;
      console.log("Bitcoin live:", bitcoin);
    }
  } catch (err) {
    console.log("Bitcoin Fehler:", err.message);
  }
}

updateBitcoinPrice();
updateGoldPrice();
updateSilverPrice();


setInterval(updateBitcoinPrice, 60000);
setInterval(updateGoldPrice, 60000);
setInterval(updateSilverPrice, 60000);
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
          padding: 0;
          background: #020617;
          font-family: Arial, sans-serif;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .card {
          width: 90%;
          max-width: 420px;
          background: #0f172a;
          border-radius: 30px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }

        h1 {
          font-size: 34px;
          margin-bottom: 30px;
        }

        .label {
          color: #9ca3af;
          margin-top: 25px;
          font-size: 18px;
        }

        .value {
          font-size: 34px;
          font-weight: bold;
          color: #22c55e;
        }

        .signal {
          color: #facc15;
          font-size: 50px;
          font-weight: bold;
        }

        .market {
          margin-top: 35px;
          background: #111827;
          border-radius: 20px;
          padding: 20px;
        }

        .market-item {
          margin-top: 18px;
          font-size: 24px;
        }

        .btc {
          color: orange;
        }

        .gold {
          color: gold;
        }

        .silver {
          color: silver;
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

        <div class="market">

          <h2>Live Märkte</h2>

          <div class="market-item btc">
            ₿ Bitcoin: $${bitcoin}
          </div>

          <div class="market-item gold">
            🟡 Gold: $${gold}
          </div>

          <div class="market-item silver">
            ⚪ Silber: $${silver}
          </div>

        </div>

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
    bitcoin,
    gold,
    silver
  });
});

app.listen(PORT, () => {
  console.log("Server läuft auf Port " + PORT);
});