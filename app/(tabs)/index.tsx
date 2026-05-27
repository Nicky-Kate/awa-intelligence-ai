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
  "https://awa-intelligence-ai.onrender.com/ai"
);

const data = await response.json();

const newPrice = Math.floor(Math.random() * 100000);

setBtcSignal(data.signal);
setMarketTrend(data.status);