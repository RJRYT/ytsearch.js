import { searchYouTube } from "ytsearch.js";

(async () => {
  console.log("=== Search Videos (Sorted by View Count) ===");
  const results = await searchYouTube("lofi hip hop", {
    type: "video",
    sort: "view_count",
  });
  results.videos.forEach((v, i) => console.log(i + 1, v.title, v.url));
})();
