import type { ExtractedItem, RawSearchResult, Thumbnail } from "./types";
import {
  BaseUrl,
  DefaultImageName,
  ImageBaseUrl,
  PlayListApiUrl,
  PlaylistUrl,
  WatchUrl,
} from "./utils/constants";
import {
  findFirstMatchingValue,
  getNormalizedQueryFreeUrl,
  shortNumber,
  toSeconds,
} from "./utils/utils";
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
  const image = getNormalizedQueryFreeUrl(ImageBaseUrl + id + DefaultImageName);

  return {
    type: "video",
    id,
    title,
    image,
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
    url: getNormalizedQueryFreeUrl(channelRenderer.thumbnail.thumbnails[0].url),
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
    image: thumbnail.url,
    thumbnail,
    description,
    subscriberCount: subscriberCountText.replace(/ subscribers/g, ""),
    url: BaseUrl + authorUrl,
    verified: isVerified,
    isArtist,
  };
};

/**
 * Formats a playlistRenderer object into an ExtractedItem.
 * @param playlistRenderer - The playlistRenderer object from YouTube search results.
 * @returns {ExtractedItem | undefined} The formatted playlist item or undefined if invalid.
 */
export const FormatPlaylistObject = (
  playlistRenderer: any
): ExtractedItem | undefined => {
  const id = playlistRenderer.contentId;
  const title = playlistRenderer.metadata.lockupMetadataViewModel.title.content;

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
    image: getNormalizedQueryFreeUrl(thumbnail.url),
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
};

/**
 * Fetches and parses HTML data to extract YouTube initial data.
 * @param url - The URL to fetch HTML data from.
 * @param params - The query parameters to include in the request.
 * @returns {Promise<any>} A promise that resolves to the parsed initial data object.
 * @throws If parsing fails or initial data is not found.
 */
export const fetchHtmlData = async (
  url: string,
  params: object
): Promise<any> => {
  return (await axios.get(url, params)).data;
};

export function parseAlerts(
  alerts: any[]
): { type: string; message: string }[] {
  return alerts.map((a) => {
    if (a.alertRenderer) {
      // Pure error
      return {
        type: a.alertRenderer.type ?? "ERROR",
        message:
          a.alertRenderer.text?.runs?.map((r: any) => r.text).join(" ") ??
          "Unknown playlist error.",
      };
    } else if (a.alertWithButtonRenderer) {
      // Info / warning with dismiss button
      return {
        type: a.alertWithButtonRenderer.type ?? "INFO",
        message:
          a.alertWithButtonRenderer.text?.simpleText ??
          "Unknown playlist info.",
      };
    }
    return { type: "UNKNOWN", message: "Unrecognized alert format." };
  });
}

export const FormatPlaylistVedioObject = (
  videoRenderer: any
): any | undefined => {
  const id = videoRenderer.videoId;
  const title = videoRenderer.title.runs[0].text;
  const thumbnail: Thumbnail = {
    url: videoRenderer.thumbnail.thumbnails[0].url,
    width: videoRenderer.thumbnail.thumbnails[0].width,
    height: videoRenderer.thumbnail.thumbnails[0].height,
  };
  const index = videoRenderer.index.simpleText;

  const views = videoRenderer.videoInfo?.runs[0]?.text || "";

  const duration = videoRenderer.lengthText?.simpleText || "00:00";
  const seconds = toSeconds(duration);

  const author = videoRenderer.shortBylineText?.runs?.[0];
  const authorUrl =
    author?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ||
    author?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;

  const publishedAt = videoRenderer.videoInfo?.runs[2]?.text || "";
  const playlistId = videoRenderer.navigationEndpoint.watchEndpoint.playlistId;
  const watchUrl =
    BaseUrl +
      videoRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url ||
    `/watch?v=${id}&list=&${playlistId}` ||
    `/watch?v=${id}`;
  const image = getNormalizedQueryFreeUrl(ImageBaseUrl + id + DefaultImageName);

  return {
    type: "video",
    id,
    index,
    title,
    image,
    thumbnail,
    views,
    duration,
    seconds,
    author: author
      ? {
          name: author.text,
          url: BaseUrl + authorUrl,
        }
      : null,
    watchUrl,
    publishedAt,
  };
};

export const FormatPlayListInfoObject = (
  playlistInfo: any,
  playListID: string
) => {
  return {
    id: playListID,
    title: playlistInfo.pageTitle,
    description:
      playlistInfo.content.pageHeaderViewModel.description
        .descriptionPreviewViewModel.description.content,
    thumbnail: {
      url: playlistInfo.content.pageHeaderViewModel.heroImage
        .contentPreviewImageViewModel.image.sources[0].url,
      width:
        playlistInfo.content.pageHeaderViewModel.heroImage
          .contentPreviewImageViewModel.image.sources[0].width,
      height:
        playlistInfo.content.pageHeaderViewModel.heroImage
          .contentPreviewImageViewModel.image.sources[0].height,
    },
    image:
      playlistInfo.content.pageHeaderViewModel.heroImage
        .contentPreviewImageViewModel.image.sources[0].url,
    author: {
      name: playlistInfo.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[0].metadataParts[0].avatarStack.avatarStackViewModel.text.content.replace(
        /by /g,
        ""
      ),
      url:
        BaseUrl +
        playlistInfo.content.pageHeaderViewModel.metadata
          .contentMetadataViewModel.metadataRows[0].metadataParts[0].avatarStack
          .avatarStackViewModel.text.commandRuns[0].onTap.innertubeCommand
          .browseEndpoint.canonicalBaseUrl,
      logo: playlistInfo.content.pageHeaderViewModel.metadata
        .contentMetadataViewModel.metadataRows[0].metadataParts[0].avatarStack
        .avatarStackViewModel.avatars[0].avatarViewModel.image.sources[0].url,
    },
    videoCount:
      playlistInfo.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[1].metadataParts[1].text.content.replace(
        / videos/g,
        ""
      ),
    viewsCount:
      playlistInfo.content.pageHeaderViewModel.metadata.contentMetadataViewModel.metadataRows[1].metadataParts[2].text.content.replace(
        / views/g,
        ""
      ),
  };
};

export const fetchPlaylistNextChunk = async (
  apiToken: string,
  continueToken: string,
  clientVersion: string
) => {
  const response = await axios.post(
    PlayListApiUrl + apiToken,
    {
      continuation: continueToken,
      context: {
        client: {
          utcOffsetMinutes: 0,
          gl: "US",
          hl: "en",
          clientName: "WEB",
          clientVersion: clientVersion,
        },
        user: {},
        request: {},
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; rv:140.0) Gecko/20100101 Firefox/140.0",
      },
    }
  );
  const initialData = response.data;

  let playlistData: any[] =
    initialData.onResponseReceivedActions[0].appendContinuationItemsAction
      .continuationItems || [];

  if (!playlistData.length) {
    throw new Error("No videos found in playlist.");
  }

  const videos = playlistData.filter((c) =>
    c.hasOwnProperty("playlistVideoRenderer")
  );

  const ContinueObject = playlistData.filter((c) =>
    c.hasOwnProperty("continuationItemRenderer")
  );

  if (ContinueObject) {
    continueToken =
      ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint
        ?.continuationCommand?.token ||
      ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint?.commandExecutorCommand?.commands?.find(
        (c: any) => c.hasOwnProperty("continuationCommand")
      )?.continuationCommand?.token ||
      null;
  } else continueToken = ""; 

  return {
    apiToken,
    clientVersion,
    continueToken,
    videos: videos as RawSearchResult[],
  };
};
