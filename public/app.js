async function loadDashboard() {

    try {

        const res = await fetch("/ai");
        const data = await res.json();

        document.getElementById("accountValue").innerText =
            Number(data.binanceBalance).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

        document.getElementById("available").innerText =
            Number(data.available).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

        document.getElementById("invested").innerText =
            Number(data.investedValue).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

        document.getElementById("profit").innerText =
            Number(data.profit).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " €";

        document.getElementById("bitcoin").innerText =
            "€ " + Number(data.bitcoin).toLocaleString("de-DE");

        document.getElementById("ethereum").innerText =
            "$ " + Number(data.ethereum).toLocaleString("de-DE");

        document.getElementById("gold").innerText =
            "$ " + Number(data.gold).toLocaleString("de-DE");

        document.getElementById("silver").innerText =
            "$ " + Number(data.silver).toLocaleString("de-DE");

        // ===== AWA Empfehlung =====

        let empfehlung = "ABWARTEN";
        let modus = "AUSGEWOGENER MODUS";
        let text = "Die Marktbedingungen sind stabil. Ich sehe aktuell keinen klaren Vorteil für Kauf oder Verkauf.";
        let vertrauen = 60;

        if (data.signal === "BUY") {
            empfehlung = "KAUFEN";
            modus = "CHANCEN-MODUS";
            text = "AWA erkennt aktuell eine gute Einstiegschance.";
            vertrauen = 85;
        }

        if (data.signal === "SELL") {
            empfehlung = "VERKAUFEN";
            modus = "GEWINN SICHERN";
            text = "AWA empfiehlt momentan Teilgewinne mitzunehmen.";
            vertrauen = 82;
        }

        document.getElementById("recommendation").innerText = empfehlung;
        document.querySelector(".mode-pill").innerText = modus;
        document.getElementById("reason").innerText = text;

        document.getElementById("confidence").innerText =
            vertrauen + "%";

        document.querySelector(".trust-circle").style.background =
            `radial-gradient(circle at center,#07111f 0 55%,transparent 56%),
             conic-gradient(#d4af37 0 ${vertrauen}%,
             rgba(255,255,255,.12) ${vertrauen}% 100%)`;

        // Risiko

        let risiko = 45;

        if (vertrauen > 80) risiko = 65;

        document.getElementById("riskFill").style.width =
            risiko + "%";

        document.getElementById("riskText").innerText =
            risiko < 35 ? "NIEDRIG" :
            risiko < 70 ? "MITTEL" :
            "HOCH";

        document.getElementById("portfolioTotal").innerText =
            Number(data.binanceBalance).toLocaleString("de-DE", {
                minimumFractionDigits: 2
            }) + " €";

    }

    catch (e) {

        console.log(e);

    }

}

loadDashboard();

setInterval(loadDashboard,5000);
const navButtons = document.querySelectorAll(".nav button");

navButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (index === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (index === 1) {
      document
        .querySelector(".portfolio")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (index === 2) {
      document
        .querySelector(".markets")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (index === 3) {
      document
        .querySelector(".recommend")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (index === 4) {
      alert("Profil wird als Nächstes eingerichtet.");
    }
  });
});