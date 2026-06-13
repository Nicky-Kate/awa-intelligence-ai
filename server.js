require("dotenv").config(); 
const express = require("express");
const fs = require("fs");
const Binance = require("binance-api-node").default;

const binanceClient = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});
const TRADE_FILE = "trades.json";

const app = express();
const PORT = process.env.PORT || 3000;

let status = "ONLINE";
let signal = "SELL";
let balance = 1000;

// Startwerte
let bitcoin = 67250;
let ethereum = 2500;
let gold = 2320;
let silver = 30;

// Demo-Gewinn/Verlust
let startBitcoin = 67250;
let profit = 0;
let lastBitcoinPrice = bitcoin;
let holdingBitcoin = false;
let buyPrice = 0;
let confidence = 50;
let btcAmount = 0;
let tradeMode = "LIVE_CONFIRM";
let tradeHistory = [];

if (fs.existsSync(TRADE_FILE)) {
    tradeHistory = JSON.parse(fs.readFileSync(TRADE_FILE, "utf8"));
}
let tradeCount = tradeHistory.length
let lastBuyPrice = 0;
let lastSellPrice = 0;
let lastTradeProfit = 0;

function updateProfit() {
  // Alte Demo-Berechnung deaktiviert
}
async function updateBitcoinPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );

    const json = await response.json();

    if (json.bitcoin && json.bitcoin.usd) {
     bitcoin = json.bitcoin.usd;
if (bitcoin > lastBitcoinPrice) {
    signal = "BUY";
confidence = 85;
}
else if (bitcoin < lastBitcoinPrice * 0.9997) {
    signal = "SELL";
confidence = 80;
}
else {
    signal = "HOLD";
confidence = 60;
}
// Paper-Trading Logik
if (tradeMode === "PAPER" && signal === "BUY" && !holdingBitcoin) {
    holdingBitcoin = true;
    buyPrice = bitcoin;
lastBuyPrice = buyPrice;
 
    btcAmount = balance / bitcoin;
    balance = 0;
    console.log("PAPER BUY bei:", buyPrice);
}
console.log("BTC gekauft:", btcAmount);
console.log("Restbalance:", balance);
console.log("DEBUG:", { signal, holdingBitcoin, btcAmount, balance });
if (tradeMode === "PAPER" && signal === "SELL" && holdingBitcoin) {
     

balance = btcAmount * bitcoin;
profit = Math.round(balance - 1000);
lastSellPrice = bitcoin;
lastTradeProfit = balance - 1000;
tradeCount++;

tradeHistory.push({
    nr: tradeCount,
    buy: lastBuyPrice,
    sell: lastSellPrice,
    profit: lastTradeProfit.toFixed(2)
});
fs.writeFileSync(TRADE_FILE, JSON.stringify(tradeHistory, null, 2)); 
holdingBitcoin = false;
btcAmount = 0;
buyPrice = 0;
console.log("PAPER SELL bei:", bitcoin);}
if (holdingBitcoin) {
    profit = ((bitcoin - buyPrice) * btcAmount).toFixed(2);
}
lastBitcoinPrice = bitcoin;

console.log("Bitcoin live:", bitcoin);
console.log("Signal:", signal);
      // updateProfit();
    }
  } catch (err) {
    console.log("Bitcoin Fehler:", err.message);
  }
}

async function updateEthereumPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    const json = await response.json();

    if (json.ethereum && json.ethereum.usd) {
      ethereum = json.ethereum.usd;
      console.log("Ethereum live:", ethereum);
    }
  } catch (err) {
    console.log("Ethereum Fehler:", err.message);
  }
}

async function updateGoldPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd"
    );

    const json = await response.json();

    if (json["tether-gold"] && json["tether-gold"].usd) {
      gold = json["tether-gold"].usd;
      console.log("Gold  :", gold);
    }
  } catch (err) {
    console.log("Gold Fehler:", err.message);
  }
}

async function updateSilverPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=silver-token&vs_currencies=usd"
    );

    const json = await response.json();

    if (json["silver-token"] && json["silver-token"].usd) {
      silver = json["silver-token"].usd;
      console.log("Silver live:", silver);
    }
  } catch (err) {
    console.log("Silver Fehler:", err.message);
  }
}

// Erste Aktualisierung beim Start
updateBitcoinPrice();
updateEthereumPrice();
updateGoldPrice();
updateSilverPrice();

