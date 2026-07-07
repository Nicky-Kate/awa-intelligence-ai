function analyzeAsset(name, price, previousPrice, type = "crypto") {
  const current = Number(price || 0);
  const previous = Number(previousPrice || current);

  const changePercent =
    previous > 0 ? ((current - previous) / previous) * 100 : 0;

  let signal = "HOLD";
  let mode = "Ausgewogener Modus";
  let confidence = 60;
  let risk = "Mittel";
  let reason = `${name} zeigt aktuell keine eindeutige Richtung.`;

  if (changePercent > 0.8) {
    signal = "BUY";
    mode = "Chancen-Modus";
    confidence = 78;
    risk = "Mittel";
    reason = `${name} zeigt positive Stärke. AWA sieht eine mögliche Einstiegschance.`;
  }

  if (changePercent < -0.8) {
    signal = "SELL";
    mode = "Defensiver Modus";
    confidence = 76;
    risk = "Hoch";
    reason = `${name} fällt aktuell stärker. AWA schützt Kapital und prüft Verkauf.`;
  }

  if (type === "metal" && changePercent > 0.3) {
    signal = "WATCH";
    mode = "Stabilitäts-Modus";
    confidence = 72;
    risk = "Niedrig bis Mittel";
    reason = `${name} wirkt stabil und kann als Sicherheitswert interessant sein.`;
  }

  return {
    name,
    type,
    price: current,
    changePercent: Number(changePercent.toFixed(2)),
    signal,
    mode,
    confidence,
    risk,
    reason
  };
}

function chooseBestOpportunity(assets) {
  const ranked = [...assets].sort((a, b) => {
    const scoreA =
      (a.signal === "BUY" ? 30 : 0) +
      (a.signal === "WATCH" ? 15 : 0) +
      a.confidence -
      (a.risk === "Hoch" ? 25 : 0);

    const scoreB =
      (b.signal === "BUY" ? 30 : 0) +
      (b.signal === "WATCH" ? 15 : 0) +
      b.confidence -
      (b.risk === "Hoch" ? 25 : 0);

    return scoreB - scoreA;
  });

  return ranked[0];
}

function multiAssetDecision(market) {
  const assets = [
    analyzeAsset("Bitcoin", market.bitcoin, market.previousBitcoin, "crypto"),
    analyzeAsset("Ethereum", market.ethereum, market.previousEthereum, "crypto"),
    analyzeAsset("Gold", market.gold, market.previousGold, "metal"),
    analyzeAsset("Silber", market.silver, market.previousSilver, "metal")
  ];

  const best = chooseBestOpportunity(assets);

  let globalSignal = "HOLD";
  let recommendation = "ABWARTEN";
  let mode = "AUSGEWOGENER MODUS";
  let confidence = 60;
  let reason =
    "Die Marktbedingungen sind stabil. Ich sehe aktuell keinen klaren Vorteil für Kauf oder Verkauf.";

  if (best.signal === "BUY") {
    globalSignal = "BUY";
    recommendation = "KAUF PRÜFEN";
    mode = "CHANCEN-MODUS";
    confidence = best.confidence;
    reason = `${best.name} zeigt aktuell die stärkste Chance. ${best.reason}`;
  }

  if (best.signal === "SELL") {
    globalSignal = "SELL";
    recommendation = "VERKAUF PRÜFEN";
    mode = "DEFENSIVER MODUS";
    confidence = best.confidence;
    reason = `${best.name} zeigt erhöhtes Risiko. ${best.reason}`;
  }

  if (best.signal === "WATCH") {
    globalSignal = "HOLD";
    recommendation = "BEOBACHTEN";
    mode = best.mode.toUpperCase();
    confidence = best.confidence;
    reason = `${best.name} ist aktuell interessant. ${best.reason}`;
  }

  return {
    globalSignal,
    recommendation,
    mode,
    confidence,
    reason,
    bestOpportunity: best,
    assets
  };
}

module.exports = {
  multiAssetDecision
};