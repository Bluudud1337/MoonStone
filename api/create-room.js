export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "MoonStone Meet is not configured yet. The site owner needs to add DAILY_API_KEY in Vercel." });
  }

  const rawName = typeof req.body?.roomName === "string" ? req.body.roomName : "";
  const roomName = rawName.trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  if (roomName.length < 3) {
    return res.status(400).json({ error: "Room names must contain at least 3 letters or numbers." });
  }

  const base = "https://api.daily.co/v1";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  try {
    // Reuse a room with this name so people entering the same name can meet.
    let response = await fetch(`${base}/rooms/${encodeURIComponent(roomName)}`, { headers });
    let room;

    if (response.ok) {
      room = await response.json();
    } else if (response.status === 404) {
      response = await fetch(`${base}/rooms`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: roomName,
          privacy: "public",
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400,
            enable_chat: true,
            start_audio_off: true,
            start_video_off: true
          }
        })
      });

      if (response.ok) {
        room = await response.json();
      } else if (response.status === 400 || response.status === 409) {
        // Another person may have created this room at the same time.
        const existingResponse = await fetch(`${base}/rooms/${encodeURIComponent(roomName)}`, { headers });
        if (existingResponse.ok) room = await existingResponse.json();
      }
    }

    if (!room?.url) {
      return res.status(502).json({ error: "Daily could not create or find that room. Try again in a moment." });
    }

    return res.status(200).json({ url: room.url, roomName });
  } catch {
    return res.status(502).json({ error: "Could not reach the meeting service. Please try again." });
  }
}