// Regelmäßige Aktualisierung
setInterval(updateBitcoinPrice, 60000);
setInterval(updateEthereumPrice, 60000);
setInterval(updateGoldPrice, 60000);
setInterval(updateSilverPrice, 300000);
app.get("/trades", (req, res) => {
    res.json(tradeHistory);
});
app.get("/", (req, res) => {
const accountValue = balance + (btcAmount * bitcoin);
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
      background: #020617 ;
      font-family: Arial, sans-serif;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .card {
      width: 92 %;
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

    .profit-positive {
      color: #22c55e;
    }

    .profit-negative {
      color: #ef4444;
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

    .eth {
      color: #8a92b2;
    }

    .gold {
      color: gold;
    }

    .silver {
      color: silver;
    }
  </style>
</head>

<script>
setTimeout(() => location.reload(), 5000);
</script>
<body>
  <div class="card">
    <h1>AWA Intelligence AI</h1>
<div class="label">Binance Verbindung</div>
<div class="value">LIVE</div>

<div class="label">Binance Guthaben</div>
<div class="value">0.00303025 EUR</div>

<div class="label">Binance Modus</div>
<div class="value">LIVE_TRADING</div> 

    <div class="label">KI Status</div>
    <div class="value">${status}</div>

    <div class="label">Signal</div>
    <div class="signal">${signal}</div>
${signal === "BUY" && !holdingBitcoin ? `
<div class="label">Trade Vorschlag</div>
<div class="value">BTC Kauf vorbereiten</div>
<button onclick="location.href='/confirm-buy'">
KAUF BESTÄTIGEN
</button>
` : ""}

${signal === "SELL" && holdingBitcoin ? ` 
<div class="label">Trade Vorschlag</div>
<div class="value">BTC Verkauf vorbereiten</div>
<button onclick="location.href='/confirm-sell'">
VERKAUF BESTÄTIGEN
</button>
` : ""}
<div class="label">Signal Stärke</div>
<div class="value">${confidence}%</div>


    
   <div class="label">Kontowert</div>
<div class="value">${accountValue.toFixed(2)} €</div>

<div class="label">Verfügbares Guthaben</div>
<div class="value">${balance.toFixed(2)} €</div>
<div class="label">Gewinn / Verlust</div>
<div class="value">${Number(profit).toFixed(2)} €</div>
<div class="label">Modus</div>
<div class="value">${tradeMode}</div>

<div class="label">BTC Bestand</div>
<div class="value">${btcAmount}</div>

<div class="label">Kaufpreis</div>
<div class="value">$${buyPrice}</div>

<div class="label">Position</div>
<div class="value">${holdingBitcoin ? "OFFEN" : "KEINE"}</div>
<div class="label">Letzter Kauf</div>
<div class="value">$${buyPrice}</div>
<div class="label">Anzahl Trades</div>
<div class="value">${tradeCount}</div>

<div class="label">Letzter Verkauf</div>
<div class="value">$${lastSellPrice}</div>

<div class="label">Letzter Trade Gewinn</div>
<div class="value">${lastTradeProfit.toFixed(2)} €</div>

<div class="label">Aktueller BTC Preis</div>
<div class="value"$${bitcoin}</div>
<div class ="market">           
<h2>Live Märkte</h2>

<div class="market-item btc">
 ₿ Bitcoin: $${bitcoin}
</div>

      <div class="market-item eth">
        ♦ Ethereum: $${ethereum}
      </div>

      <div class="market-item gold">
        🟡 Gold: $${gold}
      </div>

      <div class="market-item silver">
        ⚪ Silber: $${silver}
      </div>
    </div>
  </div>
<div class="market">
    <h2>Trade Historie</h2>

    ${tradeHistory.length === 0 ? `
        <div class="market-item">Noch keine Trades</div>
    ` : tradeHistory.map(t => `
        <div class="market-item">
            Trade #${t.nr}<br>
            Kauf: $${t.buy}<br>
            Verkauf: $${t.sell}<br>
            Gewinn: ${t.profit} €
        </div>
    `).join("")}
</div>
</body>
</html>
  `);
});
app.get("/ai", (req, res) => {
const accountValue =
    balance + (btcAmount * bitcoin);

  res.json({
    name: "AWA Intelligence AI",
binanceConnected: true,
binanceMode: "LIVE_TRADING",
binanceBalance: 0.00303025,
    status,
    signal,
    confidence,
    balance,
    accountValue,
    profit,
    bitcoin,
    ethereum,
    gold,
    silver,
    holdingBitcoin,
    buyPrice,
    btcAmount,
lastBuyPrice,
lastSellPrice,
lastTradeProfit,
tradeCount,
tradeHistory,
    tradeMode
  });
});
app.get("/binance", async (req, res) => {
  try {
    const account = await binanceClient.accountInfo();

    res.json({
      connected: true,
      balances: account.balances.filter(
        b => Number(b.free) > 0 || Number(b.locked) > 0
      )
    });
  } catch (err) {
    res.json({
      connected: false,
      error: err.message
    });
  }
});
app.get("/test-order", async (req, res) => {
    try {

        const account = await binanceClient.accountInfo();

        const eur = account.balances.find(
            b => b.asset === "EUR"
        );

        res.json({
            eur: eur ? eur.free : "0"
        });

    } catch (err) {

        res.json({
            error: err.message
        });

    }
});
app.get("/confirm-buy", (req, res) => {

    if (signal !== "BUY") {
        return res.send("Kein BUY Signal aktiv");
    }

    holdingBitcoin = true;
    buyPrice = bitcoin;
    lastBuyPrice = bitcoin;

    btcAmount = balance / bitcoin;
    balance = 0;

    tradeCount++;

tradeHistory.push({
    id: tradeCount,
    type: "BUY",
    buy: bitcoin,
    sell: 0,
    profit: 0,
    amount: btcAmount,
    time: new Date().toISOString()
});

    fs.writeFileSync(
        TRADE_FILE,
        JSON.stringify(tradeHistory, null, 2)
    );

    res.send("BTC Kauf bestätigt!");
});
app.get("/confirm-sell", (req, res) => {

    if (!holdingBitcoin) {
        return res.send("Keine BTC Position offen");
    }

    balance = btcAmount * bitcoin;

    lastSellPrice = bitcoin;
    lastTradeProfit = balance - 1000;

    holdingBitcoin = false;
    btcAmount = 0;

    tradeCount++;

    tradeHistory.push({
    id: tradeCount,
    type: "SELL",
    buy: buyPrice,
    sell: bitcoin,
    profit: lastTradeProfit,
    amount: balance,
    time: new Date().toISOString()
});
    fs.writeFileSync(
        TRADE_FILE,
        JSON.stringify(tradeHistory, null, 2)
    );

    res.send("BTC Verkauf bestätigt!");
});
app.listen(PORT, () => {
  console.log("Server läuft auf Port " + PORT);
}); 