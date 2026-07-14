const API_URL =
  "https://awa-intelligence-ai-production.up.railway.app/ai";

export async function getAWAData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Server antwortet nicht korrekt");
    }

    return await response.json();
  } catch (error) {
    console.log("AWA API Fehler:", error);

    return {
      binanceConnected: false,
      status: "OFFLINE",
      signal: "HOLD",
      confidence: 0,
      accountValue: 0,
      available: 0,
      investedValue: 0,
      profit: 0,
      bitcoin: 0,
      ethereum: 0,
      gold: 0,
      silver: 0,
      recommendation: "OFFLINE",
      reason: "AWA konnte keine Verbindung zum Server herstellen."
    };
  }
}