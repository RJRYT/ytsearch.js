import { getVideoDetails } from "ytsearch.js";

(async () => {
  console.log("=== Video Details ===");
  const videoDetails = await getVideoDetails("jfKfPfyJRdk");
  console.log(
    `${videoDetails.title} | ${videoDetails.viewsShort} Views | ${videoDetails.likesShort} Likes`
  );
})();
