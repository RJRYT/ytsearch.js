import search from "./search.mjs";
import {
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  BaseUrl,
  WatchUrl,
  ContentObjectKey,
  PlaylistUrl,
} from "./utils/constants.mjs";

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
const extractData = async (query, options = DefaultOptions) => {
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error(
      "Invalid search query. Search query must be a non-empty string"
    );
  }

  options = { ...DefaultOptions, ...options };
  if (!ExpectedTypes.includes(options.type)) {
    throw new Error(
      `Invalid type option. Expected one of: ${ExpectedTypes.join(", ")}`
    );
  }
  if (!ExpectedSorts.includes(options.sort)) {
    throw new Error(
      `Invalid sort option. Expected one of: ${ExpectedSorts.join(", ")}`
    );
  }

  const searchData = await search(query, options);

  const responseData = searchData
    .filter((item) => item.hasOwnProperty(ContentObjectKey[options.type]))
    .map((item) => {
      if (options.type == "video") {
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
            (videoRenderer.viewCountText || {})?.simpleText.replace(
              /[^0-9]/g,
              ""
            )
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
                url: BaseUrl + authorUrl,
                verified: isVerified,
              }
            : null,
          watchUrl,
          publishedAt,
        };
      } else if (options.type == "channel") {
        const channelRenderer = item.channelRenderer;
        const id = channelRenderer.channelId;
        const title = channelRenderer.title.simpleText;
        const thumbnail = {
          url: channelRenderer.thumbnail.thumbnails[0].url,
          width: channelRenderer.thumbnail.thumbnails[0].width,
          height: channelRenderer.thumbnail.thumbnails[0].height,
        };
        const description =
          channelRenderer.descriptionSnippet?.runs
            .map((run) => run.text)
            .join("") || "";
        const subscriberCountText =
          channelRenderer.videoCountText?.simpleText || "0 subscribers";
        const authorUrl =
          channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
          channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata
            .url;
        const isVerified = !!(
          channelRenderer.ownerBadges &&
          JSON.stringify(channelRenderer.ownerBadges).includes(
            "CHECK_CIRCLE_THICK"
          )
        );
        const isArtist = !!(
          channelRenderer.ownerBadges &&
          JSON.stringify(channelRenderer.ownerBadges).includes("AUDIO_BADGE")
        );

        const channelUrl = BaseUrl + authorUrl;

        return {
          type: "channel",
          id,
          title,
          thumbnail,
          description,
          subscriberCount: subscriberCountText.replace(/ subscribers/g, ""),
          url: channelUrl,
          verified: isVerified,
          isArtist,
        };
      } else if (options.type == "playlist") {
        const playlistRenderer = item.lockupViewModel;
        const id = playlistRenderer.contentId;
        const title =
          playlistRenderer.metadata.lockupMetadataViewModel.title.content;
        const thumbnail = {
          url: playlistRenderer.contentImage.collectionThumbnailViewModel
            .primaryThumbnail.thumbnailViewModel.image.sources[0].url,
          width:
            playlistRenderer.contentImage.collectionThumbnailViewModel
              .primaryThumbnail.thumbnailViewModel.image.sources[0].width,
          height:
            playlistRenderer.contentImage.collectionThumbnailViewModel
              .primaryThumbnail.thumbnailViewModel.image.sources[0].height,
        };
        const videoCountText =
          findFirstMatchingValue(playlistRenderer.contentImage, /\d+ videos/) ||
          findFirstMatchingValue(
            playlistRenderer.contentImage,
            /\d+ lessons/
          ) ||
          findFirstMatchingValue(playlistRenderer.contentImage, /\d+ episodes/);
        const videoCount = parseInt(
          videoCountText?.replace(/[^0-9]/g, "") || "0"
        );
        const authorObject =
          playlistRenderer.metadata.lockupMetadataViewModel.metadata
            .contentMetadataViewModel.metadataRows[0].metadataParts[0].text;
        const authorUrl =
          authorObject.commandRuns[0].onTap.innertubeCommand.browseEndpoint
            .canonicalBaseUrl ||
          authorObject.commandRuns[0].onTap.innertubeCommand.commandMetadata
            .webCommandMetadata.url;
        const authorVerified = !!findFirstMatchingValue(
          playlistRenderer.metadata,
          /CHECK_CIRCLE_FILLED/
        );
        const authorIsArtist = !!findFirstMatchingValue(
          playlistRenderer.metadata,
          /AUDIO_BADGE/
        );
        const contentType =
          videoCountText?.replace(/[^a-zA-Z ]/g, "").trim() || "vedios";
        return {
          type: "playlist",
          contentType,
          id,
          title,
          thumbnail,
          videoCount,
          author: authorObject
            ? {
                name: authorObject.content,
                url: BaseUrl + authorUrl,
                verified: authorVerified,
                isArtist: authorIsArtist,
              }
            : null,
          url: PlaylistUrl + id,
        };
      }
    });

  return responseData.slice(0, options.limit);
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

/**
 * Recursively finds the first string value in a JSON object that matches a regex.
 * Stops searching after the first match is found.
 * @param {*} data The data to search (can be an object, array, or primitive).
 * @param {RegExp} regex The regular expression to test against.
 * @returns {string | undefined} The first matching string, or undefined if no match is found.
 */
function findFirstMatchingValue(data, regex) {
  // If the data is an array, iterate over its elements
  if (Array.isArray(data)) {
    for (const item of data) {
      const match = findFirstMatchingValue(item, regex);
      if (match) {
        return match; // Return immediately if a match is found
      }
    }
  }
  // If the data is an object, iterate over its properties
  else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const match = findFirstMatchingValue(data[key], regex);
        if (match) {
          return match; // Return immediately if a match is found
        }
      }
    }
  }
  // If the data is a string, test it against the regex
  else if (typeof data === "string" && regex.test(data)) {
    return data; // Return the string immediately if it matches
  }

  // If no match is found in the current path, return undefined
  return undefined;
}

export default extractData;
