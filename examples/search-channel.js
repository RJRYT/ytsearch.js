import { searchYouTube } from "ytsearch.js";

(async () => {
  console.log("=== Search Channels ===");
  const channels = await searchYouTube("lofi", {
    type: "channel",
    sort: "relevance",
    limit: 3,
  });
  channels.forEach((c, i) => console.log(i + 1, c.title, c.url));
})();
