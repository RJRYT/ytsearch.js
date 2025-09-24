import { searchYouTube } from "ytsearch.js";

(async () => {
  console.log("=== Search Channels ===");
  const results = await searchYouTube("lofi", {
    type: "channel",
    sort: "relevance",
  });
  results.channels.forEach((c, i) => console.log(i + 1, c.title, c.url));
})();
