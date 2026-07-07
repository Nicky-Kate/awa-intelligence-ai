  require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Binance = require("binance-api-node").default;
const { multiAssetDecision } = require("./ai/multiAssetEngine");
const { rememberDecision, getMemory } = require("./ai/learningMemory");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const TRADE_FILE = "trades.json";

const binanceClient = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
 
});
let status = "ONLINE";
let signal = "HOLD";
let confidence = 60;

let bitcoin = 67250;
let ethereum = 2500;
let gold = 2320;
let silver = 30;

let lastBitcoinPrice = bitcoin;
let lastBuyPrice = 0;
let lastSellPrice = 0;
let lastTradeProfit = 0;

let tradeMode = "AUTO_SMALL";
let tradeHistory = [];

if (fs.existsSync(TRADE_FILE)) {
  tradeHistory = JSON.parse(fs.readFileSync(TRADE_FILE, "utf8"));
}

let tradeCount = tradeHistory.length;

function saveTrades() {
  fs.writeFileSync(TRADE_FILE, JSON.stringify(tradeHistory, null, 2));
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
      } else if (bitcoin < lastBitcoinPrice * 0.9997) {
        signal = "SELL";
        confidence = 80;
      } else {
        signal = "HOLD";
        confidence = 60;
      }

      lastBitcoinPrice = bitcoin;

      console.log("Bitcoin live:", bitcoin);
      console.log("Signal:", signal);
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
      console.log("Gold live:", gold);
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

function getDecision() {
  return multiAssetDecision({
    bitcoin,
    ethereum,
    gold,
    silver,
    previousBitcoin: lastBuyPrice || lastBitcoinPrice || bitcoin,
    previousEthereum: ethereum * 0.995,
    previousGold: gold * 0.997,
    previousSilver: silver * 0.997,
  });
}

async function getBinancePortfolio() {
  const account = await binanceClient.accountInfo();

  const btc = account.balances.find((b) => b.asset === "BTC");
  const eur = account.balances.find((b) => b.asset === "EUR");

  const realBTC = btc ? Number(btc.free) + Number(btc.locked) : 0;
  const realEUR = eur ? Number(eur.free) + Number(eur.locked) : 0;

  const investedValue = realBTC * bitcoin;
  const accountValue = realEUR + investedValue;

  return {
    realBTC,
    realEUR,
    investedValue,
    accountValue,
  };
}

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/trades", (req, res) => {
  res.json(tradeHistory);
});

app.get("/ai", async (req, res) => {
  try {
    const portfolio = await getBinancePortfolio();
    const decision = getDecision();
rememberDecision(decision);

    res.json({
      name: "AWA Intelligence AI",
      binanceConnected: true,
      binanceMode: "LIVE_TRADING",

      status,
      signal,
      confidence,
      tradeMode,

      binanceBalance: portfolio.accountValue,
      accountValue: portfolio.accountValue,
      balance: portfolio.realEUR,
      available: portfolio.realEUR,
      investedValue: portfolio.investedValue,

      profit: 0,

      bitcoin,
      ethereum,
      gold,
      silver,

      holdingBitcoin: portfolio.realBTC > 0,
      btcAmount: portfolio.realBTC,

      lastBuyPrice,
      lastSellPrice,
      lastTradeProfit,
      tradeCount,
      tradeHistory,

      multiDecision: decision,
      assetSignals: decision.assets,
      bestOpportunity: decision.bestOpportunity,
      recommendation: decision.recommendation,
      mode: decision.mode,
      reason: decision.reason,
    });
  } catch (err) {
    res.json({
      name: "AWA Intelligence AI",
      binanceConnected: false,
      error: err.message,
    });
  }
});

