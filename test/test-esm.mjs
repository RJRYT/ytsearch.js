import { searchYouTube, getPlaylistItems } from "../dist/main.mjs";

async function testESM() {
  try {
    const query = "rick astley never gonna give you up";
    const results = await searchYouTube(query, { type: "video" });
    console.log("ESM Test Results:(Count:", results.length + ")");
    console.log(results[0]);
    if (results.length > 0 && results[0].type === "video") {
      console.log("Test Passed: Valid video data received.");
    } else {
      console.error("Test Failed: No valid results.");
    }
  } catch (error) {
    console.error("ESM Test Error:", error);
  }
}

// testESM();

(async () => {
  try {
    const playlist = await getPlaylistItems(
      "PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY"
    );

    console.log("Playlist Info:");
    console.log(playlist.playlist);

    console.log("\n--- First Page Videos ---");
    playlist.videos.forEach(vid => {
      console.log(`${vid.index}. ${vid.title} (${vid.watchUrl})`);
    });

    let page = playlist;
    let pageNum = 2;

    // Keep fetching until no more pages
    while (page.hasNextPage) {
      page = await page.nextPage();
      if (!page) break; // safety

      console.log(`\n--- Page ${pageNum} Videos ---`);
      page.videos.forEach(vid => {
        console.log(`${vid.index}. ${vid.title} (${vid.watchUrl})`);
      });

      pageNum++;
    }

    console.log("All pages fetched.");
  } catch (err) {
    console.error("Error:", err);
  }
})();
