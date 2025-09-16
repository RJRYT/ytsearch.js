const { searchYouTube, getPlaylistItems } = require("../dist/main.js");

(async function testCJS() {
  try {
    const query = "lofi hip hop";
    console.log("=== CJS Video Search Test ===");
    const videos = await searchYouTube(query, {
      type: "video",
      sort: "view_count",
      limit: 3,
    });
    videos.forEach((v, i) => console.log(i + 1, v.title, v.watchUrl));

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
      "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo"
    );
    console.log("Playlist Info:", playlist.playlist);

    let page = playlist;
    let pageNum = 1;
    do {
      console.log(`\n--- Page ${pageNum} Videos ---`);
      page.videos.forEach((v) =>
        console.log(`${v.index}. ${v.title} (${v.watchUrl})`)
      );
      page = page.hasNextPage ? await page.nextPage() : null;
      pageNum++;
    } while (page);
    console.log("All pages fetched successfully.");
  } catch (err) {
    console.error("CJS Test Error:", err);
  }
})();
