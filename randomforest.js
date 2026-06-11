import { useState, useEffect } from "react";


// RANDOM FOREST CORE IMPLEMENTATION

function gini(labels) {
  if (!labels.length) return 0;
  const counts = {};
  labels.forEach(l => (counts[l] = (counts[l] || 0) + 1));
  let impurity = 1;
  Object.values(counts).forEach(c => {
    const p = c / labels.length;
    impurity -= p * p;
  });
  return impurity;
}

function bestSplit(data, features) {
  let bestGain = -Infinity, bestFeat = null, bestThresh = null;
  const parentLabels = data.map(d => d.label);
  const parentGini = gini(parentLabels);

  features.forEach(feat => {
    const vals = [...new Set(data.map(d => d[feat]))].sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const thresh = (vals[i] + vals[i + 1]) / 2;
      const left = data.filter(d => d[feat] <= thresh);
      const right = data.filter(d => d[feat] > thresh);
      if (!left.length || !right.length) continue;
      const gain =
        parentGini -
        (left.length / data.length) * gini(left.map(d => d.label)) -
        (right.length / data.length) * gini(right.map(d => d.label));
      if (gain > bestGain) {
        bestGain = gain;
        bestFeat = feat;
        bestThresh = thresh;
      }
    }
  });
  return { feat: bestFeat, thresh: bestThresh, gain: bestGain };
}

function buildTree(data, features, depth = 0, maxDepth = 4) {
  const labels = data.map(d => d.label);
  const counts = {};
  labels.forEach(l => (counts[l] = (counts[l] || 0) + 1));
  const majority = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  if (depth >= maxDepth || new Set(labels).size === 1 || data.length < 4) {
    return { leaf: true, prediction: majority, counts };
  }

  const { feat, thresh } = bestSplit(data, features);
  if (!feat) return { leaf: true, prediction: majority, counts };

  const left = data.filter(d => d[feat] <= thresh);
  const right = data.filter(d => d[feat] > thresh);

  const subFeats = features.length > 2
    ? features.filter(() => Math.random() > 0.3)
    : features;

  return {
    leaf: false,
    feat,
    thresh,
    left: buildTree(left, subFeats, depth + 1, maxDepth),
    right: buildTree(right, subFeats, depth + 1, maxDepth),
  };
}

function predictTree(tree, sample) {
  if (tree.leaf) return tree.prediction;
  return sample[tree.feat] <= tree.thresh
    ? predictTree(tree.left, sample)
    : predictTree(tree.right, sample);
}

function bootstrap(data) {
  return Array.from({ length: data.length }, () =>
    data[Math.floor(Math.random() * data.length)]
  );
}

function trainForest(data, features, nTrees = 30) {
  return Array.from({ length: nTrees }, () => {
    const sample = bootstrap(data);
    const featSubset = [...features].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(features.length * 0.7));
    return buildTree(sample, featSubset);
  });
}

function predictForest(forest, sample) {
  const votes = forest.map(tree => predictTree(tree, sample));
  const fraudVotes = votes.filter(v => v === "fraud").length;
  const pct = (fraudVotes / votes.length) * 100;
  return { prediction: fraudVotes > votes.length / 2 ? "fraud" : "legit", confidence: pct, fraudVotes, total: votes.length };
}


function generateTrainingData(n = 400) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const isFraud = Math.random() < 0.3;
    data.push({
      amount: isFraud ? 800 + Math.random() * 4200 : 10 + Math.random() * 490,
      hour: isFraud ? Math.floor(Math.random() * 5) : Math.floor(5 + Math.random() * 17),
      newDevice: isFraud ? (Math.random() < 0.8 ? 1 : 0) : (Math.random() < 0.15 ? 1 : 0),
      foreignCountry: isFraud ? (Math.random() < 0.7 ? 1 : 0) : (Math.random() < 0.05 ? 1 : 0),
      txPerHour: isFraud ? 5 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 4),
      avgDelta: isFraud ? 500 + Math.random() * 2000 : Math.random() * 200,
      label: isFraud ? "fraud" : "legit",
    });
  }
  return data;
}

const FEATURES = ["amount", "hour", "newDevice", "foreignCountry", "txPerHour", "avgDelta"];
const FEATURE_LABELS = {
  amount: "Transaction Amount ($)",
  hour: "Hour of Day (0â€“23)",
  newDevice: "New Device (0=No, 1=Yes)",
  foreignCountry: "Foreign Country (0=No, 1=Yes)",
  txPerHour: "Transactions per Hour",
  avgDelta: "Avg Amount Delta ($)",
};

const PRESETS = {
  suspicious: { amount: 3500, hour: 2, newDevice: 1, foreignCountry: 1, txPerHour: 12, avgDelta: 1800 },
  normal: { amount: 85, hour: 14, newDevice: 0, foreignCountry: 0, txPerHour: 1, avgDelta: 45 },
  borderline: { amount: 650, hour: 22, newDevice: 1, foreignCountry: 0, txPerHour: 4, avgDelta: 300 },
};

