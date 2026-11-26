import axios from "axios";

// Weather and place lookup, via Open-Meteo.
//
// Open-Meteo needs no API key and allows non-commercial use, which keeps the
// header widget working without asking the user to sign up for anything.
//
// Two things to know about it:
//  • The free tier is rate limited per IP. Responses are cached here so a page
//    with the widget open does not spend a request every render.
//  • It reports conditions as WMO codes, not text, so the mapping to Hebrew
//    lives in this module.

export interface Place {
  name: string;
  country?: string;
  admin?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface Weather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
  isDay: boolean;
  description: string;
  icon: string;
  timezone: string;
}

/** WMO weather interpretation codes → Hebrew label + a glyph. */
const WMO: Record<number, { he: string; day: string; night: string }> = {
  0: { he: "בהיר", day: "☀️", night: "🌙" },
  1: { he: "בהיר בעיקר", day: "🌤️", night: "🌙" },
  2: { he: "מעונן חלקית", day: "⛅", night: "☁️" },
  3: { he: "מעונן", day: "☁️", night: "☁️" },
  45: { he: "ערפל", day: "🌫️", night: "🌫️" },
  48: { he: "ערפל מקפיא", day: "🌫️", night: "🌫️" },
  51: { he: "טפטוף קל", day: "🌦️", night: "🌦️" },
  53: { he: "טפטוף", day: "🌦️", night: "🌦️" },
  55: { he: "טפטוף חזק", day: "🌦️", night: "🌦️" },
  56: { he: "טפטוף קפוא", day: "🌧️", night: "🌧️" },
  57: { he: "טפטוף קפוא חזק", day: "🌧️", night: "🌧️" },
  61: { he: "גשם קל", day: "🌦️", night: "🌦️" },
  63: { he: "גשם", day: "🌧️", night: "🌧️" },
  65: { he: "גשם חזק", day: "🌧️", night: "🌧️" },
  66: { he: "גשם קפוא", day: "🌧️", night: "🌧️" },
  67: { he: "גשם קפוא חזק", day: "🌧️", night: "🌧️" },
  71: { he: "שלג קל", day: "🌨️", night: "🌨️" },
  73: { he: "שלג", day: "🌨️", night: "🌨️" },
  75: { he: "שלג כבד", day: "❄️", night: "❄️" },
  77: { he: "גרגרי שלג", day: "🌨️", night: "🌨️" },
  80: { he: "ממטרים קלים", day: "🌦️", night: "🌦️" },
  81: { he: "ממטרים", day: "🌧️", night: "🌧️" },
  82: { he: "ממטרים עזים", day: "⛈️", night: "⛈️" },
  85: { he: "ממטרי שלג", day: "🌨️", night: "🌨️" },
  86: { he: "ממטרי שלג כבדים", day: "❄️", night: "❄️" },
  95: { he: "סופת רעמים", day: "⛈️", night: "⛈️" },
  96: { he: "סופת רעמים עם ברד", day: "⛈️", night: "⛈️" },
  99: { he: "סופת רעמים עם ברד כבד", day: "⛈️", night: "⛈️" },
};

function describe(code: number, isDay: boolean) {
  const entry = WMO[code] ?? { he: "לא ידוע", day: "🌡️", night: "🌡️" };
  return { description: entry.he, icon: isDay ? entry.day : entry.night };
}

/** Small TTL cache — the free tier is rate limited per IP. */
const cache = new Map<string, { at: number; data: unknown }>();

function cached<T>(key: string, ttlMs: number): T | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  return null;
}

function store(key: string, data: unknown) {
  cache.set(key, { at: Date.now(), data });
}

class RateLimited extends Error {}

async function getJson(url: string): Promise<Record<string, unknown>> {
  // axios, not fetch: axios honours the HTTPS_PROXY environment, and Node's
  // built-in fetch does not. The rest of the app's outbound calls use axios
  // for the same reason.
  const res = await axios.get<Record<string, unknown>>(url, {
    timeout: 10000,
    headers: { "User-Agent": "PostwaveBot/1.0" },
    // Read the body ourselves on any status; Open-Meteo puts errors in it.
    validateStatus: () => true,
  });

  const data = (res.data || {}) as Record<string, unknown>;

  // Open-Meteo answers 200 with {error:true, reason} for a quota breach, so
  // the body decides, not the status.
  if (data.error) {
    const reason = String(data.reason || "");
    if (/limit/i.test(reason)) throw new RateLimited(reason);
    throw new Error(reason || "weather lookup failed");
  }
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}`);
  }
  return data;
}

export function isRateLimit(e: unknown): boolean {
  return e instanceof RateLimited;
}

/** Find places by name, for the manual picker. */
export async function searchPlaces(query: string, limit = 6): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];

  const key = `geo:${q.toLowerCase()}:${limit}`;
  const hit = cached<Place[]>(key, 24 * 60 * 60 * 1000);
  if (hit) return hit;

  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(q) +
    `&count=${limit}&language=he&format=json`;

  const data = await getJson(url);
  const results = Array.isArray(data.results) ? data.results : [];
  const places: Place[] = results.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      name: String(o.name ?? ""),
      country: o.country ? String(o.country) : undefined,
      admin: o.admin1 ? String(o.admin1) : undefined,
      latitude: Number(o.latitude),
      longitude: Number(o.longitude),
      timezone: o.timezone ? String(o.timezone) : undefined,
    };
  });

  store(key, places);
  return places;
}

/** Current conditions for a coordinate. */
export async function getWeather(lat: number, lon: number): Promise<Weather> {
  // Round the key: a few metres of GPS jitter should not miss the cache.
  const key = `wx:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const hit = cached<Weather>(key, 10 * 60 * 1000);
  if (hit) return hit;

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m," +
    "wind_speed_10m,weather_code,is_day&timezone=auto";

  const data = await getJson(url);
  const c = (data.current || {}) as Record<string, unknown>;
  const code = Number(c.weather_code ?? 0);
  const isDay = Number(c.is_day ?? 1) === 1;
  const { description, icon } = describe(code, isDay);

  const weather: Weather = {
    temperature: Math.round(Number(c.temperature_2m ?? 0)),
    feelsLike: Math.round(Number(c.apparent_temperature ?? 0)),
    humidity: Math.round(Number(c.relative_humidity_2m ?? 0)),
    windSpeed: Math.round(Number(c.wind_speed_10m ?? 0)),
    code,
    isDay,
    description,
    icon,
    timezone: String(data.timezone ?? "UTC"),
  };

  store(key, weather);
  return weather;
}

/**
 * Name a coordinate. Open-Meteo has no reverse endpoint, so the nearest
 * populated place from a tiny-radius search is used as the label.
 */
export async function reverseName(lat: number, lon: number): Promise<string | null> {
  const key = `rev:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const hit = cached<string | null>(key, 24 * 60 * 60 * 1000);
  if (hit !== null) return hit;

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?latitude=" +
      `${lat}&longitude=${lon}&count=1&language=he&format=json`;
    const data = await getJson(url);
    const results = Array.isArray(data.results) ? data.results : [];
    const name = results.length
      ? String((results[0] as Record<string, unknown>).name ?? "")
      : null;
    store(key, name);
    return name;
  } catch {
    return null;
  }
}
