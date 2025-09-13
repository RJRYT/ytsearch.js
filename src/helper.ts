import type { ExtractedItem, Thumbnail } from "./types";
import { BaseUrl, PlaylistUrl, WatchUrl } from "./utils/constants";
import { findFirstMatchingValue, shortNumber, toSeconds } from "./utils/utils";
import axios from "axios";

/**
 * Formats a videoRenderer object into an ExtractedItem.
 * @param videoRenderer - The videoRenderer object from YouTube search results.
 * @returns {ExtractedItem | undefined} The formatted video item or undefined if invalid.
 */
export const FormatVedioObject = (
  videoRenderer: any
): ExtractedItem | undefined => {
  const id = videoRenderer.videoId;
  const title = videoRenderer.title.runs[0].text;
  const thumbnail: Thumbnail = {
    url: videoRenderer.thumbnail.thumbnails[0].url,
    width: videoRenderer.thumbnail.thumbnails[0].width,
    height: videoRenderer.thumbnail.thumbnails[0].height,
  };

  const viewCount =
    parseInt(
      (videoRenderer.viewCountText?.simpleText || "0").replace(/[^0-9]/g, "")
    ) || 0;
  const shortViewCount = shortNumber(viewCount);

  const duration = videoRenderer.lengthText?.simpleText || "00:00";
  const seconds = toSeconds(duration);

  const author = videoRenderer.ownerText?.runs?.[0];
  const authorUrl =
    author?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ||
    author?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;

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
};

/**
 * Formats a channelRenderer object into an ExtractedItem.
 * @param channelRenderer - The channelRenderer object from YouTube search results.
 * @returns {ExtractedItem | undefined} The formatted channel item or undefined if invalid.
 */
export const FormatChannelObject = (
  channelRenderer: any
): ExtractedItem | undefined => {
    const id = channelRenderer.channelId;
    const title = channelRenderer.title.simpleText;
    const thumbnail: Thumbnail = {
      url: channelRenderer.thumbnail.thumbnails[0].url,
      width: channelRenderer.thumbnail.thumbnails[0].width,
      height: channelRenderer.thumbnail.thumbnails[0].height,
    };

    const description =
      channelRenderer.descriptionSnippet?.runs
        ?.map((run: any) => run.text)
        .join("") || "";

    const subscriberCountText =
      channelRenderer.videoCountText?.simpleText || "0 subscribers";

    const authorUrl =
      channelRenderer.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ||
      channelRenderer.navigationEndpoint?.commandMetadata?.webCommandMetadata
        ?.url;

    const isVerified = !!(
      channelRenderer.ownerBadges &&
      JSON.stringify(channelRenderer.ownerBadges).includes("CHECK_CIRCLE_THICK")
    );
    const isArtist = !!(
      channelRenderer.ownerBadges &&
      JSON.stringify(channelRenderer.ownerBadges).includes("AUDIO_BADGE")
    );

    return {
      type: "channel",
      id,
      title,
      thumbnail,
      description,
      subscriberCount: subscriberCountText.replace(/ subscribers/g, ""),
      url: BaseUrl + authorUrl,
      verified: isVerified,
      isArtist,
    };
}

/**
 * Formats a playlistRenderer object into an ExtractedItem.
 * @param playlistRenderer - The playlistRenderer object from YouTube search results.
 * @returns {ExtractedItem | undefined} The formatted playlist item or undefined if invalid.
 */
export const FormatPlaylistObject = (
  playlistRenderer: any
): ExtractedItem | undefined => {
    const id = playlistRenderer.contentId;
    const title =
      playlistRenderer.metadata.lockupMetadataViewModel.title.content;

    const thumbnail: Thumbnail = {
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
      findFirstMatchingValue(playlistRenderer.contentImage, /\d+ lessons/) ||
      findFirstMatchingValue(playlistRenderer.contentImage, /\d+ episodes/);

    const videoCount = parseInt(videoCountText?.replace(/[^0-9]/g, "") || "0");

    const authorObject =
      playlistRenderer.metadata.lockupMetadataViewModel.metadata
        .contentMetadataViewModel.metadataRows[0].metadataParts[0].text;

    const authorUrl =
      authorObject?.commandRuns?.[0]?.onTap?.innertubeCommand?.browseEndpoint
        ?.canonicalBaseUrl ||
      authorObject?.commandRuns?.[0]?.onTap?.innertubeCommand?.commandMetadata
        ?.webCommandMetadata?.url;

    const authorVerified = !!findFirstMatchingValue(
      playlistRenderer.metadata,
      /CHECK_CIRCLE_FILLED/
    );
    const authorIsArtist = !!findFirstMatchingValue(
      playlistRenderer.metadata,
      /AUDIO_BADGE/
    );

    const contentType =
      videoCountText?.replace(/[^a-zA-Z ]/g, "").trim() || "videos";

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

/**
 * Fetches and parses HTML data to extract YouTube initial data.
 * @param url - The URL to fetch HTML data from.
 * @param params - The query parameters to include in the request.
 * @returns {Promise<any>} A promise that resolves to the parsed initial data object.
 * @throws If parsing fails or initial data is not found.
 */
export const fetchHtmlData = async (url: string, params: object): Promise<any> => {
    return (await axios.get(url, params)).data;
}