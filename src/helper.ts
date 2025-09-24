import type {
  SearchResult,
  PlaylistInfo,
  PlaylistVideo,
  RawResult,
  RawPlaylistResult,
  Thumbnail,
  RawVideoDetails,
  VideoDetailsResult,
  VideoResult,
  ChannelResult,
  PlaylistResult,
  RawSearchResult,
} from "./types";
import {
  BaseUrl,
  DefaultImageName,
  ImageBaseUrl,
  PlayListApiUrl,
  SearchApiUrl,
  PlaylistUrl,
  UserAgent,
  WatchUrl,
} from "./utils/constants";
import { fetchApiData } from "./utils/http";
import { YtSearchError } from "./utils/errors";
import {
  findFirstMatchingValue,
  formatDate,
  formatDuration,
  getNormalizedQueryFreeUrl,
  shortNumber,
  toSeconds,
} from "./utils/utils";

/**
 * Formats a videoRenderer object into an SearchResult.
 * @param videoRenderer - The videoRenderer object from YouTube search results.
 * @returns {SearchResult | undefined} The formatted video item or undefined if invalid.
 */
export const FormatVedioObject = (videoRenderer: RawResult): VideoResult => {
  const id = videoRenderer.videoId;
  const title = videoRenderer.title.runs[0].text;
  const thumbnail: Thumbnail = {
    url: videoRenderer.thumbnail.thumbnails[0].url,
    width: videoRenderer.thumbnail.thumbnails[0].width,
    height: videoRenderer.thumbnail.thumbnails[0].height,
  };

  const viewCount =
    parseInt(
      (
        videoRenderer.viewCountText?.simpleText ||
        videoRenderer.viewCountText?.runs?.[0]?.text ||
        "0"
      ).replace(/[^0-9]/g, "")
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
  const isArtist = !!(
    videoRenderer.ownerBadges &&
    JSON.stringify(videoRenderer.ownerBadges).includes("ARTIST")
  );
  const isLive = !!(
    videoRenderer.badges &&
    JSON.stringify(videoRenderer.badges).includes("LIVE_NOW")
  );

  const publishedAt = videoRenderer.publishedTimeText?.simpleText || "";
  const url = WatchUrl + id;
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
          isArtist,
        }
      : null,
    url,
    publishedAt,
    isLive,
  };
};

/**
 * Formats a channelRenderer object into an SearchResult.
 * @param channelRenderer - The channelRenderer object from YouTube search results.
 * @returns {SearchResult | undefined} The formatted channel item or undefined if invalid.
 */
