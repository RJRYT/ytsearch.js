import { searchYouTube } from "ytsearch.js";

(async () => {
  const results = await searchYouTube("Marvel", { type: "movie" });
  results.movies.forEach((m) =>
    console.log(m.title, m.duration, m.author.name)
  );
})();
