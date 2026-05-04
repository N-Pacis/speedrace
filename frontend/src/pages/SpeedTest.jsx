import { useState, useEffect } from "react";

const CF = "https://speed.cloudflare.com";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function measurePing(onProgress) {
  const times = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    await fetch(`${CF}/__down?bytes=0`, { cache: "no-store" });
    times.push(performance.now() - start);
    const sorted = [...times].sort((a, b) => a - b);
    onProgress(Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length));
  }
  times.sort((a, b) => a - b);
  return Math.round(times.slice(0, 4).reduce((a, b) => a + b, 0) / 4);
}

async function measureDownload(onProgress) {
  const sizes = [100_000, 1_000_000, 10_000_000, 25_000_000];
  let totalBytes = 0,
    totalTime = 0;
  for (const size of sizes) {
    const start = performance.now();
    const res = await fetch(`${CF}/__down?bytes=${size}`, {
      cache: "no-store",
    });
    await res.arrayBuffer();
    const elapsed = (performance.now() - start) / 1000;
    totalBytes += size;
    totalTime += elapsed;
    onProgress((totalBytes * 8) / totalTime / 1e6);
  }
  return (totalBytes * 8) / totalTime / 1e6;
}

async function measureUpload(onProgress) {
  const sizes = [100_000, 1_000_000, 10_000_000];
  let totalBytes = 0,
    totalTime = 0;
  for (const size of sizes) {
    const body = new Blob([new Uint8Array(size)], { type: "text/plain" });
    const start = performance.now();
    await fetch(`${CF}/__up`, { method: "POST", body, mode: "no-cors" });
    const elapsed = (performance.now() - start) / 1000;
    totalBytes += size;
    totalTime += elapsed;
    onProgress((totalBytes * 8) / totalTime / 1e6);
  }
  return (totalBytes * 8) / totalTime / 1e6;
}

const PHASE_LABEL = {
  ping: (run) => `Run ${run}/3 — Measuring ping…`,
  download: (run) => `Run ${run}/3 — Measuring download…`,
  upload: (run) => `Run ${run}/3 — Measuring upload…`,
};

export default function SpeedTest() {
  const [ip, setIp] = useState(null);
  const [country, setCountry] = useState(null);
  const [abbreviation, setAbbreviation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const [phase, setPhase] = useState("idle");
  const [run, setRun] = useState(0);
  const [ping, setPing] = useState(null);
  const [download, setDownload] = useState(null);
  const [upload, setUpload] = useState(null);
  const [livePing, setLivePing] = useState(null);
  const [liveDownload, setLiveDownload] = useState(null);
  const [liveUpload, setLiveUpload] = useState(null);

  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setIp(d.ip);
        setCountry(d.country_name);
        setAbbreviation(d.country_code);
        setLocationLoading(false);
      })
      .catch(() => {
        setLocationError("Could not detect location");
        setLocationLoading(false);
      });
  }, []);

  async function runTest() {
    setPing(null);
    setDownload(null);
    setUpload(null);
    setLivePing(null);
    setLiveDownload(null);
    setLiveUpload(null);
    setSubmitStatus(null);
    setSubmitMessage(null);

    const pings = [],
      downloads = [],
      uploads = [];
    for (let i = 1; i <= 3; i++) {
      setRun(i);
      setPhase("ping");
      pings.push(await measurePing(setLivePing));
      setPhase("download");
      setLiveDownload(0);
      downloads.push(await measureDownload(setLiveDownload));
      setPhase("upload");
      setLiveUpload(0);
      uploads.push(await measureUpload(setLiveUpload));
    }

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const finalPing = Math.round(avg(pings));
    const finalDownload = avg(downloads);
    const finalUpload = avg(uploads);

    setPing(finalPing);
    setDownload(finalDownload);
    setUpload(finalUpload);
    setLivePing(null);
    setLiveDownload(null);
    setLiveUpload(null);
    setRun(0);
    setPhase("done");

    if (abbreviation) {
      setSubmitStatus("sending");
      try {
        const res = await fetch(`${API}/api/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            abbreviation,
            country,
            ip,
            downloadMbps: parseFloat(finalDownload.toFixed(2)),
            uploadMbps: parseFloat(finalUpload.toFixed(2)),
            pingMs: finalPing,
          }),
        });
        const data = await res.json();
        setSubmitStatus(res.ok ? "ok" : "error");
        setSubmitMessage(res.ok ? data.message : data.error || "Server error");
      } catch {
        setSubmitStatus("error");
        setSubmitMessage("Could not reach API — is the server running?");
      }
    }
  }

  const running = phase !== "idle" && phase !== "done";
  const displaySpeed =
    phase === "download" && liveDownload !== null
      ? liveDownload
      : phase === "upload" && liveUpload !== null
        ? liveUpload
        : download !== null
          ? download
          : 0;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <h1 className="page-title">Test Your Internet Speed</h1>
        <p className="page-copy">
          Run a quick check on your internet ping, download, and upload speed
          and help improve the accuracy of your country's average internet speed
          data
        </p>
        <div className="hero-stat" aria-live="polite">
          <span className="hero-stat-value">{displaySpeed.toFixed(0)}</span>
          <span className="hero-stat-unit">Mbps</span>
        </div>
        <button
          onClick={runTest}
          disabled={running || locationLoading}
          className="app-button"
        >
          {running ? PHASE_LABEL[phase]?.(run) : "Run Speed Test"}
        </button>
      </section>

      <section className="surface-card info-panel">
        <div>
          <div className="eyebrow">Detected Location</div>
          <div style={{ marginTop: "0.85rem" }}>
            {locationLoading && (
              <p className="status-text muted">Detecting location…</p>
            )}
            {locationError && (
              <p className="status-text error">{locationError}</p>
            )}
            {!locationLoading && !locationError && (
              <>
                <div className="info-value">{ip}</div>
                <p className="info-muted" style={{ marginTop: "3rem" }}>
                  {country
                    ? `${country}${abbreviation ? ` (${abbreviation})` : ""}`
                    : "Location unavailable"}
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="metric-grid">
            <div className="metric-item">
              <div className="eyebrow">Upload Speed</div>
              <div className="metric-value" style={{ marginTop: "0.6rem" }}>
                {upload !== null
                  ? upload.toFixed(0)
                  : liveUpload !== null
                    ? liveUpload.toFixed(0)
                    : "0"}
                <span className="unit">Mbps</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="eyebrow">Download Speed</div>
              <div className="metric-value" style={{ marginTop: "0.6rem" }}>
                {download !== null
                  ? download.toFixed(0)
                  : liveDownload !== null
                    ? liveDownload.toFixed(0)
                    : "0"}
                <span className="unit">Mbps</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="eyebrow">Ping</div>
              <div className="metric-value" style={{ marginTop: "0.6rem" }}>
                {ping !== null
                  ? ping
                  : livePing !== null
                    ? livePing
                    : "0"}
                <span className="unit">ms</span>
              </div>
            </div>
          </div>

          {submitStatus === "sending" && (
            <p className="status-text muted" style={{ marginTop: "1.5rem" }}>
              Submitting result to server…
            </p>
          )}
          {submitStatus === "ok" && (
            <p className="status-text success" style={{ marginTop: "1.5rem" }}>
              {submitMessage}
            </p>
          )}
          {submitStatus === "error" && (
            <p className="status-text error" style={{ marginTop: "1.5rem" }}>
              {submitMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
