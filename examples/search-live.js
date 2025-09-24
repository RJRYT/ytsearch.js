import { searchYouTube } from "ytsearch.js";

(async () => {
  const results = await searchYouTube("lofi live", { type: "live" });
  results.lives.forEach((l) =>
    console.log(l.title, l.isLive, l.concurrentViewers)
  );
})();
