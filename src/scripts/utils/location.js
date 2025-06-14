const locationCache = new Map();

/**

 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>}
 */
export async function getLocationName(lat, lon) {
  const key = `${lat},${lon}`;

  if (locationCache.has(key)) {
    console.log(`[Location Cache] Mengambil dari cache untuk kunci: ${key}`);
    return locationCache.get(key);
  }

  const locationString = `${lat}, ${lon}`;
  console.log(
    `[Location Cache] Kunci tidak ditemukan, membuat string lokasi baru: ${locationString}`
  );

  locationCache.set(key, locationString);

  return locationString;
}

export function clearLocationCache() {
  locationCache.clear();
  console.log('[Location Cache] Cache lokasi telah dibersihkan.');
}
