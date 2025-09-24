import { searchYouTube } from "ytsearch.js";

(async () => {
  console.log("=== Search Playlists ===");
  const results = await searchYouTube("study music playlist", {
    type: "playlist",
    sort: "view_count",
  });
  results.playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));
})();
