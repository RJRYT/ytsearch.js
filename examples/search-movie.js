import { searchYouTube } from "ytsearch.js";

(async () => {
  const movies = await searchYouTube("Marvel", { type: "movie", limit: 3 });
  movies.forEach((m) => console.log(m.title, m.duration, m.author.name));
})();
