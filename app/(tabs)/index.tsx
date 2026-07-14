import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = "https://awa-intelligence-ai-production.up.railway.app";

type Trade = {
  id?: number;
  nr?: number;
  type?: string;
  symbol?: string;
  price?: number;
  profit?: number | string;
  time?: string;
  status?: string;
};

type AWAData = {
  binanceConnected?: boolean;
  status?: string;
  signal?: string;
  confidence?: number;
  accountValue?: number;
  binanceBalance?: number;
  balance?: number;
  available?: number;
  investedValue?: number;
  profit?: number;
  bitcoin?: number;
  ethereum?: number;
  gold?: number;
  silver?: number;
  recommendation?: string;
  reason?: string;
  mode?: string;
  tradeMode?: string;
  error?: string;
  tradeHistory?: Trade[];
};

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: unknown): string {
  return `${safeNumber(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function price(value: unknown): string {
  return `$${safeNumber(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function recommendationFromSignal(signal: string): string {
  if (signal === "BUY") return "Kauf prüfen";
  if (signal === "SELL") return "Verkauf prüfen";
  return "Abwarten";
}

export default function HomeScreen() {
  const [data, setData] = useState<AWAData>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<"BUY" | "SELL" | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [aiResponse, tradesResponse] = await Promise.all([
        fetch(`${API_BASE}/ai`, { cache: "no-store" }),
        fetch(`${API_BASE}/trades`, { cache: "no-store" }),
      ]);

      if (!aiResponse.ok) {
        throw new Error(`AWA API antwortet mit Status ${aiResponse.status}`);
      }

      const aiData: AWAData = await aiResponse.json();
      setData(aiData);

      if (tradesResponse.ok) {
        const tradeData = await tradesResponse.json();
        setTrades(Array.isArray(tradeData) ? [...tradeData].slice(-5).reverse() : []);
      } else if (Array.isArray(aiData.tradeHistory)) {
        setTrades([...aiData.tradeHistory].slice(-5).reverse());
      }
    } catch (error) {
      console.error("AWA Ladefehler:", error);
      setData({
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
        reason: "Der AWA-Server ist momentan nicht erreichbar.",
      });
      setTrades([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000);
    return () => clearInterval(timer);
  }, [loadData]);

  const signal = String(data.signal ?? "HOLD").toUpperCase();
  const recommendation = data.recommendation || recommendationFromSignal(signal);
  const reason =
    data.reason ||
    (data.binanceConnected === false
      ? "Binance ist aktuell nicht erreichbar. AWA führt deshalb keine Echtgeld-Order aus."
      : "AWA analysiert den Markt und wartet auf ein klares Signal.");

  const accountValue = safeNumber(data.accountValue ?? data.binanceBalance ?? 0);
  const available = safeNumber(data.available ?? data.balance ?? 0);
  const investedValue = safeNumber(data.investedValue ?? 0);
  const profitValue = safeNumber(data.profit ?? 0);
  const confidence = Math.max(0, Math.min(100, safeNumber(data.confidence ?? 0)));

  const connectionText = data.binanceConnected
    ? "ONLINE"
    : data.status === "ONLINE"
      ? "SERVER ONLINE · BINANCE OFFLINE"
      : "OFFLINE";

  const connectionStyle = data.binanceConnected ? styles.online : styles.offline;
  const canTrade = Boolean(data.binanceConnected);

  const actionLabel = useMemo(() => {
    if (actionLoading === "BUY") return "Kauf wird geprüft …";
    if (actionLoading === "SELL") return "Verkauf wird geprüft …";
    return null;
  }, [actionLoading]);

  async function executeAction(action: "BUY" | "SELL") {
    if (!canTrade) {
      Alert.alert(
        "Binance nicht verbunden",
        "Eine Echtgeld-Order ist derzeit nicht möglich. Bitte zuerst die Binance-Verbindung herstellen."
      );
      return;
    }

    const endpoint = action === "BUY" ? "confirm-buy" : "confirm-sell";

    try {
      setActionLoading(action);
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        Alert.alert(
          action === "BUY" ? "Kauf nicht ausgeführt" : "Verkauf nicht ausgeführt",
          result.message || result.error || "Die Order konnte nicht ausgeführt werden."
        );
        return;
      }

      Alert.alert(
        action === "BUY" ? "Kauf erfolgreich" : "Verkauf erfolgreich",
        result.message || "Die Order wurde ausgeführt."
      );
      await loadData();
    } catch (error) {
      console.error("AWA Orderfehler:", error);
      Alert.alert(
        "Verbindungsfehler",
        "Die Order konnte nicht an den AWA-Server gesendet werden."
      );
    } finally {
      setActionLoading(null);
    }
  }

  function confirmAction(action: "BUY" | "SELL") {
    Alert.alert(
      action === "BUY" ? "Kauf bestätigen" : "Verkauf bestätigen",
      action === "BUY"
        ? "Soll AWA den Kauf jetzt prüfen und – sofern das BUY-Signal aktiv ist – ausführen?"
        : "Soll AWA den Verkauf jetzt prüfen und – sofern das SELL-Signal aktiv ist – ausführen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: action === "BUY" ? "Kauf prüfen" : "Verkauf prüfen",
          style: action === "SELL" ? "destructive" : "default",
          onPress: () => executeAction(action),
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.logo}>AWA</Text>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>AWA wird geladen …</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor="#d4af37"
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
        />
      }
    >
      <Text style={styles.logo}>AWA</Text>
      <Text style={styles.subtitle}>INTELLIGENCE AI</Text>

      <View style={styles.card}>
        <Text style={styles.smallLabel}>Binance Verbindung</Text>
        <Text style={connectionStyle}>{connectionText}</Text>
        {data.error ? <Text style={styles.errorText}>{data.error}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🤖 AWA Empfehlung</Text>
        <Text style={styles.label}>Heute empfehle ich:</Text>
        <Text style={styles.recommendation}>{recommendation}</Text>
        <Text style={styles.label}>Warum?</Text>
        <Text style={styles.reason}>{reason}</Text>
        <Text style={styles.label}>Vertrauen der KI</Text>
        <Text style={styles.confidence}>{Math.round(confidence)}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>💼 Gesamtvermögen</Text>
        <Text style={styles.value}>{money(accountValue)}</Text>
        <Text style={styles.label}>💶 Sofort auszahlbar</Text>
        <Text style={styles.value}>{money(available)}</Text>
        <Text style={styles.label}>🪙 Investiert</Text>
        <Text style={styles.value}>{money(investedValue)}</Text>
        <Text style={styles.label}>📈 Gewinn / Verlust</Text>
        <Text style={profitValue >= 0 ? styles.profitPlus : styles.profitMinus}>
          {money(profitValue)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📊 Signal</Text>
        <Text style={styles.signal}>{signal}</Text>
        {actionLabel ? <Text style={styles.actionLoadingText}>{actionLabel}</Text> : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.buyButton,
              (!canTrade || actionLoading !== null) && styles.disabledButton,
            ]}
            disabled={!canTrade || actionLoading !== null}
            onPress={() => confirmAction("BUY")}
          >
            <Text style={styles.actionButtonText}>Kauf bestätigen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.sellButton,
              (!canTrade || actionLoading !== null) && styles.disabledButton,
            ]}
            disabled={!canTrade || actionLoading !== null}
            onPress={() => confirmAction("SELL")}
          >
            <Text style={styles.actionButtonText}>Verkauf bestätigen</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌍 Live Märkte</Text>
        <Text style={styles.btc}>₿ Bitcoin: {price(data.bitcoin)}</Text>
        <Text style={styles.eth}>♦ Ethereum: {price(data.ethereum)}</Text>
        <Text style={styles.gold}>🟡 Gold: {price(data.gold)}</Text>
        <Text style={styles.silver}>⚪ Silber: {price(data.silver)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📒 Letzte Trades</Text>
        {trades.length === 0 ? (
          <Text style={styles.emptyText}>Noch keine Trades vorhanden.</Text>
        ) : (
          trades.map((trade, index) => (
            <View key={`${trade.id ?? trade.nr ?? index}`} style={styles.tradeRow}>
              <Text style={styles.tradeTitle}>
                {trade.type || `Trade #${trade.nr ?? index + 1}`}
              </Text>
              <Text style={styles.tradeText}>
                {trade.symbol ? `${trade.symbol} · ` : ""}
                {trade.price !== undefined ? price(trade.price) : ""}
                {trade.profit !== undefined ? ` · Gewinn: ${money(trade.profit)}` : ""}
              </Text>
              {trade.time ? (
                <Text style={styles.tradeTime}>
                  {new Date(trade.time).toLocaleString("de-DE")}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
        <Text style={styles.refreshButtonText}>Daten aktualisieren</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#030303",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#d1d5db",
    marginTop: 18,
    fontSize: 16,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#030303",
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 60,
    alignItems: "center",
  },
  logo: {
    color: "#d4af37",
    fontSize: 46,
    fontWeight: "bold",
    letterSpacing: 8,
  },
  subtitle: {
    color: "white",
    fontSize: 15,
    letterSpacing: 5,
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#0f172a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.18)",
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
    fontSize: 15,
    textAlign: "center",
  },
  label: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 12,
  },
  online: {
    color: "#22c55e",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  offline: {
    color: "#ef4444",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 7,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    textAlign: "center",
  },
  recommendation: {
    color: "#d4af37",
    fontSize: 31,
    fontWeight: "bold",
    marginTop: 6,
  },
  reason: {
    color: "white",
    fontSize: 16,
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
    fontSize: 29,
    fontWeight: "bold",
  },
  profitPlus: {
    color: "#22c55e",
    fontSize: 29,
    fontWeight: "bold",
  },
  profitMinus: {
    color: "#ef4444",
    fontSize: 29,
    fontWeight: "bold",
  },
  signal: {
    color: "#facc15",
    fontSize: 42,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  buyButton: {
    backgroundColor: "#16a34a",
  },
  sellButton: {
    backgroundColor: "#d4af37",
  },
  disabledButton: {
    opacity: 0.38,
  },
  actionButtonText: {
    color: "#030303",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionLoadingText: {
    color: "#d1d5db",
    marginTop: 12,
  },
  btc: { color: "orange", fontSize: 19, marginTop: 10 },
  eth: { color: "#9ca3cf", fontSize: 19, marginTop: 10 },
  gold: { color: "gold", fontSize: 19, marginTop: 10 },
  silver: { color: "silver", fontSize: 19, marginTop: 10 },
  emptyText: {
    color: "#9ca3af",
    fontSize: 15,
  },
  tradeRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tradeTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tradeText: {
    color: "#d1d5db",
    fontSize: 14,
    marginTop: 4,
  },
  tradeTime: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  refreshButton: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 14,
    padding: 15,
  },
  refreshButtonText: {
    color: "#d4af37",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
