import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function App() {

  const [btcPrice, setBtcPrice] = useState(0);
  const [lastPrice, setLastPrice] = useState(0);

  const [btcSignal, setBtcSignal] = useState("WARTEN");

  const [balance, setBalance] = useState(1000);
  const [btcAmount, setBtcAmount] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);

  const [profit, setProfit] = useState(0);

  const [marketTrend, setMarketTrend] = useState("Neutral");

  const [tradeHistory, setTradeHistory] = useState([]);

  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {

    const loadBTC = async () => {

      try {

        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
        );

        const data = await response.json();

        const newPrice = data.bitcoin.eur;

        if (lastPrice !== 0) {

          const difference = newPrice - lastPrice;

          // RUHEZONE
          if (Math.abs(difference) < 50) {

            setMarketTrend("Seitwärts ↔️");
            setBtcSignal("HOLD");

          }

          // STEIGT
          else if (difference >= 50) {

            setMarketTrend("Steigend 📈");
            setBtcSignal("BUY");

          }

          // FÄLLT
          else if (difference <= -50) {

            setMarketTrend("Fallend 📉");
            setBtcSignal("SELL");
          }
        }

        setLastPrice(newPrice);
        setBtcPrice(newPrice);

      } catch (error) {

        console.log(error);

      }

    };

    loadBTC();

    const interval = setInterval(() => {

      loadBTC();

    }, 10000);

    return () => clearInterval(interval);

  }, [lastPrice]);

  // KI TRADING
  useEffect(() => {

    // BUY
    if (
      btcSignal === "BUY" &&
      btcAmount === 0 &&
      balance >= 500 &&
      cooldown === false
    ) {

      const invest = 500;
      const amount = invest / btcPrice;

      setBtcAmount(amount);
      setBuyPrice(btcPrice);
      setBalance(prev => prev - invest);

      setTradeHistory(prev => [
        ...prev,
        `🟢 BTC gekauft bei ${btcPrice.toFixed(2)} €`
      ]);
    }

    // TAKE PROFIT
    if (
      btcAmount > 0 &&
      btcPrice >= buyPrice * 1.01
    ) {

      const value = btcAmount * btcPrice;
      const tradeProfit = value - (btcAmount * buyPrice);

      setBalance(prev => prev + value);
      setProfit(prev => prev + tradeProfit);

      setTradeHistory(prev => [
        ...prev,
        `💰 Gewinn gesichert bei ${btcPrice.toFixed(2)} € | Gewinn: ${tradeProfit.toFixed(2)} €`
      ]);

      setBtcAmount(0);
      setBuyPrice(0);

      setCooldown(true);

      setTimeout(() => {

        setCooldown(false);

      }, 15000);
    }

    // STOP LOSS
    if (
      btcAmount > 0 &&
      btcPrice <= buyPrice * 0.99
    ) {

      const value = btcAmount * btcPrice;
      const tradeLoss = value - (btcAmount * buyPrice);

      setBalance(prev => prev + value);
      setProfit(prev => prev + tradeLoss);

      setTradeHistory(prev => [
        ...prev,
        `⚠️ Stop Loss ausgelöst bei ${btcPrice.toFixed(2)} € | Verlust: ${tradeLoss.toFixed(2)} €`
      ]);

      setBtcAmount(0);
      setBuyPrice(0);

      setCooldown(true);

      setTimeout(() => {

        setCooldown(false);

      }, 15000);
    }

  }, [btcSignal, btcPrice]);

  const btcValue = btcAmount * btcPrice;
  const totalValue = balance + btcValue;

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Awa Intelligence AI
      </Text>

      <View style={styles.box}>

        <Text style={styles.market}>
          BTC LIVE: {btcPrice.toFixed(2)} €
        </Text>

        <Text style={styles.trend}>
          Markttrend: {marketTrend}
        </Text>

      </View>

      <View style={styles.box}>

        <Text style={styles.signalTitle}>
          KI Signal
        </Text>

        <Text style={styles.signal}>
          BTC: {btcSignal}
        </Text>

      </View>

      <View style={styles.box}>

        <Text style={styles.signalTitle}>
          Simulation
        </Text>

        <Text style={styles.green}>
          Virtuelles Guthaben: {balance.toFixed(2)} €
        </Text>

        <Text style={styles.white}>
          BTC Menge: {btcAmount.toFixed(6)}
        </Text>

        <Text style={styles.white}>
          BTC Kaufpreis: {buyPrice.toFixed(2)} €
        </Text>

        <Text style={styles.white}>
          BTC aktueller Wert: {btcValue.toFixed(2)} €
        </Text>

        <Text style={styles.green}>
          Gesamtwert: {totalValue.toFixed(2)} €
        </Text>

        <Text style={styles.green}>
          Gewinn / Verlust: {profit.toFixed(2)} €
        </Text>

      </View>

      <View style={styles.box}>

        <Text style={styles.signalTitle}>
          Trade Verlauf
        </Text>

        {tradeHistory.map((trade, index) => (
          <Text key={index} style={styles.white}>
            {trade}
          </Text>
        ))}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 70,
  },

  title: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },

  box: {
    marginBottom: 50,
    alignItems: "center",
  },

  signalTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  signal: {
    color: "yellow",
    fontSize: 35,
    fontWeight: "bold",
  },

  green: {
    color: "lightgreen",
    fontSize: 24,
    marginBottom: 20,
  },

  white: {
    color: "white",
    fontSize: 22,
    marginBottom: 20,
  },

  market: {
    color: "cyan",
    fontSize: 30,
    marginBottom: 20,
  },

  trend: {
    color: "orange",
    fontSize: 28,
  },

});