export const FormatChannelObject = (
  channelRenderer: RawResult
): ChannelResult => {
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
 * Formats a playlistRenderer object into an SearchResult.
 * @param playlistRenderer - The playlistRenderer object from YouTube search results.
 * @returns {SearchResult | undefined} The formatted playlist item or undefined if invalid.
 */
export const FormatPlaylistObject = (
  playlistRenderer: RawResult
): PlaylistResult => {
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
 * Parses raw YouTube alert renderers into a simplified, uniform structure.
 *
 * @function parseAlerts
 * @param {any[]} alerts - Raw alert objects from YouTube API response.
 *
 * @returns {Array<{ type: string, message: string }>} An array of parsed alerts, each with:
 * - `type` {string} - Alert type (e.g., `"ERROR"`, `"INFO"`, `"WARNING"`, `"UNKNOWN"`).
 * - `message` {string} - Human-readable alert message extracted from the renderer.
 *
 * @example
 * // Input from YouTube API
 * const rawAlerts = [
 *   {
 *     alertRenderer: {
 *       type: "ERROR",
 *       text: { runs: [{ text: "This playlist is unavailable." }] }
 *     }
 *   },
 *   {
 *     alertWithButtonRenderer: {
 *       type: "INFO",
 *       text: { simpleText: "Playlist updated successfully." }
 *     }
 *   }
 * ];
 *
 * // Output
 * const parsed = parseAlerts(rawAlerts);
 * console.log(parsed);
 * // [
 * //   { type: "ERROR", message: "This playlist is unavailable." },
 * //   { type: "INFO", message: "Playlist updated successfully." }
 * // ]
 */
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

/**
 * Formats a raw YouTube `playlistVideoRenderer` object into a normalized structure.
 *
 * @function FormatPlaylistVedioObject
 * @param {any} videoRenderer - Raw `playlistVideoRenderer` object from YouTube API.
 *
 * @returns {PlaylistVideo | undefined} A normalized playlist video object, or `undefined`
 * if input is invalid.
 */
export const FormatPlaylistVedioObject = (
  videoRenderer: any
): PlaylistVideo => {
  const id = videoRenderer.videoId;
  const title = videoRenderer.title.runs[0].text ?? "Untitled";
  const thumbnail: Thumbnail = {
    url: videoRenderer.thumbnail.thumbnails[0].url ?? "",
    width: videoRenderer.thumbnail.thumbnails[0].width ?? 0,
    height: videoRenderer.thumbnail.thumbnails[0].height ?? 0,
  };
  const index = videoRenderer.index.simpleText ?? "";

  const views = videoRenderer.videoInfo?.runs[0]?.text ?? "";

  const duration = videoRenderer.lengthText?.simpleText ?? "00:00";
  const seconds = toSeconds(duration);

  const author = videoRenderer.shortBylineText?.runs?.[0];
  const authorUrl =
    author?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ||
    author?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;

  const publishedAt = videoRenderer.videoInfo?.runs[2]?.text ?? "";
  const playlistId = videoRenderer.navigationEndpoint.watchEndpoint.playlistId;
  const url =
    BaseUrl +
      (videoRenderer.navigationEndpoint?.commandMetadata?.webCommandMetadata
        ?.url ?? `/watch?v=${id}${playlistId ? `&list=${playlistId}` : ""}`) ||
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
    url,
    publishedAt,
  } as PlaylistVideo;
};

/**
 * Formats raw YouTube playlist metadata into a normalized structure.
 *
 * @function FormatPlayListInfoObject
 * @param {any} playlistInfo - Raw YouTube `playlistInfo` object.
 * @param {string} playListID - The playlist ID.
 *
 * @returns {PlaylistInfo} A normalized playlist info object.
 */
export const FormatPlayListInfoObject = (
  playlistInfo: any,
  playListID: string
): PlaylistInfo => {
  const videoCountStr =
    playlistInfo.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[1]?.metadataParts?.[1]?.text?.content?.replace(
      / videos/g,
      ""
    ) ?? "0";

  const videoCount = parseInt(videoCountStr, 10) || 0;
  const expectedPages = Math.ceil(videoCount / 100);

  return {
    id: playListID,
    title: playlistInfo.pageTitle ?? "",
    description:
      playlistInfo.content?.pageHeaderViewModel?.description
        ?.descriptionPreviewViewModel?.description?.content ?? "",
    thumbnail: {
      url:
        playlistInfo.content?.pageHeaderViewModel?.heroImage
          ?.contentPreviewImageViewModel?.image?.sources?.[0]?.url ?? "",
      width:
        playlistInfo.content?.pageHeaderViewModel?.heroImage
          ?.contentPreviewImageViewModel?.image?.sources?.[0]?.width ?? 0,
      height:
        playlistInfo.content?.pageHeaderViewModel?.heroImage
          ?.contentPreviewImageViewModel?.image?.sources?.[0]?.height ?? 0,
    },
    image:
      playlistInfo.content?.pageHeaderViewModel?.heroImage
        ?.contentPreviewImageViewModel?.image?.sources?.[0]?.url ?? "",
    author: {
      name:
        playlistInfo.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.avatarStack?.avatarStackViewModel?.text?.content?.replace(
          /by /g,
          ""
        ) ?? "",
      url:
        BaseUrl +
          playlistInfo.content?.pageHeaderViewModel?.metadata
            ?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]
            ?.avatarStack?.avatarStackViewModel?.text?.commandRuns?.[0]?.onTap
            ?.innertubeCommand?.browseEndpoint?.canonicalBaseUrl || "",
      logo:
        playlistInfo.content?.pageHeaderViewModel?.metadata
          ?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]
          ?.avatarStack?.avatarStackViewModel?.avatars?.[0]?.avatarViewModel
          ?.image?.sources?.[0]?.url ?? "",
    },
    url: PlaylistUrl + playListID,
    videoCount: videoCountStr,
    viewsCount:
      playlistInfo.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[1]?.metadataParts?.[2]?.text?.content?.replace(
        / views/g,
        ""
      ) ?? "0",
    expectedPages,
  } as PlaylistInfo;
};

/**
 * Fetches the next set of playlist items (continuation) from YouTube.
 *
 * @function fetchPlaylistNextChunk
 * @param {string} apiToken - YouTube API token (from initial playlist response).
 * @param {string | null} continueToken - Token for fetching the next page of results.
 * @param {string} clientVersion - YouTube client version.
 *
 * @returns {Promise<RawPlaylistResult>} Object containing:
 * - `apiToken` {string} - Same API token passed in.
 * - `clientVersion` {string} - Same client version passed in.
 * - `continueToken` {string | null} - Token for the next page (if any).
 * - `videos` {RawResult[]} - Raw video renderer objects.
 *
 * @throws {YtSearchError} When no videos are found in the continuation response.
 */
export const fetchPlaylistNextChunk = async (
  apiToken: string,
  continueToken: string | null,
  clientVersion: string
): Promise<RawPlaylistResult> => {
  const initialData = await fetchApiData(
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
        "User-Agent": UserAgent,
      },
    }
  );

  const playlistData: any[] =
    initialData?.onResponseReceivedActions?.[0]?.appendContinuationItemsAction
      ?.continuationItems || [];

  if (!playlistData.length) {
    throw new YtSearchError(
      "NO_PLAYLIST_RESULTS",
      "No videos found in playlist."
    );
  }

  const videos: RawResult[] = playlistData.filter((c) =>
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
  } else continueToken = null;

  return {
    apiToken,
    clientVersion,
    continueToken,
    videos,
  };
};

