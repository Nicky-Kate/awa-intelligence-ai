import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [status, setStatus] = useState("ONLINE");
  const [signal, setSignal] = useState("HOLD");
  const [balance, setBalance] = useState(1000);
  const [profit, setProfit] = useState(0);
  const [bitcoin, setBitcoin] = useState(0);
  const [ethereum, setEthereum] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
const [trades, setTrades] = useState<any[]>([]);
  async function loadData() {
    try {
      const response = await fetch("https://awa-intelligence-ai.onrender.com/ai");
      const data = await response.json();

      setStatus(data.status ?? "ONLINE");
      setSignal(data.signal ?? "HOLD");
      setBalance(data.balance ?? 1000);
      setProfit(data.profit ?? 0);
      setBitcoin(data.bitcoin ?? 0);
      setEthereum(data.ethereum ?? 0);
      setGold(data.gold ?? 0);
      setSilver(data.silver ?? 0);
const tradeResponse = await fetch("https://awa-intelligence-ai.onrender.com/trades");
const tradeData = await tradeResponse.json();
setTrades(tradeData.slice(-5).reverse());
    } catch (error) {
      setStatus("OFFLINE");
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AWA Intelligence AI</Text>

      <Text style={styles.label}>KI Status</Text>
      <Text style={styles.online}>{status}</Text>

      <Text style={styles.label}>Signal</Text>
      <Text style={styles.signal}>{signal}</Text>

      <Text style={styles.label}>Virtuelles Guthaben</Text>
      <Text style={styles.value}>{balance} €</Text>

      <Text style={styles.label}>Gewinn / Verlust</Text>
      <Text style={profit >= 0 ? styles.profitPlus : styles.profitMinus}>
        {profit} €
      </Text>
<Text style={styles.label}>Letzte Trades</Text>

{trades.map((trade, index) => (
  <Text key={index} style={styles.value}>
    {trade.type} {trade.price}
  </Text>
))}
<Text
  style={{
    backgroundColor: "#00aa00",
    color: "white",
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    textAlign: "center"
  }}
  onPress={async () => {
    await fetch("https://awa-intelligence-ai.onrender.com/confirm-buy");
    loadData();
  }}
>
  BUY BESTÄTIGEN
</Text>

<Text
  style={{
    backgroundColor: "#cc0000",
    color: "white",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    textAlign: "center"
  }}
  onPress={async () => {
    await fetch("https://awa-intelligence-ai.onrender.com/confirm-sell");
    loadData();
  }}
>
  SELL BESTÄTIGEN
</Text>
      <View style={styles.market}>
        <Text style={styles.marketTitle}>Live Märkte</Text>
        <Text style={styles.btc}>₿ Bitcoin: ${bitcoin}</Text>
        <Text style={styles.eth}>♦ Ethereum: ${ethereum}</Text>
        <Text style={styles.gold}>🟡 Gold: ${gold}</Text>
        <Text style={styles.silver}>⚪ Silber: ${silver}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    color: "#9ca3af",
    fontSize: 18,
    marginTop: 18,
  },
  online: {
    color: "#22c55e",
    fontSize: 34,
    fontWeight: "bold",
  },
  signal: {
    color: "#facc15",
    fontSize: 52,
    fontWeight: "bold",
  },
  value: {
    color: "#22c55e",
    fontSize: 34,
    fontWeight: "bold",
  },
  profitPlus: {
    color: "#22c55e",
    fontSize: 34,
    fontWeight: "bold",
  },
  profitMinus: {
    color: "#ef4444",
    fontSize: 34,
    fontWeight: "bold",
  },
  market: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 24,
    marginTop: 35,
  },
  marketTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  btc: {
    color: "orange",
    fontSize: 22,
    marginTop: 14,
  },
  eth: {
    color: "#8a92b2",
    fontSize: 22,
    marginTop: 14,
  },
  gold: {
    color: "gold",
    fontSize: 22,
    marginTop: 14,
  },
  silver: {
    color: "silver",
    fontSize: 22,
    marginTop: 14,
  },
});