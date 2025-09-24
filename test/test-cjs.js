const {
  searchYouTube,
  getPlaylistItems,
  getVideoDetails,
} = require("../dist/main.js");
// const { searchYouTube, getPlaylistItems, getVideoDetails } = require("ytsearch.js");

(async function testCJS() {
  try {
    const query = "lofi hip hop";
    console.log("=== CJS Video Search Test ===");
    const videos = await searchYouTube(query, {
      type: "video",
      sort: "view_count",
      limit: 3,
    });
    videos.forEach((v, i) => console.log(i + 1, v.title, v.url));

    console.log("\n=== CJS Channel Search Test ===");
    const channels = await searchYouTube(query, {
      type: "channel",
      sort: "relevance",
      limit: 2,
    });
    channels.forEach((c, i) => console.log(i + 1, c.title, c.url));

    console.log("\n=== CJS Playlist Search Test ===");
    const playlists = await searchYouTube(query, {
      type: "playlist",
      sort: "view_count",
      limit: 2,
    });
    playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));

    console.log("\n=== CJS Playlist Pagination Test ===");
    const playlist = await getPlaylistItems(
      "PL6fhs6TSspZt_s0zL26NmFir5ATCF8w7G"
    );
    console.log("Playlist Info:", playlist.playlist);

    let page = playlist;
    let pageNum = 1;
    do {
      console.log(`\n--- Page ${pageNum} Videos ---`);
      page.videos.forEach((v) =>
        console.log(`${v.index}. ${v.title} (${v.url})`)
      );
      page = page.hasNextPage ? await page.nextPage() : null;
      pageNum++;
    } while (page);

    console.log("\n=== ESM Video Details Test ===");
    const videoDetails = await getVideoDetails("jfKfPfyJRdk");
    console.log(
      `${videoDetails.title} | ${videoDetails.viewsShort} Views | ${videoDetails.likesShort} Likes`
    );
    console.log("All pages fetched successfully.");
  } catch (err) {
    console.error("CJS Test Error:", err);
  }
})();
