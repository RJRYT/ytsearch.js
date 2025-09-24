import { getPlaylistItems } from "ytsearch.js";

(async () => {
  console.log("=== Playlist Pagination Example ===");
  const playlist = await getPlaylistItems("PL4QNnZJr8sRPEJPqe7jZnsLPTBu1E3nIY");
  console.log("Playlist Info:", playlist.playlist);

  let page = playlist;
  let pageNum = 1;
  do {
    console.log(`\n--- Page ${pageNum} Videos ---`);
    page.videos.forEach((v) =>
      console.log(`${v.index}. ${v.title} (${v.url})`)
    );
    page = page.metadata.hasNextPage ? await page.nextPage() : null;
    pageNum++;
  } while (page);
  console.log("All pages fetched successfully.");
})();
