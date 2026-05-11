export async function fetchDistricts() {
  const r = await fetch("http://localhost:8000/districts");
  return r.json();
}

export async function fetchRiskMap(year, month) {
  const r = await fetch(`http://localhost:8000/risk_map?year=${year}&month=${month}`);
  return r.json();
}

export async function predictRisk(district, year, month) {
  const r = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ district, year, month })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}