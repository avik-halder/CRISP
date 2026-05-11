// import { useEffect, useState } from "react";
// import MapView from "./MapView";
// import { fetchRiskMap, fetchDistricts, predictRisk } from "./api";

// export default function App() {
//   const [year, setYear] = useState(2026);
//   const [month, setMonth] = useState(1);
//   const [markers, setMarkers] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   async function load() {
//     const data = await fetchRiskMap(year, month);
//     setMarkers(data);
//   }

//   useEffect(() => {
//     (async () => {
//       setDistricts(await fetchDistricts());
//       await load();
//     })();
//     // eslint-disable-next-line
//   }, []);

//   useEffect(() => { load(); }, [year, month]);

//   async function predictAll() {
//     setLoading(true);
//     try {
//       for (const d of districts) {
//         await predictRisk(d.name, year, month);
//       }
//       await load();
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ padding: 16 }}>
//       <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
//         <div>
//           <label>Year </label>
//           <input value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 90 }} />
//         </div>
//         <div>
//           <label>Month </label>
//           <input value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 60 }} />
//         </div>

//         <button onClick={predictAll} disabled={loading}>
//           {loading ? "Predicting..." : "Predict All"}
//         </button>
//       </div>

//       <MapView markers={markers} />
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import MapView from "./MapView";
import { fetchRiskMap, fetchDistricts, predictRisk } from "./api";
import "./index.css";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function Badge({ label, tone }) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

function Legend() {
  return (
    <div className="card legend">
      <div className="card-title">Legend</div>
      <div className="legend-row">
        <span className="dot dot-low" /> <span>Low</span>
      </div>
      <div className="legend-row">
        <span className="dot dot-med" /> <span>Medium</span>
      </div>
      <div className="legend-row">
        <span className="dot dot-high" /> <span>High</span>
      </div>
      <div className="legend-row">
        <span className="dot dot-na" /> <span>No data</span>
      </div>
    </div>
  );
}

export default function App() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);

  const [markers, setMarkers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState("");

  async function loadMap() {
    setLoadingMap(true);
    try {
      const data = await fetchRiskMap(year, month);
      setMarkers(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoadingMap(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setDistricts(await fetchDistricts());
        await loadMap();
      } catch (e) {
        setError(String(e?.message || e));
      }
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadMap();
    // eslint-disable-next-line
  }, [year, month]);

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter((d) => d.name.toLowerCase().includes(q));
  }, [districts, search]);

  const stats = useMemo(() => {
    const s = { Low: 0, Medium: 0, High: 0, NA: 0 };
    for (const m of markers) {
      if (!m.risk_class) s.NA++;
      else s[m.risk_class] = (s[m.risk_class] || 0) + 1;
    }
    return s;
  }, [markers]);

  async function predictAll() {
    setLoading(true);
    setError("");
    try {
      // Predict for all districts (sequential for simplicity)
      for (const d of districts) {
        await predictRisk(d.name, year, month);
      }
      await loadMap();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function predictFiltered() {
    setLoading(true);
    setError("");
    try {
      for (const d of filteredDistricts) {
        await predictRisk(d.name, year, month);
      }
      await loadMap();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">Crime Risk Dashboard</div>
          <div className="brand-sub">Stacked Forecast + Risk Classification (Low / Medium / High)</div>
        </div>

        <div className="topbar-right">
          <Badge label={`Low: ${stats.Low}`} tone="low" />
          <Badge label={`Medium: ${stats.Medium}`} tone="med" />
          <Badge label={`High: ${stats.High}`} tone="high" />
          <Badge label={`No data: ${stats.NA}`} tone="na" />
        </div>
      </header>

      {error ? (
        <div className="toast" onClick={() => setError("")}>
          <b>Error:</b>&nbsp;{error} <span className="toast-x">✕</span>
        </div>
      ) : null}

      <main className="layout">
        <aside className="sidebar">
          <div className="card">
            <div className="card-title">Controls</div>

            <div className="row">
              <label>Year</label>
              <input
                className="input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div className="row">
              <label>Month</label>
              <select
                className="input"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <label>Search unit</label>
              <input
                className="input"
                placeholder="DMP, CMP, Dhaka Range..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="btn-row">
              <button className="btn primary" onClick={predictAll} disabled={loading}>
                {loading ? "Predicting..." : "Predict All"}
              </button>
              <button className="btn" onClick={predictFiltered} disabled={loading || filteredDistricts.length === 0}>
                Predict Filtered
              </button>
            </div>

            <div className="hint">
              Tip: click a circle to view forecast, risk score, and class.
            </div>
          </div>

          <Legend />

          <div className="card">
            <div className="card-title">Map Status</div>
            <div className="muted">
              {loadingMap ? "Loading markers..." : `Showing ${markers.length} units for ${
  MONTHS.find(m => m.value === month)?.label
} ${year}`}
            </div>
          </div>
        </aside>

        <section className="mapwrap">
          <div className="mapcard">
            <MapView markers={markers} />
          </div>
        </section>
      </main>
    </div>
  );
}