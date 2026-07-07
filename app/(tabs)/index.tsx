import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAWAData } from "../../service/api";

export default function App() {
  const [status, setStatus] = useState("ONLINE");
  const [signal, setSignal] = useState("HOLD");
  const [balance, setBalance] = useState(0);
  const [profit, setProfit] = useState(0);
  const [bitcoin, setBitcoin] = useState(0);
  const [ethereum, setEthereum] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);

  async function loadData() {
    try {
      const data = await getAWAData();

      setStatus(data.status ?? "ONLINE");
      setSignal(data.signal ?? "HOLD");
      setBalance(Number(data.accountValue) || 0);
      setProfit(Number(data.profit) || 0);
      setBitcoin(Number(data.bitcoin) || 0);
      setEthereum(Number(data.ethereum) || 0);
      setGold(Number(data.gold) || 0);
      setSilver(Number(data.silver) || 0);

  setTrades([]);

          } catch (error) {
      setStatus("OFFLINE");
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000);
    return () => clearInterval(timer);
  }, []);

  const recommendation =
    signal === "BUY"
      ? "Kauf vorbereiten"
      : signal === "SELL"
      ? "Verkauf vorbereiten"
      : "Abwarten";

  const reason =
    signal === "BUY"
      ? "Der Markt zeigt aktuell eine mögliche Einstiegschance."
      : signal === "SELL"
      ? "Die KI erkennt aktuell ein erhöhtes Risiko und empfiehlt, einen Verkauf zu prüfen."
      : "Die KI sieht aktuell keinen klaren Vorteil für Kauf oder Verkauf.";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>AWA</Text>
      <Text style={styles.subtitle}>INTELLIGENCE AI</Text>

      <View style={styles.card}>
        <Text style={styles.smallLabel}>Binance Verbindung</Text>
        <Text style={styles.online}>{status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🤖 AWA Empfehlung</Text>
        <Text style={styles.label}>Heute empfehle ich:</Text>
        <Text style={styles.recommendation}>{recommendation}</Text>

        <Text style={styles.label}>Warum?</Text>
        <Text style={styles.reason}>{reason}</Text>

        <Text style={styles.label}>Vertrauen der KI</Text>
        <Text style={styles.confidence}>80%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💼 Gesamtvermögen</Text>
        <Text style={styles.value}>{balance.toFixed(2)} €</Text>
<Text style={styles.tradeText}>
  DEBUG accountValue: {balance}
</Text>

<Text style={styles.tradeText}>
  DEBUG Status: {status}
</Text>

<Text style={styles.tradeText}>
  DEBUG BTC: {bitcoin}
</Text>

        <Text style={styles.label}>💶 Sofort auszahlbar</Text>
        <Text style={styles.value}>{balance.toFixed(2)} €</Text>

        <Text style={styles.label}>📈 Gewinn / Verlust</Text>
        <Text style={profit >= 0 ? styles.profitPlus : styles.profitMinus}>
          {profit.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📊 Signal</Text>
        <Text style={styles.signal}>{signal}</Text>

        <TouchableOpacity style={styles.sellButton} onPress={async () => {
          await fetch("https://awa-intelligence-ai.onrender.com/confirm-sell");
          loadData();
        }}>
          <Text style={styles.buttonText}>Verkauf bestätigen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌍 Live Märkte</Text>
        <Text style={styles.btc}>₿ Bitcoin: ${bitcoin}</Text>
        <Text style={styles.eth}>♦ Ethereum: ${ethereum}</Text>
        <Text style={styles.gold}>🟡 Gold: ${gold}</Text>
        <Text style={styles.silver}>⚪ Silber: ${silver}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📒 Letzte Trades</Text>
        {trades.map((trade, index) => (
          <Text key={index} style={styles.tradeText}>
            {trade.type
              ? `${trade.type} | $${trade.price ?? 0}`
              : `Trade #${trade.nr ?? index + 1} | Gewinn: ${trade.profit ?? 0} €`}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#030303",
    padding: 24,
    alignItems: "center",
  },
  logo: {
    color: "#d4af37",
    fontSize: 46,
    fontWeight: "bold",
    marginTop: 30,
    letterSpacing: 8,
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    letterSpacing: 6,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#d4af37",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
  },
  smallLabel: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  label: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 12,
  },
  online: {
    color: "#22c55e",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  recommendation: {
    color: "#d4af37",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 6,
  },
  reason: {
    color: "white",
    fontSize: 17,
    lineHeight: 24,
    marginTop: 8,
  },
  confidence: {
    color: "#22c55e",
    fontSize: 34,
    fontWeight: "bold",
  },
  value: {
    color: "#22c55e",
    fontSize: 30,
    fontWeight: "bold",
  },
  profitPlus: {
    color: "#22c55e",
    fontSize: 30,
    fontWeight: "bold",
  },
  profitMinus: {
    color: "#ef4444",
    fontSize: 30,
    fontWeight: "bold",
  },
  signal: {
    color: "#facc15",
    fontSize: 44,
    fontWeight: "bold",
  },
  sellButton: {
    backgroundColor: "#d4af37",
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
  },
  buttonText: {
    color: "#030303",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  btc: { color: "orange", fontSize: 20, marginTop: 10 },
  eth: { color: "#8a92b2", fontSize: 20, marginTop: 10 },
  gold: { color: "gold", fontSize: 20, marginTop: 10 },
  silver: { color: "silver", fontSize: 20, marginTop: 10 },
  tradeText: {
    color: "white",
    fontSize: 16,
    marginTop: 8,
  },
});