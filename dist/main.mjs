import search from "./search.mjs";

const WatchUrl = "https://www.youtube.com/watch?v=";
const Url = "https://www.youtube.com";

/**
 * Converts a time string (e.g., 'mm:ss' or 'hh:mm:ss') to total seconds.
 *
 * @param {string} timeString - The time string to convert.
 * @returns {number} The equivalent time in seconds, or 0 if invalid.
 */
const toSeconds = (timeString) => {
  const timeArray = timeString.split(":").reverse();
  let seconds = 0;
  for (let i = 0; i < timeArray.length; i++) {
    seconds += parseInt(timeArray[i], 10) * Math.pow(60, i);
  }
  return isNaN(seconds) ? 0 : seconds;
};

/**
 * Extracts and formats YouTube video data from search results.
 *
 * @param {string} query - The search query string.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of formatted video objects.
 * @throws {Error} If the query is invalid or empty.
 */
const extractData = async (query) => {
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error(
      "Invalid search query. Search query must be a non-empty string"
    );
  }

  const searchData = await search(query);

  const videoData = searchData
    .filter((item) => item.videoRenderer)
    .map((item) => {
      const videoRenderer = item.videoRenderer;
      const id = videoRenderer.videoId;
      const title = videoRenderer.title.runs[0].text;
      const thumbnail = {
        url: videoRenderer.thumbnail.thumbnails[0].url,
        width: videoRenderer.thumbnail.thumbnails[0].width,
        height: videoRenderer.thumbnail.thumbnails[0].height,
      };
      if (!videoRenderer.viewCountText.simpleText)
        videoRenderer.viewCountText.simpleText = "0";
      if (!videoRenderer.lengthText) {
        videoRenderer.lengthText = {};
        videoRenderer.lengthText.simpleText = "00:00";
      }
      const viewCount =
        parseInt(
          (videoRenderer.viewCountText || {})?.simpleText.replace(/[^0-9]/g, "")
        ) || 0;
      const shortViewCount = shortNumber(viewCount);
      const duration = videoRenderer.lengthText?.simpleText || "00:00";
      const seconds = toSeconds(duration);
      const author = videoRenderer.ownerText.runs[0];
      const authorUrl =
        author.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
        author.navigationEndpoint.commandMetadata.webCommandMetadata.url;
      const isVerified = !!(
        videoRenderer.ownerBadges &&
        JSON.stringify(videoRenderer.ownerBadges).includes("VERIFIED")
      );

      const publishedAt = videoRenderer.publishedTimeText?.simpleText || "";

      const watchUrl = WatchUrl + id;

      return {
        type: "video",
        id,
        title,
        thumbnail,
        viewCount,
        shortViewCount,
        duration,
        seconds,
        author: author
          ? {
              name: author.text,
              url: Url + authorUrl,
              verified: isVerified,
            }
          : null,
        watchUrl,
        publishedAt,
      };
    });

  return videoData;
};

/**
 * Formats a large number into a short string (e.g., 1500 -> '1.5K').
 *
 * @param {number} num - The number to format.
 * @returns {string} The shortened number string.
 */
function shortNumber(num) {
  const suffixes = ["", "K", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const scaled = num / Math.pow(10, magnitude * 3);
  const suffix = suffixes[magnitude];
  return scaled.toFixed(1) + suffix;
}

export default extractData;
