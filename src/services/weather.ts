import { useEffect, useState } from 'react';
import { errorMessage, withTimeout } from '../feedback/task';

// طقس حقيقي من Open-Meteo (مجاني وبدون مفتاح) — مدينة الكويت
const LAT = 29.3759;
const LON = 47.9774;

export type Weather = { tempC: number; maxC?: number; minC?: number; humidity?: number; windKmh?: number; dust: boolean };

export async function fetchWeather(): Promise<Weather> {
  {
    const [w, a] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKuwait&forecast_days=1`).then((r) => r.json()),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=dust`).then((r) => r.json()).catch(() => null),
    ]);
    if (typeof w?.current?.temperature_2m !== 'number') throw new Error('network');
    return {
      tempC: Math.round(w.current.temperature_2m),
      maxC: w.daily?.temperature_2m_max?.[0] != null ? Math.round(w.daily.temperature_2m_max[0]) : undefined,
      minC: w.daily?.temperature_2m_min?.[0] != null ? Math.round(w.daily.temperature_2m_min[0]) : undefined,
      humidity: w.current.relative_humidity_2m,
      windKmh: w.current.wind_speed_10m != null ? Math.round(w.current.wind_speed_10m) : undefined,
      // غبار فوق 150 ميكروغرام/م³ يعتبر عالي
      dust: (a?.current?.dust ?? 0) >= 150,
    };
  }
}

/** الطقس الحالي مع حالة التحميل والخطأ */
export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    withTimeout(fetchWeather(), 10000)
      .then((w) => alive && setWeather(w))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [n]);
  return { weather, loading, error, reload: () => setN((x) => x + 1) };
}