export default function FraudDetector() {
  const [forest, setForest] = useState(null);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(false);
  const [result, setResult] = useState(null);
  const [treeCount, setTreeCount] = useState(30);
  const [inputs, setInputs] = useState(PRESETS.normal);
  const [history, setHistory] = useState([]);
  const [activePreset, setActivePreset] = useState("normal");
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100);
  }, []);

  const handleTrain = () => {
    setTraining(true);
    setResult(null);
    setTimeout(() => {
      const data = generateTrainingData(500);
      const f = trainForest(data, FEATURES, treeCount);
      setForest(f);
      setTrained(true);
      setTraining(false);
    }, 600);
  };

  const handlePredict = () => {
    if (!forest) return;
    const r = predictForest(forest, inputs);
    setResult(r);
    setHistory(prev => [{ ...inputs, ...r, id: Date.now() }, ...prev].slice(0, 5));
  };

  const applyPreset = (key) => {
    setInputs(PRESETS[key]);
    setActivePreset(key);
    setResult(null);
  };

  const isFraud = result?.prediction === "fraud";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e4d9",
      fontFamily: "'Courier New', monospace",
      padding: "0",
      overflow: "hidden",
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(0,255,170,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 20px 60px",
        opacity: animIn ? 1 : 0,
        transform: animIn ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(.16,1,.3,1)",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 36, borderBottom: "1px solid rgba(0,255,170,0.2)", paddingBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#00ffaa", marginBottom: 8, textTransform: "uppercase" }}>
            ML Case Study â–¸ Random Forest
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 5vw, 42px)",
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
            margin: 0,
            color: "#fff",
            letterSpacing: -1,
          }}>
            Fraud Detection <span style={{ color: "#00ffaa" }}>Engine</span>
          </h1>
          <p style={{ color: "#888", marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
            A Random Forest classifier trained on 500 synthetic transactions Â·{" "}
            <span style={{ color: "#00ffaa" }}>{treeCount} decision trees</span> voting in ensemble
          </p>
        </div>

        {/* Step 1: Train */}
        <Section label="01" title="Train the Forest">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 11, color: "#888", letterSpacing: 2, display: "block", marginBottom: 6 }}>NUMBER OF TREES</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[10, 20, 30, 50].map(n => (
                  <button key={n} onClick={() => setTreeCount(n)} style={{
                    padding: "6px 14px",
                    background: treeCount === n ? "#00ffaa" : "transparent",
                    color: treeCount === n ? "#0a0a0f" : "#00ffaa",
                    border: "1px solid #00ffaa",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 700,
                    transition: "all 0.15s",
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <button onClick={handleTrain} disabled={training} style={{
              marginTop: 22,
              padding: "10px 28px",
              background: training ? "transparent" : "#00ffaa",
              color: training ? "#00ffaa" : "#0a0a0f",
              border: "1px solid #00ffaa",
              cursor: training ? "not-allowed" : "pointer",
              fontSize: 13,
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              letterSpacing: 2,
              transition: "all 0.2s",
            }}>
              {training ? "TRAINING..." : trained ? "â†º RETRAIN" : "â–¶ TRAIN MODEL"}
            </button>
            {trained && (
              <div style={{ marginTop: 22, fontSize: 12, color: "#00ffaa" }}>
                âœ“ Forest ready Â· {treeCount} trees grown
              </div>
            )}
          </div>
        </Section>

        {/* Step 2: Input */}
        <Section label="02" title="Transaction Features">
          <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(PRESETS).map(key => (
              <button key={key} onClick={() => applyPreset(key)} style={{
                padding: "5px 14px",
                background: activePreset === key ? (key === "suspicious" ? "#ff3b5c" : key === "borderline" ? "#ffaa00" : "#00ffaa") : "transparent",
                color: activePreset === key ? "#0a0a0f" : key === "suspicious" ? "#ff3b5c" : key === "borderline" ? "#ffaa00" : "#00ffaa",
                border: `1px solid ${key === "suspicious" ? "#ff3b5c" : key === "borderline" ? "#ffaa00" : "#00ffaa"}`,
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: 2,
                fontFamily: "'Courier New', monospace",
                fontWeight: 700,
                textTransform: "uppercase",
              }}>{key}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {FEATURES.map(feat => (
              <div key={feat}>
                <label style={{ fontSize: 10, color: "#666", letterSpacing: 2, display: "block", marginBottom: 4, textTransform: "uppercase" }}>
                  {FEATURE_LABELS[feat]}
                </label>
                <input
                  type="number"
                  value={inputs[feat]}
                  onChange={e => { setInputs(p => ({ ...p, [feat]: parseFloat(e.target.value) || 0 })); setActivePreset(null); setResult(null); }}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e8e4d9",
                    padding: "8px 10px",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <button onClick={handlePredict} disabled={!trained} style={{
            marginTop: 20,
            padding: "12px 32px",
            background: trained ? "transparent" : "rgba(255,255,255,0.05)",
            color: trained ? "#fff" : "#444",
            border: trained ? "1px solid rgba(255,255,255,0.3)" : "1px solid #222",
            cursor: trained ? "pointer" : "not-allowed",
            fontSize: 13,
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
            letterSpacing: 3,
            transition: "all 0.2s",
          }}>
            {trained ? "âš¡ RUN PREDICTION" : "TRAIN MODEL FIRST"}
          </button>
        </Section>

        {/* Step 3: Result */}
        {result && (
          <Section label="03" title="Forest Verdict">
            <div style={{
              border: `1px solid ${isFraud ? "#ff3b5c" : "#00ffaa"}`,
              padding: "24px 28px",
              position: "relative",
              background: isFraud ? "rgba(255,59,92,0.06)" : "rgba(0,255,170,0.05)",
              animation: "fadeSlide 0.4s cubic-bezier(.16,1,.3,1)",
            }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: isFraud ? "#ff3b5c" : "#00ffaa", marginBottom: 8 }}>
                {isFraud ? "âš FRAUD DETECTED" : "âœ“ TRANSACTION CLEARED"}
              </div>
              <div style={{ fontSize: "clamp(28px,6vw,52px)", fontWeight: 700, color: isFraud ? "#ff3b5c" : "#00ffaa", marginBottom: 16, letterSpacing: -1 }}>
                {isFraud ? "FRAUDULENT" : "LEGITIMATE"}
              </div>

              {/* Vote bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, marginBottom: 8 }}>TREE VOTES</div>
                <div style={{ display: "flex", height: 20, borderRadius: 2, overflow: "hidden", background: "#111" }}>
                  <div style={{
                    width: `${result.confidence}%`,
                    background: "#ff3b5c",
                    transition: "width 0.8s cubic-bezier(.16,1,.3,1)",
                  }} />
                  <div style={{
                    width: `${100 - result.confidence}%`,
                    background: "#00ffaa",
                    transition: "width 0.8s cubic-bezier(.16,1,.3,1)",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
                  <span style={{ color: "#ff3b5c" }}>ðŸ”´ Fraud: {result.fraudVotes} trees ({result.confidence.toFixed(0)}%)</span>
                  <span style={{ color: "#00ffaa" }}>ðŸŸ¢ Legit: {result.total - result.fraudVotes} trees ({(100 - result.confidence).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Feature summary */}
              <div style={{ fontSize: 11, color: "#555", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <span style={{ color: "#444", letterSpacing: 2 }}>INPUTS â–¸ </span>
                {FEATURES.map(f => (
                  <span key={f} style={{ marginRight: 12 }}>
                    <span style={{ color: "#555" }}>{f}=</span>
                    <span style={{ color: "#888" }}>{inputs[f]}</span>
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* History */}
        {history.length > 1 && (
          <Section label="04" title="Prediction History">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((h, i) => (
                <div key={h.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 12,
                  opacity: 1 - i * 0.12,
                }}>
                  <span style={{ color: h.prediction === "fraud" ? "#ff3b5c" : "#00ffaa", fontWeight: 700, letterSpacing: 2 }}>
                    {h.prediction === "fraud" ? "âš FRAUD" : "âœ“ LEGIT"}
                  </span>
                  <span style={{ color: "#555" }}>
                    ${h.amount} Â· hr={h.hour} Â· txPH={h.txPerHour}
                  </span>
                  <span style={{ color: "#444" }}>
                    {h.confidence.toFixed(0)}% fraud confidence
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* How it works */}
        <Section label="05" title="How This Works">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1, background: "rgba(255,255,255,0.05)" }}>
            {[
              ["Bootstrap Sampling", "Each tree trains on a random 500-row sample (with replacement) from the dataset"],
              ["Feature Subsampling", "Each tree sees only 70% of features randomly â€” prevents correlation"],
              ["Gini Impurity", "Each split minimizes impurity â€” cleaner separation of fraud vs legit"],
              ["Majority Vote", "All trees vote; fraud wins if >50% say fraud"],
              ["Ensemble Power", "30 weak trees become one strong classifier"],
              ["Training Data", "500 synthetic transactions, 30% fraud rate, 6 features"],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: "16px", background: "#0a0a0f" }}>
                <div style={{ fontSize: 11, color: "#00ffaa", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        button:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function Section({ label, title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: "#333", fontWeight: 700, letterSpacing: 3 }}>{label}</span>
        <span style={{ fontSize: 13, color: "#666", letterSpacing: 3, textTransform: "uppercase" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>
      {children}
    </div>
  );
}
