import { searchYouTube } from "ytsearch.js";

(async () => {
  const lives = await searchYouTube("lofi live", { type: "live", limit: 2 });
  lives.forEach((l) => console.log(l.title, l.isLive, l.concurrentViewers));
})();
