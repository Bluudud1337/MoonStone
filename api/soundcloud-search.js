export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const query = String(req.query?.q || "").trim().slice(0, 120);
  if (!query) return res.status(400).json({ error: "Enter a song or artist name." });

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(503).json({
      error: "SoundCloud search needs API credentials. Add SOUNDCLOUD_CLIENT_ID and SOUNDCLOUD_CLIENT_SECRET to the hosting environment."
    });
  }

  try {
    const credentials = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const tokenResponse = await fetch("https://secure.soundcloud.com/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + credentials,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: "grant_type=client_credentials"
    });
    if (!tokenResponse.ok) {
      return res.status(502).json({ error: "SoundCloud authentication failed. Check the API credentials." });
    }
    const tokenData = await tokenResponse.json();
    const url = new URL("https://api.soundcloud.com/tracks");
    url.searchParams.set("q", query);
    url.searchParams.set("access", "playable");
    url.searchParams.set("limit", "24");
    url.searchParams.set("linked_partitioning", "true");

    const searchResponse = await fetch(url, {
      headers: {
        "Authorization": "OAuth " + tokenData.access_token,
        "Accept": "application/json; charset=utf-8"
      }
    });
    if (!searchResponse.ok) {
      return res.status(502).json({ error: "SoundCloud could not return search results right now." });
    }
    const data = await searchResponse.json();
    const collection = Array.isArray(data.collection) ? data.collection : [];
    const tracks = collection.map(track => ({
      id: String(track.id || track.urn || track.permalink_url),
      title: track.title || "Untitled track",
      artist: track.user?.username || track.publisher_metadata?.artist || "Unknown artist",
      cover: track.artwork_url || track.user?.avatar_url || "",
      link: track.permalink_url || "https://soundcloud.com/",
      duration: Number(track.duration) || 0,
      source: "soundcloud"
    })).filter(track => track.link && track.link.startsWith("https://soundcloud.com/"));
    return res.status(200).json({ tracks });
  } catch (error) {
    return res.status(500).json({ error: "SoundCloud search failed. Please try again." });
  }
}
