"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Weather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  timezone: string;
}

interface Place {
  name: string;
  country?: string;
  admin?: string;
  latitude: number;
  longitude: number;
}

interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  /** How we got here, so the UI can say "auto" vs a deliberate choice. */
  source: "auto" | "manual";
}

const STORAGE_KEY = "postwave:location";

function readSaved(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedLocation) : null;
  } catch {
    return null;
  }
}

function writeSaved(loc: SavedLocation | null) {
  try {
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private window or blocked storage — the widget still works this session
  }
}

export function ClockWeather() {
  const [now, setNow] = useState<Date | null>(null);
  const [loc, setLoc] = useState<SavedLocation | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // The clock starts only after mount. Rendering a time on the server would
  // not match the client's first paint and would trip a hydration mismatch.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadWeather = useCallback(async (l: SavedLocation) => {
    try {
      const res = await fetch(`/api/weather?lat=${l.latitude}&lon=${l.longitude}`);
      const data = await res.json();
      if (data.ok) {
        setWeather(data.weather);
        setNote(null);
        // Auto-detected coordinates arrive nameless; adopt the resolved name.
        if (data.place && l.source === "auto" && l.name !== data.place) {
          const named = { ...l, name: data.place };
          setLoc(named);
          writeSaved(named);
        }
      } else {
        setWeather(null);
        setNote(data.error || "מזג האוויר לא זמין כרגע");
      }
    } catch {
      setWeather(null);
      setNote("אין חיבור לשירות מזג האוויר");
    }
  }, []);

  /** Ask the browser where we are. Requires the user's permission. */
  const detect = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setNote("הדפדפן לא תומך בזיהוי מיקום. בחר עיר ידנית.");
      return;
    }
    setNote("מזהה מיקום...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: SavedLocation = {
          name: "המיקום שלי",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: "auto",
        };
        setLoc(next);
        writeSaved(next);
        setNote(null);
        void loadWeather(next);
      },
      () => {
        // Denied or unavailable — say so and leave the manual path open.
        setNote("זיהוי המיקום נדחה. אפשר לבחור עיר ידנית.");
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, [loadWeather]);

  // On mount: use a saved location if there is one; otherwise wait for the
  // user rather than prompting for geolocation unasked.
  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setLoc(saved);
      void loadWeather(saved);
    }
  }, [loadWeather]);

  // Refresh conditions every 10 minutes.
  useEffect(() => {
    if (!loc) return;
    const id = setInterval(() => void loadWeather(loc), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [loc, loadWeather]);

  // Close the panel on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Debounced city search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data.places) ? data.places : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  const choose = (p: Place) => {
    const next: SavedLocation = {
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      source: "manual",
    };
    setLoc(next);
    writeSaved(next);
    setOpen(false);
    setQuery("");
    setResults([]);
    void loadWeather(next);
  };

  // Times and dates are formatted with Intl in the location's own zone, so a
  // chosen city shows that city's clock rather than the viewer's.
  const tz = weather?.timezone;
  const time = now
    ? new Intl.DateTimeFormat("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        ...(tz ? { timeZone: tz } : {}),
      }).format(now)
    : "--:--:--";

  const date = now
    ? new Intl.DateTimeFormat("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(tz ? { timeZone: tz } : {}),
      }).format(now)
    : "";

  return (
    <div ref={panelRef} className="relative hidden flex-shrink-0 lg:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="שעון, תאריך ומזג אוויר"
        className="glass flex items-center gap-3 rounded-2xl px-4 py-2 text-right"
      >
        <div className="leading-tight">
          {/* Tabular figures stop the seconds jittering the layout. */}
          <p className="text-lg font-black ink tabular">{time}</p>
          <p className="text-[11px] ink-muted">{date}</p>
        </div>

        {weather && (
          <div className="flex items-center gap-1.5 border-r edge pr-3">
            <span className="text-xl" aria-hidden="true">
              {weather.icon}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-black ink tabular">
                {weather.temperature}°
              </p>
              <p className="max-w-[90px] truncate text-[11px] ink-muted">
                {loc?.name}
              </p>
            </div>
          </div>
        )}

        {!weather && (
          <span className="border-r edge pr-3 text-[11px] ink-muted">
            {loc ? "טוען..." : "הוסף מיקום"}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-strong glass-raised absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl p-4 text-right">
          <h3 className="text-sm font-black ink">מיקום ומזג אוויר</h3>

          {weather && loc && (
            <div className="mt-3 rounded-xl surface-solid p-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">
                  {weather.icon}
                </span>
                <div>
                  <p className="text-sm font-bold ink">{loc.name}</p>
                  <p className="text-xs ink-muted">{weather.description}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[10px] ink-muted">מרגיש כמו</dt>
                  <dd className="text-sm font-bold ink tabular">
                    {weather.feelsLike}°
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] ink-muted">לחות</dt>
                  <dd className="text-sm font-bold ink tabular">
                    {weather.humidity}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] ink-muted">רוח</dt>
                  <dd className="text-sm font-bold ink tabular">
                    {weather.windSpeed}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {note && (
            <p role="status" className="mt-3 text-xs ink-muted">
              {note}
            </p>
          )}

          <button
            onClick={detect}
            className="mt-3 w-full rounded-xl accent-surface px-4 py-2 text-sm font-bold"
          >
            זהה את המיקום שלי אוטומטית
          </button>

          <div className="mt-3">
            <label htmlFor="city-search" className="text-xs font-bold ink">
              או בחר עיר
            </label>
            <input
              id="city-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="הקלד שם עיר..."
              autoComplete="off"
              className="mt-1 w-full rounded-xl surface-solid px-3 py-2 text-right text-sm"
            />

            {searching && <p className="mt-2 text-xs ink-muted">מחפש...</p>}

            {results.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto">
                {results.map((p, i) => (
                  <li key={`${p.latitude}-${p.longitude}-${i}`}>
                    <button
                      onClick={() => choose(p)}
                      className="w-full rounded-lg px-3 py-2 text-right text-sm ink hover:surface"
                    >
                      <span className="font-bold">{p.name}</span>
                      <span className="ink-muted">
                        {p.admin ? ` · ${p.admin}` : ""}
                        {p.country ? ` · ${p.country}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="mt-2 text-xs ink-muted">לא נמצאו תוצאות</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
