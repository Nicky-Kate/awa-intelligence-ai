const fs = require("fs");
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "..", "data", "learning-memory.json");

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return [];
  }

  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

function rememberDecision(decision) {
  const memory = loadMemory();

  const entry = {
    id: memory.length + 1,
    time: new Date().toISOString(),
    globalSignal: decision.globalSignal,
    recommendation: decision.recommendation,
    mode: decision.mode,
    confidence: decision.confidence,
    reason: decision.reason,
    bestOpportunity: decision.bestOpportunity,
    assets: decision.assets,
    result: "OPEN"
  };

  memory.push(entry);
  saveMemory(memory);

  return entry;
}

function getMemory() {
  return loadMemory();
}

module.exports = {
  rememberDecision,
  getMemory
};