app.get("/binance", async (req, res) => {
  try {
    const account = await binanceClient.accountInfo();

    res.json({
      connected: true,
      balances: account.balances.filter(
        (b) => Number(b.free) > 0 || Number(b.locked) > 0
      ),
    });
  } catch (err) {
    res.json({
      connected: false,
      error: err.message,
    });
  }
});
app.get("/test-order", async (req, res) => {
  try {
    const account = await binanceClient.accountInfo();
    const eur = account.balances.find((b) => b.asset === "EUR");

    res.json({
      eur: eur ? eur.free : "0",
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
});

async function executeBuy() {
  const LIVE_BUY_EUR = 5;
  const TRADE_SYMBOL = "BTCEUR";

  if (signal !== "BUY") {
    return {
      success: false,
      action: "NO_BUY",
      message: "Kein BUY Signal aktiv",
    };
  }

  const portfolio = await getBinancePortfolio();

  if (portfolio.realEUR < LIVE_BUY_EUR) {
    return {
      success: false,
      action: "NO_FUNDS",
      message: "Nicht genug EUR Guthaben",
      available: portfolio.realEUR,
    };
  }

  const order = await binanceClient.order({
    symbol: TRADE_SYMBOL,
    side: "BUY",
    type: "MARKET",
    quoteOrderQty: LIVE_BUY_EUR.toString(),
  });

  tradeCount++;
  lastBuyPrice = bitcoin;

  tradeHistory.push({
    id: tradeCount,
    type: "LIVE_BUY",
    symbol: TRADE_SYMBOL,
    eurAmount: LIVE_BUY_EUR,
    price: bitcoin,
    orderId: order.orderId,
    status: order.status,
    time: new Date().toISOString(),
    tradeMode: "AUTO_SMALL",
  });

  saveTrades();

  return {
    success: true,
    action: "BUY",
    message: "AUTO BUY ausgeführt",
    order,
  };
}

async function executeSell() {
  const TRADE_SYMBOL = "BTCEUR";

  if (signal !== "SELL") {
    return {
      success: false,
      action: "NO_SELL",
      message: "Kein SELL Signal aktiv",
    };
  }

  const portfolio = await getBinancePortfolio();

  if (portfolio.realBTC <= 0) {
    return {
      success: false,
      action: "NO_BTC",
      message: "Kein BTC zum Verkaufen vorhanden",
    };
  }

  const order = await binanceClient.order({
    symbol: TRADE_SYMBOL,
    side: "SELL",
    type: "MARKET",
    quantity: portfolio.realBTC.toString(),
  });

  tradeCount++;
  lastSellPrice = bitcoin;

  tradeHistory.push({
    id: tradeCount,
    type: "LIVE_SELL",
    symbol: TRADE_SYMBOL,
    btcAmount: portfolio.realBTC,
    price: bitcoin,
    orderId: order.orderId,
    status: order.status,
    time: new Date().toISOString(),
    tradeMode: "AUTO_SMALL",
  });

  saveTrades();

  return {
    success: true,
    action: "SELL",
    message: "AUTO SELL ausgeführt",
    order,
  };
}

app.get("/confirm-buy", async (req, res) => {
  try {
    const result = await executeBuy();
    res.json(result);
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/confirm-sell", async (req, res) => {
  try {
    const result = await executeSell();
    res.json(result);
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});

let autoTradingEnabled = true;
let autoTradeRunning = false;
let lastAutoTradeTime = 0;

setInterval(async () => {
  try {
    if (!autoTradingEnabled) return;
    if (autoTradeRunning) return;

    const now = Date.now();
    const cooldown = 5 * 60 * 1000;

    if (now - lastAutoTradeTime < cooldown) return;

    autoTradeRunning = true;

    const decision = getDecision();

    console.log(
      "AWA AUTO:",
      decision.recommendation,
      decision.bestOpportunity?.name,
      decision.confidence + "%"
    );

    let result = null;

    if (decision.globalSignal === "BUY" && decision.confidence >= 75) {
      result = await executeBuy();
    }

    if (decision.globalSignal === "SELL" && decision.confidence >= 75) {
      result = await executeSell();
    }

    if (result && result.success) {
      lastAutoTradeTime = now;
      console.log("AUTO TRADE:", result.message);
    }

    autoTradeRunning = false;
  } catch (err) {
    autoTradeRunning = false;
    console.log("AUTO TRADE FEHLER:", err.message);
  }
}, 60000);

updateBitcoinPrice();
updateEthereumPrice();
updateGoldPrice();
updateSilverPrice();

setInterval(updateBitcoinPrice, 60000);
setInterval(updateEthereumPrice, 60000);
setInterval(updateGoldPrice, 60000);
setInterval(updateSilverPrice, 300000);

app.get("/learning-memory", (req, res) => {
    res.json(getMemory());
});
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server läuft auf Port " + PORT);
});