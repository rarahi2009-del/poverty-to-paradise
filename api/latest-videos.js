// Fetches the 3 most recent videos from the P2P YouTube channel via RSS.
// No API key required. Vercel caches the result for 1 hour automatically.
//
// HOW TO FIND YOUR CHANNEL ID:
//  1. Go to youtube.com/@PovertyToParadise
//  2. Right-click the page → View Page Source
//  3. Press Cmd+F and search for: "channelId"
//  4. Copy the value that looks like: UCxxxxxxxxxxxxxxxxxx
//  5. Paste it below replacing PASTE_CHANNEL_ID_HERE

const CHANNEL_ID = 'UCP53BR4kiikf_ZiW1t-U1VQ';

// Fallback videos shown if the RSS feed fails for any reason
const FALLBACK_IDS = ['DUWYTlxdNMc', 'P7xL4TmrkFI', '4fsnnTHimew'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (CHANNEL_ID === 'PASTE_CHANNEL_ID_HERE') {
    return res.json({ videoIds: FALLBACK_IDS, fallback: true });
  }

  try {
    const feed = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!feed.ok) throw new Error('RSS fetch failed');

    const xml = await feed.text();
    const videoIds = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)]
      .slice(0, 3)
      .map(m => m[1]);

    if (videoIds.length === 0) throw new Error('No video IDs found in feed');

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.json({ videoIds });
  } catch {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({ videoIds: FALLBACK_IDS, fallback: true });
  }
}
