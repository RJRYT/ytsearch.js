import { searchYouTube, getPlaylistItems } from "../dist/main.mjs";

(async function testESM() {
  try {
    console.log("=== ESM Video Search Test ===");
    const videos = await searchYouTube("rick astley", {
      type: "video",
      sort: "view_count",
      limit: 3,
    });
    videos.forEach((v, i) => console.log(i + 1, v.title, v.watchUrl));

    console.log("\n=== ESM Channel Search Test ===");
    const channels = await searchYouTube("rick astley", {
      type: "channel",
      sort: "relevance",
      limit: 2,
    });
    channels.forEach((c, i) => console.log(i + 1, c.title, c.url));

    console.log("\n=== ESM Playlist Search Test ===");
    const playlists = await searchYouTube("rick roll mix", {
      type: "playlist",
      sort: "view_count",
      limit: 2,
    });
    playlists.forEach((p, i) => console.log(i + 1, p.title, p.url));

    console.log("\n=== ESM Playlist Pagination Test ===");
    const playlist = await getPlaylistItems(
      "PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY"
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
    console.error("ESM Test Error:", err);
  }
})();
