import React, { useState, useRef, useEffect } from "react";




// ─── Google Fonts ───
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&family=IBM+Plex+Mono:wght@400;500;700;800&display=swap"
    rel="stylesheet"
  />
);
 
// ─── CRYPTO UTILITIES ───
function modpow(base, exp, mod) {
  base = BigInt(base); exp = BigInt(exp); mod = BigInt(mod);
  if (mod === 1n) return 0n;
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp >> 1n;
    base = (base * base) % mod;
  }
  return result;
}
function gcd(a, b) {
  a = BigInt(a); b = BigInt(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
function modInverse(e, phi) {
  let [old_r, r] = [BigInt(e), BigInt(phi)];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_s < 0n) old_s += BigInt(phi);
  return old_s;
}
function isPrime(n) {
  n = parseInt(n);
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getTS() { return new Date().toTimeString().split(" ")[0]; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
 
// ─── STYLES ───
const styles = `
  :root {
    --bg: #030a0e;
    --surface: #071218;
    --surface2: #0a1a24;
    --border: #0d3a4f;
    --accent: #00f5ff;
    --accent2: #00ff9d;
    --accent3: #ff6b35;
    --warn: #ffb800;
    --text: #b8e8f0;
    --text-dim: #4a7a8a;
    --text-bright: #e8f8ff;
    --success: #00ff9d;
    --danger: #ff3355;
    --font-mono: 'Share Tech Mono', monospace;
    --font-ui: 'Rajdhani', sans-serif;
    --font-head: 'Orbitron', monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-ui);
    min-height: 100vh;
    overflow-x: hidden;
  }
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
    animation: gridPulse 8s ease-in-out infinite;
  }
  @keyframes gridPulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
  .app { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 20px 60px; }
  /* Header */
  header { text-align: center; padding: 36px 0 24px; }
  .logo-badge {
    display: inline-block;
    background: rgba(0,255,157,0.08); border: 1px solid rgba(0,255,157,0.3);
    border-radius: 4px; padding: 3px 16px;
    font-family: var(--font-mono); font-size: 10px; color: var(--accent2);
    letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px;
  }
  h1.app-title {
    font-family: var(--font-head); font-size: clamp(24px, 5vw, 48px);
    font-weight: 900; letter-spacing: 4px; color: var(--text-bright);
    text-shadow: 0 0 40px rgba(0,245,255,0.3); line-height: 1.1;
  }
  h1.app-title span { color: var(--accent); }
  .header-sub { margin-top: 10px; font-size: 13px; color: var(--text-dim); letter-spacing: 2px; }
  /* Tabs */
  .tabs {
    display: flex; gap: 2px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 6px; padding: 4px; margin-bottom: 24px;
  }
  .tab-btn {
    flex: 1; padding: 11px 10px;
    background: transparent; border: none;
    color: var(--text-dim); font-family: var(--font-ui);
    font-size: 12px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; cursor: pointer; border-radius: 4px; transition: all .25s;
  }
  .tab-btn.active { background: rgba(0,245,255,0.1); color: var(--accent); }
  /* Card */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 20px; margin-bottom: 18px;
    position: relative; overflow: hidden; transition: border-color .3s;
  }
  .card:hover { border-color: rgba(0,245,255,0.3); }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .card:hover::before { opacity: .4; }
  .card-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .card-icon {
    width: 34px; height: 34px; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3);
  }
  .card-icon.g { background: rgba(0,255,157,0.1); border-color: rgba(0,255,157,0.3); }
  .card-icon.o { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.3); }
  .card-title { font-family: var(--font-head); font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--text-bright); }
  .card-sub { font-size: 11px; color: var(--text-dim); margin-top: 2px; letter-spacing: 1px; }
  .section-title {
    font-family: var(--font-head); font-size: 10px; letter-spacing: 3px;
    color: var(--text-dim); text-transform: uppercase;
    margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  }
  /* Grid */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 650px) { .g2 { grid-template-columns: 1fr; } }
  /* Fields */
  .field { margin-bottom: 12px; }
  label.lbl {
    display: block; font-size: 10px; font-weight: 600; letter-spacing: 2px;
    color: var(--text-dim); text-transform: uppercase; margin-bottom: 5px;
    font-family: var(--font-ui);
  }
  input[type="number"], input[type="text"], input[type="password"], textarea, select {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px; color: var(--text-bright); font-family: var(--font-mono);
    font-size: 12px; padding: 8px 12px; outline: none; transition: border-color .25s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); }
  textarea { resize: vertical; min-height: 72px; }
  /* Value boxes */
  .val {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
    padding: 9px 12px; font-family: var(--font-mono); font-size: 12px;
    color: var(--accent); word-break: break-all; min-height: 36px;
  }
  .val.green { color: var(--accent2); }
  .val.orange { color: var(--accent3); }
  .val.dim { color: var(--text-dim); font-size: 11px; }
  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 4px;
    font-family: var(--font-ui); font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--accent);
    background: rgba(0,245,255,0.1); color: var(--accent); transition: all .2s;
  }
  .btn:hover { background: rgba(0,245,255,0.2); }
  .btn.g { border-color: var(--accent2); background: rgba(0,255,157,0.1); color: var(--accent2); }
  .btn.g:hover { background: rgba(0,255,157,0.2); }
  .btn.full { width: 100%; justify-content: center; margin-top: 10px; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
  }
  .badge.success { background: rgba(0,255,157,0.1); border: 1px solid rgba(0,255,157,0.3); color: var(--success); }
  .badge.info { background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); color: var(--accent); }
  .badge.warn { background: rgba(255,184,0,0.1); border: 1px solid rgba(255,184,0,0.3); color: var(--warn); }
  /* Callout */
  .callout {
    background: rgba(0,245,255,0.04); border: 1px solid rgba(0,245,255,0.15);
    border-left: 3px solid var(--accent); border-radius: 0 4px 4px 0;
    padding: 10px 14px; margin: 10px 0; font-size: 12px; color: var(--text); line-height: 1.6;
  }
  /* Formula */
  .formula {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent2);
    background: rgba(0,255,157,0.05); border: 1px solid rgba(0,255,157,0.15);
    border-radius: 4px; padding: 7px 12px; margin: 6px 0; letter-spacing: 1px;
  }
  /* Divider */
  .divider { height: 1px; background: rgba(13,58,79,0.6); margin: 14px 0; }
  /* Steps */
  .steps { display: flex; align-items: center; margin-bottom: 18px; overflow-x: auto; padding-bottom: 4px; }
  .step { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 56px; }
  .step-n {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); background: var(--surface);
    transition: all .3s;
  }
  .step-n.done { border-color: var(--success); color: var(--success); background: rgba(0,255,157,0.05); }
  .step-n.active { border-color: var(--accent); color: var(--accent); background: rgba(0,245,255,0.05); animation: stepPulse 1.5s ease-in-out infinite; }
  @keyframes stepPulse { 0%,100% { box-shadow: 0 0 8px rgba(0,245,255,.4); } 50% { box-shadow: 0 0 20px rgba(0,245,255,.7); } }
  .step-lbl { font-size: 9px; letter-spacing: 1px; color: var(--text-dim); text-align: center; text-transform: uppercase; white-space: nowrap; }
  .conn { flex: 1; height: 2px; background: var(--border); min-width: 10px; margin-bottom: 18px; transition: background .3s; }
  .conn.done { background: var(--success); }
  /* Log */
  .log {
    background: #020c10; border: 1px solid var(--border); border-radius: 6px;
    padding: 12px 14px; font-family: var(--font-mono); font-size: 11px;
    max-height: 180px; overflow-y: auto;
  }
  .log-line { display: flex; gap: 8px; margin-bottom: 3px; }
  .log-time { color: var(--text-dim); min-width: 64px; }
  .log-tag { min-width: 54px; font-weight: bold; }
  .log-tag.info { color: var(--accent); }
  .log-tag.success { color: var(--success); }
  .log-tag.error { color: var(--danger); }
  .log-msg { color: var(--text); flex: 1; word-break: break-all; }
  /* How-it-works */
  .how { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
  .how-n {
    width: 36px; height: 36px; border-radius: 5px; flex-shrink: 0;
    background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-head); font-size: 14px; color: var(--accent);
  }
  .how-h { font-size: 13px; font-weight: 700; color: var(--text-bright); margin-bottom: 4px; letter-spacing: 1px; }
  .how-p { font-size: 12px; color: var(--text); line-height: 1.6; }
  /* Bank schema */
  .bk-wrap {
    background: linear-gradient(135deg,#f0f4f0 0%,#e8f0f8 60%,#f4eef8 100%);
    border-radius: 8px; padding: 20px 16px 28px; font-family: 'IBM Plex Mono', monospace;
  }
  .bk-legend { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .bk-legend-item {
    display: flex; align-items: center; gap: 6px;
    border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 600;
  }
  .bk-table { background: #fff; border-radius: 10px; overflow: hidden; min-width: 260px; border: 2px solid rgba(0,0,0,0.08); }
  .bk-table-top { padding: 9px 15px; }
  .bk-table-name { padding: 8px 15px; border-bottom: 2px solid rgba(0,0,0,0.08); }
  .bk-col-row {
    display: flex; align-items: center; padding: 7px 15px;
    gap: 8px; flex-wrap: wrap; font-size: 12px; border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .bk-col-row:last-child { border-bottom: none; }
  .bk-col-name { font-weight: 600; min-width: 100px; font-size: 13px; }
  .bk-col-type { color: #888; font-style: italic; flex: 1; font-size: 11px; }
  .bk-chip { font-size: 10px; padding: 1px 7px; border-radius: 10px; font-weight: 700; white-space: nowrap; }
  .bk-group-lbl {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #888;
    text-transform: uppercase; margin-bottom: 10px;
    padding-left: 10px; border-left: 3px solid #1a6b3c;
  }
  .bk-map-note { display: flex; gap: 10px; margin-bottom: 7px; font-size: 11px; line-height: 1.5; flex-wrap: wrap; }
  .bk-map-rule { background: #f3f3f3; border-radius: 5px; padding: 2px 9px; color: #555; font-style: italic; white-space: nowrap; }
  /* Login */
  .login-wrap { max-width: 480px; margin: 0 auto; }
  .trans-vis {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; padding: 18px; position: relative; overflow: hidden; margin: 14px 0;
  }
  .trans-row { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
  .trans-node {
    padding: 7px 14px; border-radius: 4px;
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px;
    text-align: center; min-width: 76px;
  }
  .trans-node.client { background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.4); color: var(--accent); }
  .trans-node.server { background: rgba(0,255,157,0.1); border: 1px solid rgba(0,255,157,0.4); color: var(--accent2); }
  .trans-node.attacker { background: rgba(255,51,85,0.1); border: 1px solid rgba(255,51,85,0.3); color: var(--danger); opacity: .7; }
  .trans-arrow { flex: 1; display: flex; align-items: center; gap: 4px; position: relative; }
  .trans-line { flex: 1; height: 2px; background: var(--border); position: relative; overflow: hidden; }
  .trans-line.active::after {
    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: dataFlow 1s linear infinite;
  }
  .trans-line.secure::after { background: linear-gradient(90deg, transparent, var(--success), transparent); }
  @keyframes dataFlow { to { left: 200%; } }
  .trans-lbl { font-size: 10px; color: var(--text-dim); letter-spacing: 1px; white-space: nowrap; }
`;
 
// ─── DIFFIE-HELLMAN TAB ───
function DHTab() {
  const [p, setP] = useState(23);
  const [g, setG] = useState(5);
  const [vals, setVals] = useState({ a: null, b: null, A: null, B: null, shared: null });
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState([{ t: getTS(), type: "info", msg: "CryptoVault initialized. Awaiting key exchange..." }]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [lines, setLines] = useState({ l1: false, l2: false, l1s: false, l2s: false });
  const logRef = useRef(null);
 
  function addLog(type, msg) { setLogs((l) => [...l, { t: getTS(), type, msg }]); }
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);
 
  async function run() {
    if (!isPrime(p)) { addLog("error", `p=${p} is NOT prime.`); return; }
    setRunning(true); setDone(false); setVals({ a: null, b: null, A: null, B: null, shared: null });
    addLog("info", `Protocol initiated. p=${p}, g=${g}`); setStep(1);
    await sleep(350); setStep(2);
    const a = randInt(2, p - 2), b = randInt(2, p - 2);
    setVals((v) => ({ ...v, a, b }));
    addLog("info", `Client private a=${a}, Server private b=${b} (kept secret)`);
    await sleep(450); setStep(3);
    const A = Number(modpow(g, a, p)), B = Number(modpow(g, b, p));
    setVals((v) => ({ ...v, A, B }));
    addLog("info", `A = g^a mod p = ${A}   |   B = g^b mod p = ${B}`);
    await sleep(450); setStep(4);
    setLines({ l1: true, l2: true, l1s: false, l2s: false });
    addLog("info", `Transmitting (p, g, A) → Server. Receiving B ← Server...`);
    await sleep(700); setStep(5);
    const secret = Number(modpow(B, a, p));
    setVals((v) => ({ ...v, shared: secret }));
    setLines({ l1: false, l2: false, l1s: true, l2s: true });
    addLog("success", `Client: B^a mod p = ${secret}`);
    addLog("success", `Server: A^b mod p = ${Number(modpow(A, b, p))}`);
    addLog("success", `✓ SHARED SECRET ESTABLISHED: ${secret}`);
    setDone(true); setRunning(false);
  }
 
  const stepLabels = ["Agree Params", "Gen Privates", "Compute Publics", "Exchange", "Shared Secret"];
 
  return (
    <>
      <div className="steps">
        {stepLabels.map((lbl, i) => (
          <>
            {i > 0 && <div className={`conn${step > i ? " done" : ""}`} />}
            <div className="step" key={i}>
              <div className={`step-n${step > i + 1 ? " done" : step === i + 1 ? " active" : ""}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <div className="step-lbl">{lbl}</div>
            </div>
          </>
        ))}
      </div>
 
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><div className="card-icon">⚙</div><div><div className="card-title">PUBLIC PARAMETERS</div><div className="card-sub">Agreed upon openly — safe to share</div></div></div>
          <div className="field"><label className="lbl">Prime modulus (p)</label><input type="number" value={p} min={5} max={9999} onChange={(e) => setP(parseInt(e.target.value) || 23)} /></div>
          <div className="field"><label className="lbl">Generator (g)</label><input type="number" value={g} min={2} max={99} onChange={(e) => setG(parseInt(e.target.value) || 5)} /></div>
          <div className="callout">Even with p and g known publicly, an attacker cannot compute the shared secret without solving the Discrete Logarithm Problem.</div>
          <div className="formula">Shared Key = g^(a·b) mod p</div>
          <button className="btn full" onClick={run} disabled={running}>{running ? "RUNNING…" : "⟳ EXECUTE KEY EXCHANGE"}</button>
        </div>
 
        <div className="card">
          <div className="card-hdr"><div className="card-icon g">🔑</div><div><div className="card-title">KEY EXCHANGE</div><div className="card-sub">Client ↔ Server negotiation</div></div></div>
          <div className="g2" style={{ gap: 10 }}>
            {[["a", "CLIENT private (a)"], ["b", "SERVER private (b)"], ["A", "CLIENT public (A = g^a mod p)"], ["B", "SERVER public (B = g^b mod p)"]].map(([k, lbl]) => (
              <div key={k}>
                <label className="lbl">{lbl}</label>
                <div className={`val${vals[k] === null ? " dim" : ""}`}>{vals[k] === null ? "— awaiting —" : String(vals[k])}</div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <label className="lbl">SHARED SECRET KEY ✦</label>
          <div className="val green" style={{ fontSize: 18, textAlign: "center", padding: 12 }}>{vals.shared === null ? "— not yet established —" : String(vals.shared)}</div>
          {done && <div style={{ marginTop: 10, textAlign: "center" }}><span className="badge success">✓ BOTH SIDES AGREE</span></div>}
        </div>
      </div>
 
      <div className="card">
        <div className="card-hdr"><div className="card-icon o">📡</div><div><div className="card-title">NETWORK TRANSMISSION MAP</div><div className="card-sub">What an attacker sees on the wire</div></div></div>
        <div className="trans-vis">
          <div className="trans-row">
            <div className="trans-node client">CLIENT</div>
            <div className="trans-arrow">
              <div className={`trans-line${lines.l1 ? " active" : ""}${lines.l1s ? " secure" : ""}`} />
              <span className="trans-lbl">p, g, A →</span>
            </div>
            <div className="trans-node server">SERVER</div>
          </div>
          <div className="trans-row">
            <div className="trans-node client">CLIENT</div>
            <div className="trans-arrow">
              <span className="trans-lbl">← B</span>
              <div className={`trans-line${lines.l2 ? " active" : ""}${lines.l2s ? " secure" : ""}`} />
            </div>
            <div className="trans-node server">SERVER</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="trans-node attacker">ATTACKER</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Can intercept: <span style={{ color: "var(--warn)" }}>p, g, A, B</span> — Cannot compute: <span style={{ color: "var(--success)" }}>shared secret (DLP is hard)</span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="log" ref={logRef}>
        {logs.map((l, i) => (
          <div key={i} className="log-line">
            <span className="log-time">{l.t}</span>
            <span className={`log-tag ${l.type}`}>[{l.type.toUpperCase()}]</span>
            <span className="log-msg">{l.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
 
// ─── RSA TAB ───
function RSATab() {
  const [rp, setRp] = useState(61);
  const [rq, setRq] = useState(53);
  const [keys, setKeys] = useState(null);
  const [msg, setMsg] = useState(42);
  const [cipher, setCipher] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [textIn, setTextIn] = useState("Hello, CryptoVault!");
  const [textCipher, setTextCipher] = useState("");
  const [textOut, setTextOut] = useState("");
 
  function genKeys() {
    if (!isPrime(rp) || !isPrime(rq)) { alert("Both p and q must be prime!"); return; }
    if (rp === rq) { alert("p and q must differ!"); return; }
    const n = rp * rq, phi = (rp - 1) * (rq - 1);
    let e = 3; while (gcd(e, phi) !== 1n) e += 2;
    const d = Number(modInverse(e, phi));
    setKeys({ n, phi, e, d }); setCipher(null); setDecrypted(null);
  }
  function encrypt() {
    if (!keys) { alert("Generate keys first!"); return; }
    if (msg >= keys.n) { alert(`Message must be < n (${keys.n})`); return; }
    setCipher(Number(modpow(msg, keys.e, keys.n))); setDecrypted(null);
  }
  function decrypt() {
    if (!keys || cipher === null) { alert("Encrypt first!"); return; }
    setDecrypted(Number(modpow(cipher, keys.d, keys.n)));
  }
  function encryptText() {
    if (!keys) { alert("Generate keys first!"); return; }
    const ciphers = textIn.split("").map((ch) => { const c = ch.charCodeAt(0); if (c >= keys.n) return c; return Number(modpow(c, keys.e, keys.n)); });
    setTextCipher(ciphers.join(" ")); setTextOut("");
  }
  function decryptText() {
    if (!keys || !textCipher) { alert("Encrypt text first!"); return; }
    const res = textCipher.split(" ").map(Number).map((c) => String.fromCharCode(Number(modpow(c, keys.d, keys.n)))).join("");
    setTextOut(res);
  }
 
  return (
    <>
      <div className="g2">
        <div className="card">
          <div className="card-hdr"><div className="card-icon">⚡</div><div><div className="card-title">KEY GENERATION</div><div className="card-sub">Server generates key pair</div></div></div>
          <div className="g2" style={{ gap: 10 }}>
            <div className="field"><label className="lbl">Prime p</label><input type="number" value={rp} min={5} onChange={(e) => setRp(parseInt(e.target.value) || 61)} /></div>
            <div className="field"><label className="lbl">Prime q</label><input type="number" value={rq} min={5} onChange={(e) => setRq(parseInt(e.target.value) || 53)} /></div>
          </div>
          {[["n = p × q", keys ? String(keys.n) : null, ""], ["φ(n) = (p−1)(q−1)", keys ? String(keys.phi) : null, ""], ["Public exponent e", keys ? String(keys.e) : null, ""], ["Private exponent d", keys ? String(keys.d) : null, " orange"]].map(([lbl, val, cls]) => (
            <div key={lbl} className="field">
              <label className="lbl">{lbl}</label>
              <div className={`val${cls}${!val ? " dim" : ""}`}>{val || "—"}</div>
            </div>
          ))}
          {keys && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              <span className="badge success">PUB: (e={keys.e}, n={keys.n})</span>
              <span className="badge warn">PRIV: d={keys.d}</span>
            </div>
          )}
          <button className="btn full" onClick={genKeys}>⚡ GENERATE RSA KEYS</button>
        </div>
 
        <div className="card">
          <div className="card-hdr"><div className="card-icon g">🔒</div><div><div className="card-title">ENCRYPT / DECRYPT</div><div className="card-sub">Asymmetric message protection</div></div></div>
          <div className="field"><label className="lbl">Plaintext (numeric)</label><input type="number" value={msg} min={1} onChange={(e) => setMsg(parseInt(e.target.value) || 42)} /></div>
          <div className="callout" style={{ fontSize: 11 }}>Message must be less than n. For text, each character is encoded as ASCII.</div>
          <div className="field"><label className="lbl">🔒 Ciphertext (M^e mod n)</label><div className={`val${cipher === null ? " dim" : ""}`}>{cipher === null ? "— encrypt first —" : String(cipher)}</div></div>
          <div className="field"><label className="lbl">🔓 Decrypted (C^d mod n)</label><div className={`val green${decrypted === null ? " dim" : ""}`}>{decrypted === null ? "— decrypt first —" : String(decrypted)}</div></div>
          {decrypted !== null && decrypted === msg && <div style={{ marginBottom: 8 }}><span className="badge success">✓ DECRYPTION VERIFIED</span></div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={encrypt}>🔒 Encrypt</button>
            <button className="btn g" onClick={decrypt}>🔓 Decrypt</button>
          </div>
        </div>
      </div>
 
      <div className="card">
        <div className="card-hdr"><div className="card-icon o">📝</div><div><div className="card-title">TEXT ENCRYPTION</div><div className="card-sub">RSA per character</div></div></div>
        <div className="g2" style={{ gap: 16 }}>
          <div>
            <div className="field"><label className="lbl">Plaintext input</label><textarea value={textIn} onChange={(e) => setTextIn(e.target.value)} /></div>
            <button className="btn" style={{ fontSize: 11 }} onClick={encryptText}>🔒 Encrypt Text</button>
          </div>
          <div>
            <div className="field"><label className="lbl">Encrypted output</label><textarea readOnly value={textCipher} style={{ color: "var(--accent)" }} /></div>
            <button className="btn g" style={{ fontSize: 11 }} onClick={decryptText}>🔓 Decrypt Text</button>
          </div>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label className="lbl">Decrypted output</label>
          <div className={`val green${!textOut ? " dim" : ""}`}>{textOut || "—"}</div>
        </div>
      </div>
 
      <div className="card">
        <div className="section-title">RSA MATHEMATICAL FOUNDATION</div>
        <div className="g2" style={{ gap: 16 }}>
          <div>{["n = p × q", "φ(n) = (p−1)(q−1)", "1 < e < φ(n), gcd(e,φ(n))=1", "d ≡ e⁻¹ (mod φ(n))"].map((f) => <div key={f} className="formula">{f}</div>)}</div>
          <div>
            {["Encrypt: C = M^e mod n", "Decrypt: M = C^d mod n"].map((f) => <div key={f} className="formula">{f}</div>)}
            <div className="callout" style={{ marginTop: 8, fontSize: 11 }}>Security relies on the difficulty of factoring large n back into p and q — infeasible for 2048+ bit keys.</div>
          </div>
        </div>
      </div>
    </>
  );
}
 
// ─── SECURE LOGIN TAB ───
function LoginTab() {
  const [user, setUser] = useState("alice@cryptovault");
  const [pass, setPass] = useState("S3cur3P@ss!");
  const [sessionReady, setSessionReady] = useState(false);
  const [loginRSA, setLoginRSA] = useState({});
  const [logs, setLogs] = useState([{ t: getTS(), type: "info", msg: "Ready. Initialize a secure session to begin." }]);
  const [dhKey, setDhKey] = useState(null);
  const [rsaPub, setRsaPub] = useState(null);
  const [success, setSuccess] = useState(false);
  const [lines, setLines] = useState({ l1: false, l2: false, l3: false, l3s: false });
  const logRef = useRef(null);
 
  function addLog(type, msg) { setLogs((l) => [...l, { t: getTS(), type, msg }]); }
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);
 
  async function initSession() {
    setSuccess(false);
    addLog("info", "Initiating Diffie–Hellman key exchange with server...");
    await sleep(400);
    const p = 23, g = 5, a = randInt(2, 20), b = randInt(2, 20);
    const A = modpow(g, a, p), B = modpow(g, b, p);
    const shared = Number(modpow(B, a, p));
    setLines({ l1: true, l2: false, l3: false, l3s: false });
    addLog("info", `Sending p=${p}, g=${g}, A=${Number(A)} → Server`);
    await sleep(600);
    setLines({ l1: false, l2: true, l3: false, l3s: false });
    addLog("info", `Server responds with B=${Number(B)} and RSA public key`);
    await sleep(600);
    setLines({ l1: false, l2: false, l3: false, l3s: false });
    const rp = 61, rq = 53, n = rp * rq, phi = (rp - 1) * (rq - 1);
    let e = 17; while (Number(gcd(e, phi)) !== 1) e += 2;
    const d = Number(modInverse(e, phi));
    setLoginRSA({ n, e, d });
    setDhKey(shared);
    setRsaPub(`(e=${e}, n=${n})`);
    addLog("success", `DH shared session key = ${shared}`);
    addLog("success", `RSA keys ready. Public: (e=${e}, n=${n})`);
    addLog("success", "Secure session established.");
    setSessionReady(true);
  }
 
  async function doLogin() {
    if (!sessionReady) { alert("Initialize a secure session first!"); return; }
    addLog("info", `Encrypting credentials with RSA...`);
    await sleep(300);
    const encPass = pass.split("").map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= loginRSA.n) return c;
      return Number(modpow(c, loginRSA.e, loginRSA.n));
    });
    setLines((l) => ({ ...l, l3: true }));
    addLog("info", `Transmitting: user="${user}", enc_pass=[${encPass.slice(0, 4).join(",")}...]`);
    await sleep(800);
    setLines({ l1: false, l2: false, l3: false, l3s: true });
    addLog("success", `Server decrypted using private key d=${loginRSA.d}`);
    addLog("success", `Authentication successful for: ${user}`);
    addLog("success", "✓ SESSION TOKEN ISSUED — Access granted");
    setSuccess(true);
  }
 
  return (
    <div className="login-wrap">
      <div className="card">
        <div className="card-hdr"><div className="card-icon">🛡</div><div><div className="card-title">SECURE AUTHENTICATION</div><div className="card-sub">RSA + DH combined protocol</div></div></div>
        <div className="callout"><strong>(1)</strong> Diffie–Hellman establishes a shared session key. <strong>(2)</strong> RSA encrypts credentials before transmission. Passwords never travel in plaintext.</div>
        <div style={{ margin: "14px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn" style={{ fontSize: 11 }} onClick={initSession}>🔄 INITIALIZE SESSION</button>
          {sessionReady && <span className="badge success">✓ SESSION ESTABLISHED</span>}
        </div>
        {sessionReady && (
          <div className="g2" style={{ gap: 10, marginBottom: 14 }}>
            <div><label className="lbl">DH Shared Key</label><div className="val green">{dhKey}</div></div>
            <div><label className="lbl">RSA Public Key</label><div className="val">{rsaPub}</div></div>
          </div>
        )}
        <div className="divider" />
        <div className="field"><label className="lbl">Username</label><input type="text" value={user} onChange={(e) => setUser(e.target.value)} /></div>
        <div className="field"><label className="lbl">Password</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
        <button className="btn full" onClick={doLogin}>🔐 ENCRYPT &amp; TRANSMIT CREDENTIALS</button>
      </div>
 
      <div className="card">
        <div className="section-title">📡 TRANSMISSION LOG</div>
        <div className="trans-vis">
          <div className="trans-row">
            <div className="trans-node client" style={{ fontSize: 10 }}>CLIENT<br /><small>🌐 Browser</small></div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {[["① DH params →", "l1"], ["← ② RSA pubkey + DH B", "l2"], ["③ encrypted creds →", "l3"]].map(([lbl, key]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className={`trans-line${lines[key] ? " active" : ""}${key === "l3" && lines.l3s ? " secure" : ""}`} />
                  <span className="trans-lbl">{lbl}</span>
                </div>
              ))}
            </div>
            <div className="trans-node server" style={{ fontSize: 10 }}>SERVER<br /><small>🗄 Auth</small></div>
          </div>
        </div>
        <div className="log" ref={logRef}>
          {logs.map((l, i) => (
            <div key={i} className="log-line">
              <span className="log-time">{l.t}</span>
              <span className={`log-tag ${l.type}`}>[{l.type.toUpperCase()}]</span>
              <span className="log-msg">{l.msg}</span>
            </div>
          ))}
        </div>
        {success && (
          <div style={{ marginTop: 14, textAlign: "center", padding: "18px 20px", background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.2)", borderRadius: 6 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 14, color: "var(--success)", letterSpacing: 3 }}>ACCESS GRANTED</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>Credentials verified. Session established securely.</div>
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── BANK SCHEMA TAB ───
const bankTables = [
  { name: "Bank", color: "#1a6b3c", accent: "#d4edda", columns: [{ name: "Code", type: "VARCHAR(10)", constraints: ["PK"] }, { name: "Name", type: "VARCHAR(100)", constraints: ["NOT NULL"] }, { name: "Address", type: "VARCHAR(255)", constraints: [] }] },
  { name: "Branch", color: "#1a6b3c", accent: "#d4edda", columns: [{ name: "Branch_id", type: "VARCHAR(15)", constraints: ["PK"] }, { name: "Name", type: "VARCHAR(100)", constraints: ["NOT NULL"] }, { name: "Address", type: "VARCHAR(255)", constraints: [] }, { name: "Bank_Code", type: "VARCHAR(10)", constraints: ["FK → Bank"] }] },
  { name: "Loan", color: "#14547a", accent: "#d0eaf8", columns: [{ name: "Loan_id", type: "VARCHAR(15)", constraints: ["PK"] }, { name: "Loan_type", type: "VARCHAR(50)", constraints: ["NOT NULL"] }, { name: "Amount", type: "DECIMAL(15,2)", constraints: ["NOT NULL"] }, { name: "Branch_id", type: "VARCHAR(15)", constraints: ["FK → Branch"] }] },
  { name: "Account", color: "#14547a", accent: "#d0eaf8", columns: [{ name: "Account_No", type: "VARCHAR(20)", constraints: ["PK"] }, { name: "Acc_Type", type: "VARCHAR(50)", constraints: ["NOT NULL"] }, { name: "Balance", type: "DECIMAL(15,2)", constraints: ["NOT NULL"] }, { name: "Branch_id", type: "VARCHAR(15)", constraints: ["FK → Branch"] }] },
  { name: "Customer", color: "#7a3014", accent: "#fde8d8", columns: [{ name: "Custid", type: "VARCHAR(15)", constraints: ["PK"] }, { name: "Name", type: "VARCHAR(100)", constraints: ["NOT NULL"] }, { name: "Address", type: "VARCHAR(255)", constraints: [] }, { name: "Phone", type: "VARCHAR(15)", constraints: [] }] },
  { name: "Availed_By", color: "#5c3d8f", accent: "#ede0f8", note: "M:N — Loan ↔ Customer", columns: [{ name: "Loan_id", type: "VARCHAR(15)", constraints: ["PK", "FK → Loan"] }, { name: "Custid", type: "VARCHAR(15)", constraints: ["PK", "FK → Customer"] }] },
  { name: "Hold_By", color: "#5c3d8f", accent: "#ede0f8", note: "M:N — Account ↔ Customer", columns: [{ name: "Account_No", type: "VARCHAR(20)", constraints: ["PK", "FK → Account"] }, { name: "Custid", type: "VARCHAR(15)", constraints: ["PK", "FK → Customer"] }] },
];
 
function getBadgeStyle(c) {
  if (c === "PK") return { bg: "#fff3cd", color: "#856404", border: "#ffc107" };
  if (c.startsWith("FK")) return { bg: "#e3f2fd", color: "#1565c0", border: "#42a5f5" };
  if (c === "NOT NULL") return { bg: "#e8f5e9", color: "#2e7d32", border: "#66bb6a" };
  return { bg: "#f3f3f3", color: "#555", border: "#ccc" };
}
 
function BkTable({ table }) {
  return (
    <div className="bk-table" style={{ borderColor: table.color + "33" }}>
      <div className="bk-table-top" style={{ background: table.color }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>«table»</span>
        {table.note && <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 20, float: "right" }}>{table.note}</span>}
      </div>
      <div className="bk-table-name" style={{ background: table.accent, borderColor: table.color + "33" }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: table.color }}>{table.name}</span>
      </div>
      <div style={{ background: "#fafafa" }}>
        {table.columns.map((col) => {
          const isPK = col.constraints.includes("PK");
          const isFK = col.constraints.some((c) => c.startsWith("FK"));
          return (
            <div key={col.name} className="bk-col-row">
              <span style={{ fontSize: 12, width: 16, flexShrink: 0 }}>{isPK ? "🔑" : isFK ? "🔗" : ""}</span>
              <span className="bk-col-name" style={{ color: isPK ? table.color : "#222", textDecoration: isPK ? "underline" : "none" }}>{col.name}</span>
              <span className="bk-col-type">{col.type}</span>
              <span style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {col.constraints.map((c) => { const s = getBadgeStyle(c); return <span key={c} className="bk-chip" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{c}</span>; })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
function BankTab() {
  const groups = [
    { label: "Core Entities", tables: bankTables.slice(0, 2) },
    { label: "Branch Entities", tables: bankTables.slice(2, 4) },
    { label: "Customer", tables: bankTables.slice(4, 5) },
    { label: "Relationship Tables", tables: bankTables.slice(5, 7) },
  ];
  return (
    <div className="bk-wrap">
      <div className="bk-legend">
        {[{ icon: "🔑", label: "Primary Key", bg: "#fff3cd", border: "#ffc107", color: "#856404" }, { icon: "🔗", label: "Foreign Key", bg: "#e3f2fd", border: "#42a5f5", color: "#1565c0" }, { icon: "✦", label: "NOT NULL", bg: "#e8f5e9", border: "#66bb6a", color: "#2e7d32" }].map((l) => (
          <div key={l.label} className="bk-legend-item" style={{ background: l.bg, border: `1px solid ${l.border}`, color: l.color }}>{l.icon} {l.label}</div>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.label} style={{ marginBottom: 24 }}>
          <div className="bk-group-lbl">{g.label}</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            {g.tables.map((t) => <BkTable key={t.name} table={t} />)}
          </div>
        </div>
      ))}
      <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", border: "1.5px solid #e0e0e0", fontFamily: "'IBM Plex Mono',monospace" }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#333", marginBottom: 10 }}>📐 ER → Relational Mapping Rules</div>
        {[["Bank (1) — Has — (N) Branch", "Branch gains Bank_Code as FK."], ["Branch (1) — Offer — (N) Loan", "Loan gains Branch_id as FK."], ["Branch (1) — Maintain — (N) Account", "Account gains Branch_id as FK."], ["Loan (M) — Availed_By — (N) Customer", "Availed_By(Loan_id PK/FK, Custid PK/FK)."], ["Account (M) — Hold_By — (N) Customer", "Hold_By(Account_No PK/FK, Custid PK/FK)."]].map(([r, d]) => (
          <div key={r} className="bk-map-note"><span className="bk-map-rule">{r}</span><span style={{ color: "#333", flex: 1, fontSize: 11 }}>→ {d}</span></div>
        ))}
      </div>
    </div>
  );
}
 
// ─── HOW IT WORKS TAB ───
function HowTab() {
  const dhSteps = [["Agree on Public Parameters", "Both parties agree on a large prime p and primitive root g. These are public — anyone can know them."], ["Choose Private Keys", "Alice picks secret a, Bob picks secret b. These never leave their machines."], ["Compute & Exchange Public Values", "Alice sends A = g^a mod p, Bob sends B = g^b mod p. Safe to transmit openly."], ["Compute Shared Secret", "Alice: B^a mod p. Bob: A^b mod p. Both arrive at g^(ab) mod p."]];
  const rsaSteps = [["Choose Two Large Primes", "Select primes p and q. Compute n = p×q and φ(n) = (p−1)(q−1)."], ["Choose Public Exponent e", "Select e: 1 < e < φ(n), gcd(e, φ(n)) = 1. Commonly e = 65537."], ["Compute Private Key d", "Find d ≡ e⁻¹ (mod φ(n)) via Extended Euclidean. Keep d secret."], ["Encrypt & Decrypt", "Encryption: C = M^e mod n. Decryption: M = C^d mod n."]];
  const combined = [["STEP 1", "info", "Client and server perform Diffie–Hellman to agree on a shared session key — never transmitted."], ["STEP 2", "info", "Server sends its RSA public key over the established DH channel."], ["STEP 3", "info", "Client RSA-encrypts credentials using the server's public key before transmission."], ["STEP 4", "info", "Server uses its RSA private key to decrypt and authenticate."], ["RESULT", "success", "Resistant to eavesdropping, MITM attacks, and replay attacks."]];
  return (
    <>
      <div className="g2">
        <div className="card">
          <div className="section-title">DIFFIE–HELLMAN KEY EXCHANGE</div>
          {dhSteps.map(([h, p], i) => <div key={i} className="how"><div className="how-n">{i + 1}</div><div><div className="how-h">{h}</div><div className="how-p">{p}</div></div></div>)}
          <div className="callout">An eavesdropper capturing A and B must solve the Discrete Logarithm Problem — computationally infeasible for large primes.</div>
        </div>
        <div className="card">
          <div className="section-title">RSA ALGORITHM</div>
          {rsaSteps.map(([h, p], i) => <div key={i} className="how"><div className="how-n">{i + 1}</div><div><div className="how-h">{h}</div><div className="how-p">{p}</div></div></div>)}
          <div className="callout">Security relies on the integer factorization problem: given n, it's hard to find p and q for large key sizes (2048+ bits).</div>
        </div>
      </div>
      <div className="card">
        <div className="section-title">COMBINED PROTOCOL — HOW THEY WORK TOGETHER</div>
        {combined.map(([badge, type, text]) => (
          <div key={badge} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap" }}>
            <span className={`badge ${type}`}>{badge}</span>
            <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{text}</span>
          </div>
        ))}
      </div>
    </>
  );
}
 
// ─── ROOT APP ───
export default function CryptoVault() {
  const [tab, setTab] = useState("dh");
  const tabs = [
    { id: "dh", label: "⟨⟩ Diffie–Hellman" },
    { id: "rsa", label: "🔐 RSA Crypto" },
    { id: "login", label: "🛡 Secure Login" },
    { id: "bank", label: "🏦 Bank Schema" },
    { id: "how", label: "📡 How It Works" },
  ];
 
  return (
    <>
      <FontLink />
      <style>{styles}</style>
      <div className="app">
        <header>
          <div className="logo-badge">CRYPTOVAULT + BANK SCHEMA v1.0</div>
          <h1 className="app-title">SECURE <span>CRYPTO</span> CHANNEL</h1>
          <p className="header-sub">RSA · DIFFIE–HELLMAN · RELATIONAL SCHEMA</p>
        </header>
 
        <div className="tabs">
          {tabs.map((t) => (
            <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
 
        {tab === "dh" && <DHTab />}
        {tab === "rsa" && <RSATab />}
        {tab === "login" && <LoginTab />}
        {tab === "bank" && <BankTab />}
        {tab === "how" && <HowTab />}
      </div>
    </>
  );
}