export const fetchSearchNextChunk = async (
  apiToken: string,
  continueToken: string | null,
  clientVersion: string
): Promise<RawSearchResult> => {
  const initialData = await fetchApiData(
    SearchApiUrl + apiToken,
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
        "User-Agent": UserAgent,
      },
    }
  );

  const searchData: any[] =
    initialData?.onResponseReceivedCommands?.[0]?.appendContinuationItemsAction
      ?.continuationItems || [];

  const ContinueObject = searchData.filter((c) =>
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
  } else continueToken = null;

  const ResultObject = searchData.filter((c) =>
    c.hasOwnProperty("itemSectionRenderer")
  );

  return {
    apiToken,
    clientVersion,
    continueToken,
    result: ResultObject?.[0]?.itemSectionRenderer?.contents || [],
    estimatedResults: parseInt(initialData?.estimatedResults || "0"),
  };
};

/**
 * Normalizes raw YouTube video data into a standardized {@link VideoDetailsResult} object.
 *
 * This function takes the raw response structures returned by YouTube
 * (`videoDetails`, `microFormat`, `videoPrimaryInfo`, `videoSecondaryInfo`) and
 * safely traverses them to extract consistent fields like title, description,
 * channel info, likes, etc.
 *
 * @param videoInfo - Raw video data object ({@link RawVideoDetails}) fetched from YouTube
 * @param videoID - The YouTube video ID
 * @returns A fully formatted {@link VideoDetailsResult} object with normalized fields
 */
export const FormatVideoObject = (
  videoInfo: RawVideoDetails,
  videoID: string
): VideoDetailsResult => {
  return {
    id: videoID,
    title:
      videoInfo?.videoPrimaryInfo?.title?.runs?.[0]?.text ??
      videoInfo?.videoDetails?.title ??
      videoInfo?.microFormat?.title?.simpleText ??
      "",
    description:
      videoInfo?.videoDetails?.shortDescription ??
      videoInfo?.microFormat?.description?.simpleText ??
      "",
    duration: formatDuration(
      parseInt(videoInfo?.videoDetails?.lengthSeconds ?? "0")
    ),
    views: parseInt(videoInfo?.videoDetails?.viewCount ?? "0"),
    viewsShort: shortNumber(
      parseInt(videoInfo?.videoDetails?.viewCount ?? "0")
    ),
    uploadDate:
      formatDate(videoInfo?.microFormat?.uploadDate) ??
      videoInfo?.videoPrimaryInfo?.dateText?.simpleText ??
      "",
    image: videoInfo?.microFormat?.thumbnail?.thumbnails?.[0]?.url ?? "",
    thumbnail: videoInfo?.microFormat?.thumbnail?.thumbnails?.[0] ??
      videoInfo?.videoDetails?.thumbnail?.thumbnails?.[0] ?? {
        url: "",
        width: 0,
        height: 0,
      },
    channel: {
      id:
        videoInfo?.videoDetails?.channelId ??
        videoInfo?.microFormat?.externalChannelId ??
        videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer
          ?.navigationEndpoint?.browseEndpoint?.browseId ??
        "",
      name:
        videoInfo?.videoDetails?.author ??
        videoInfo?.microFormat?.ownerChannelName ??
        videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer?.title
          ?.runs?.[0]?.text ??
        "",
      url:
        videoInfo?.microFormat?.ownerProfileUrl ??
        BaseUrl +
          (videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer
            ?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url ??
            videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer
              ?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl ??
            ""),
      avatar:
        videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer?.thumbnail
          ?.thumbnails?.[0]?.url ?? "",
      subscribers:
        videoInfo?.videoSecondaryInfo?.owner?.videoOwnerRenderer?.subscriberCountText?.simpleText?.replace(
          / subscribers/g,
          ""
        ) ?? "",
      verified: !!findFirstMatchingValue(
        videoInfo?.videoSecondaryInfo ?? {},
        /CHECK_CIRCLE_FILLED/
      ),
      isArtist: !!findFirstMatchingValue(
        videoInfo?.videoSecondaryInfo ?? {},
        /AUDIO_BADGE/
      ),
    },
    likes: parseInt(videoInfo?.microFormat?.likeCount ?? "0"),
    likesShort: shortNumber(parseInt(videoInfo?.microFormat?.likeCount ?? "0")),
    isLive: videoInfo?.videoDetails?.isLiveContent ?? false,
    isPrivate: videoInfo?.videoDetails?.isPrivate ?? false,
    isUnlisted: videoInfo?.microFormat?.isUnlisted ?? false,
    category: videoInfo?.microFormat?.category ?? "",
    url: videoInfo?.microFormat?.canonicalUrl ?? "",
    allowRatings: videoInfo?.videoDetails?.allowRatings ?? false,
  };
};
