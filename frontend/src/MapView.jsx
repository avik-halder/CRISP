// import "leaflet/dist/leaflet.css";
// import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

// const colorByClass = (riskClass) => {
//   if (riskClass === "High") return "#e53935";
//   if (riskClass === "Medium") return "#fbc02d";
//   return "#43a047"; // Low
// };

// export default function MapView({ markers }) {
//   // Center Bangladesh-ish (adjust)
//   const center = [23.685, 90.3563];

//   return (
//     <MapContainer center={center} zoom={7} style={{ height: "80vh", width: "100%" }}>
//       <TileLayer
//         attribution='&copy; OpenStreetMap contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {markers.map((m) => {
//         const color = colorByClass(m.risk_class);
//         const hasRisk = m.risk_class != null;

//         return (
//           <CircleMarker
//             key={m.district}
//             center={[m.lat, m.lng]}
//             radius={12}
//             pathOptions={{
//               color: hasRisk ? color : "#9e9e9e",
//               fillColor: hasRisk ? color : "#9e9e9e",
//               fillOpacity: 0.8,
//               weight: 2
//             }}
//           >
//             <Popup>
//               <div style={{ minWidth: 220 }}>
//                 <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.district}</div>
//                 {hasRisk ? (
//                   <>
//                     <div><b>Class:</b> {m.risk_class}</div>
//                     <div><b>Risk:</b> {Number(m.new_risk).toFixed(3)}</div>
//                     <div><b>Trend score:</b> {Number(m.trend_score).toFixed(3)}</div>
//                     <div><b>Forecast next crime:</b> {Number(m.ml_prediction_next_crime).toFixed(2)}</div>
//                   </>
//                 ) : (
//                   <div>No prediction stored for this month yet. Click “Predict All”.</div>
//                 )}
//               </div>
//             </Popup>
//           </CircleMarker>
//         );
//       })}
//     </MapContainer>
//   );
// }


// frontend/src/MapView.jsx
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const colorByClass = (riskClass) => {
  if (riskClass === "High") return "#e53935";
  if (riskClass === "Medium") return "#fbc02d";
  return "#43a047";
};

/* Area of each police unit in km² */
const COVERAGE_AREA_KM2 = {
  DMP: 1600,
  CMP: 656,
  KMP: 151,
  RMP: 900,
  BMP: 70,
  SMP: 178,
  RPMP: 240,
  GMP: 330,

  "Dhaka Range": 20508,
  "Mymensingh Range": 10585,
  "Chittagong Range": 33875,
  "Sylhet Range": 12299,
  "Khulna Range": 22285,
  "Barishal Range": 13226,
  "Rajshahi Range": 18175,
  "Rangpur Range": 16185,

  "Railway Range": 3600,
};

/* Convert area (km²) → radius (meters) */
const areaKm2ToRadiusMeters = (areaKm2) => {
  const rKm = Math.sqrt(areaKm2 / Math.PI);
  return rKm * 1000;
};

export default function MapView({ markers }) {
  const center = [23.685, 90.3563]; // Bangladesh center

  /* Sort: large areas drawn first so small ones remain clickable */
  const sorted = [...markers].sort((a, b) => {
    const areaA = COVERAGE_AREA_KM2[a.district] ?? 1000;
    const areaB = COVERAGE_AREA_KM2[b.district] ?? 1000;
    return areaB - areaA;
  });

  return (
    <MapContainer center={center} zoom={7} style={{ height: "82vh", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sorted.map((m) => {
        const unitName = m.district;
        const hasRisk = m.risk_class != null;
        const color = hasRisk ? colorByClass(m.risk_class) : "#9e9e9e";

        const areaKm2 = COVERAGE_AREA_KM2[unitName] ?? 1000;
        const radiusMeters = areaKm2ToRadiusMeters(areaKm2);

        return (
          <div key={unitName}>
            {/* Fill layer (click-through) */}
            <Circle
              center={[m.lat, m.lng]}
              radius={radiusMeters}
              interactive={false}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.14,
                weight: 0,
              }}
            />

            {/* Border layer (clickable) */}
            <Circle
              center={[m.lat, m.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: color,
                fillOpacity: 0,
                weight: 3,
                opacity: 0.9,
              }}
            >
              <Popup>
                <div className="popup">
                  <div className="popup-title">{unitName}</div>

                  {hasRisk ? (
                    <>
                      <div className="popup-row">
                        <span className="k">Class</span>
                        <span className={`pill pill-${m.risk_class.toLowerCase()}`}>
                          {m.risk_class}
                        </span>
                      </div>

                      <div className="popup-row">
                        <span className="k">Risk</span>
                        <span className="v">{Number(m.new_risk).toFixed(3)}</span>
                      </div>

                      <div className="popup-row">
                        <span className="k">Trend</span>
                        <span className="v">{Number(m.trend_score).toFixed(3)}</span>
                      </div>

                      <div className="popup-row">
                        <span className="k">Forecast crime</span>
                        <span className="v">{Number(m.ml_prediction_next_crime).toFixed(2)}</span>
                      </div>

                      <div className="popup-row">
                        <span className="k">Coverage Area</span>
                        <span className="v">{areaKm2.toFixed(0)} km²</span>
                      </div>
                    </>
                  ) : (
                    <div className="muted">
                      No prediction stored for this month. Click “Predict All”.
                    </div>
                  )}
                </div>
              </Popup>
            </Circle>
          </div>
        );
      })}
    </MapContainer>
  );
}