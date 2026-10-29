/**
 * Regenerates the static lists used by the bot (same sources as the
 * Meteo Trentino app):
 *  - lib/config/venues.json   forecast points (meteo.report open data)
 *  - lib/config/stations.json weather stations (Tinia / Euregio)
 *
 * Usage: npm run update-data
 */
const fs   = require('fs');
const path = require('path');

const VENUES_URL   = 'https://meteo.report/open_data/forecasts/trentino.json';
const STATIONS_URL = 'https://gitlab.com/tinia-euregio/tinia-website/-/raw/main/data/venues/it/3.json';
const FORECASTS_URL    = 'https://meteo.report/var/data/forecasts';
const OBSERVATIONS_URL = 'https://meteo.report/var/data/observations';
const TRENTINO     = 'fba93146-7192-4190-adab-605435fdeea1';

// id_venue_type: 2 = comune, 8 = frazione/località, 5 = area montana (not used)
const PLACE_TYPES = ['2', '8'];

const CONFIG_DIR = path.join(__dirname, '..', 'lib', 'config');

let getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

let save = (file, data) => {
  fs.writeFileSync(path.join(CONFIG_DIR, file), JSON.stringify(data, null, 1) + '\n');
  console.log(`Saved ${data.length} items to lib/config/${file}`);
};

let byName = (a, b) => a.name.localeCompare(b.name, 'it');

(async () => {
  // keep only venues that actually publish a forecast (several località don't)
  const venues = (await getJson(VENUES_URL)).filter((v) => PLACE_TYPES.includes(v.id_venue_type) && v.name_ita);
  const withForecast = (await Promise.all(venues.map(async (v) => {
    const res = await fetch(`${FORECASTS_URL}/${v.id}.json`, { method: 'HEAD' }).catch(() => null);
    return res && res.ok ? v : null;
  }))).filter(Boolean);
  console.log(`${withForecast.length}/${venues.length} venues publish a forecast`);
  save('venues.json', withForecast
    .map((v) => ({
      id: v.id,
      name: v.name_ita,
      type: v.id_venue_type === '2' ? 'comune' : 'localita',
      lat: v.lat,
      lon: v.lon,
      elevation: v.elevation
    }))
    .sort(byName));

  // keep only stations that actually publish observations
  const stations = (await getJson(STATIONS_URL)).filter((s) => s.id_region === TRENTINO && s.name);
  const active = [];
  await Promise.all(stations.map(async (s) => {
    const res = await fetch(`${OBSERVATIONS_URL}/${s.id}.json`, { method: 'HEAD' }).catch(() => null);
    if (res && res.ok) active.push(s);
  }));
  console.log(`${active.length}/${stations.length} stations publish observations`);
  save('stations.json', active
    .map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon, elevation: s.elevation }))
    .sort(byName));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
