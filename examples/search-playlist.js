import { searchYouTube } from "ytsearch.js";

(async () => {
  console.log("=== Search Playlists ===");
  const playlists = await searchYouTube("study music playlist", {
    type: "playlist",
    sort: "view_count",
    limit: 2,
  });
  playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));
})();
