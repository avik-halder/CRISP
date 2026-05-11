// frontend/src/unitDistricts.js

// IMPORTANT: District spellings in GeoJSON often use newer names like:
// Chattogram (not Chittagong), Cumilla (not Comilla), Lakshmipur (not Laximpur), etc.
// We'll normalize those in code.

export const UNIT_TO_DISTRICTS_RAW = {
  // Metros -> (approx) district polygon
  DMP: ["Dhaka"],
  GMP: ["Gazipur"],
  CMP: ["Chattogram"],
  KMP: ["Khulna"],
  RMP: ["Rajshahi"],
  BMP: ["Barishal"],
  SMP: ["Sylhet"],
  RPMP: ["Rangpur"],

  // Ranges (from Bangladesh Police pages)
  "Dhaka Range": [
    "Dhaka","Narayanganj","Gazipur","Manikganj","Munshiganj","Narsingdi",
    "Tangail","Kishoreganj","Netrokona","Faridpur","Gopalganj",
    "Madaripur","Rajbari","Shariatpur"
  ], // police.gov.bd list :contentReference[oaicite:3]{index=3}

  "Chittagong Range": [
    "Chattogram","Cumilla","Feni","Chandpur","Brahmanbaria","Noakhali",
    "Lakshmipur","Cox's Bazar","Rangamati","Bandarban","Khagrachhari"
  ], // :contentReference[oaicite:4]{index=4}

  "Mymensingh Range": ["Mymensingh","Sherpur","Jamalpur","Netrokona"], // :contentReference[oaicite:5]{index=5}

  "Sylhet Range": ["Sylhet","Habiganj","Moulvibazar","Sunamganj"], // :contentReference[oaicite:6]{index=6}

  "Khulna Range": [
    "Khulna","Bagerhat","Satkhira","Jashore","Magura","Jhenaidah",
    "Narail","Kushtia","Chuadanga","Meherpur"
  ], // :contentReference[oaicite:7]{index=7}

  "Rajshahi Range": [
    "Rajshahi","Chapainawabganj","Natore","Naogaon","Pabna","Sirajganj",
    "Bogura","Joypurhat"
  ], // :contentReference[oaicite:8]{index=8}

  "Rangpur Range": [
    "Rangpur","Gaibandha","Nilphamari","Kurigram","Lalmonirhat",
    "Dinajpur","Thakurgaon","Panchagarh"
  ], // :contentReference[oaicite:9]{index=9}

  "Barishal Range": ["Barishal","Bhola","Jhalokathi","Patuakhali","Pirojpur","Barguna"], // :contentReference[oaicite:10]{index=10}

  // Railway Range (approx → admin districts)
  // Railway Police districts are Dhaka, Chattrogram, Syedpur, Sylhet, Pakshi, Khulna :contentReference[oaicite:11]{index=11}
  "Railway Range": ["Dhaka","Chattogram","Nilphamari","Sylhet","Pabna","Khulna"],
};

// Normalize common spelling differences between your sources and GeoJSON properties
const ALIAS = new Map([
  ["Chittagong", "Chattogram"],
  ["Comilla", "Cumilla"],
  ["Laximpur", "Lakshmipur"],
  ["Coxs Bazar", "Cox's Bazar"],
  ["Khagrasori", "Khagrachhari"],
  ["Brahmonbaria", "Brahmanbaria"],
  ["Bagherhat", "Bagerhat"],
  ["Jessore", "Jashore"],
  ["Sathkhira", "Satkhira"],
  ["Bogra", "Bogura"],
  ["Barisal", "Barishal"],
  ["Jhalokathi", "Jhalokati"],
]);

export function normalizeDistrictName(name) {
  const s = String(name).trim();
  return ALIAS.get(s) ?? s;
}

// Remove overlap: if a district is assigned to a Metro, do NOT paint it again for a Range.
// (Dhaka would otherwise be both DMP and Dhaka Range, etc.)
export function buildUnitToDistrictsNoOverlap() {
  const metroUnits = ["DMP","GMP","CMP","KMP","RMP","BMP","SMP","RPMP"];
  const metroDistricts = new Set();
  for (const u of metroUnits) {
    for (const d of UNIT_TO_DISTRICTS_RAW[u] || []) metroDistricts.add(normalizeDistrictName(d));
  }

  const out = {};
  for (const [unit, dists] of Object.entries(UNIT_TO_DISTRICTS_RAW)) {
    const norm = (dists || []).map(normalizeDistrictName);
    if (metroUnits.includes(unit)) out[unit] = norm;
    else out[unit] = norm.filter((d) => !metroDistricts.has(d));
  }
  return out;
}