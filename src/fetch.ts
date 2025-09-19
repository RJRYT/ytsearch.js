import type {
  SearchOptions,
  SearchType,
  RawSearchResult,
  SearchPlaylistType,
  SortType,
  VideoRawDetails,
} from "./types";
import {
  TypeFilters,
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  SearchUrl,
  ContentObjectKey,
  PlaylistUrl,
  SortFilters,
  WatchUrl,
  UserAgent,
} from "./utils/constants";
import { parseAlerts } from "./helper";
import { fetchHtmlData } from "./utils/http";
import { getNormalizedQueryFreeUrl } from "./utils/utils";
import { YtSearchError } from "./utils/errors";

/**
 * Searches YouTube for videos, channels, or playlists.
 *
 * @param query - The search query string.
 * @param options - Search options (type, sort, limit).
 * @returns A promise that resolves to raw YouTube renderer objects.
 * @throws If query or options are invalid, or if no results are found.
 */
const fetchResultDataFromYT = async (
  query: string,
  options: SearchOptions = DefaultOptions
): Promise<RawSearchResult[]> => {
  if (typeof query !== "string" || query.trim() === "") {
    throw new YtSearchError(
      "INVALID_QUERY",
      "Invalid search query. Must be a non-empty string.",
      { query }
    );
  }

  options = { ...DefaultOptions, ...options };

  if (!ExpectedTypes.includes(options.type!)) {
    throw new YtSearchError(
      "INVALID_TYPE",
      `Invalid type option. Expected one of: ${ExpectedTypes.join(", ")}`,
      { options }
    );
  }
  if (!ExpectedSorts.includes(options.sort!)) {
    throw new YtSearchError(
      "INVALID_SORT",
      `Invalid sort option. Expected one of: ${ExpectedSorts.join(", ")}`,
      { options }
    );
  }

  const _queryOptions = {
    app: "desktop",
    search_query: query,
    sp:
      options.sort === ExpectedSorts[0]
        ? TypeFilters[options.type as SearchType]
        : SortFilters[options.type as SearchType][options.sort as SortType],
  };

  try {
    const html = await fetchHtmlData(SearchUrl, {
      params: _queryOptions,
    });

    // Parse ytInitialData from the HTML response
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!match) {
      throw new YtSearchError(
        "PARSE_ERROR",
        "Failed to parse YouTube initial data.",
        { query }
      );
    }

    const initialData = JSON.parse(match[1]!);

    let data =
      initialData.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;

    let index: number | undefined;
    let confirm = false;

    for (let i = 0; i < data.length; i++) {
      if (confirm) break;
      if (data[i].hasOwnProperty("itemSectionRenderer")) {
        for (let j = 0; j < data[i].itemSectionRenderer.contents.length; j++) {
          if (
            data[i].itemSectionRenderer.contents[j].hasOwnProperty(
              ContentObjectKey[options.type!]
            )
          ) {
            index = i;
            confirm = true;
            break;
          }
        }
      }
    }

    if (
      index !== undefined &&
      typeof data[index] === "object" &&
      data[index].hasOwnProperty("itemSectionRenderer")
    ) {
      return data[index].itemSectionRenderer.contents as RawSearchResult[];
    } else {
      throw new YtSearchError("NO_RESULTS", `No results were found.`, {
        query,
        options,
      });
    }
  } catch (error) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in fetchResultDataFromYT: ${String(error)}`,
      {
        query,
        options,
        originalError: error,
      }
    );
  }
};

/**
 * Fetches playlist metadata and the first page of videos from YouTube.
 *
 * @param playListID - The playlist ID (e.g. `"PLBCF2DAC6FFB574DE"`).
 * @returns {Promise<SearchPlaylistType>} Object containing:
 * - `apiToken` {string} - Extracted YouTube API token.
 * - `clientVersion` {string} - YouTube client version (used in API requests).
 * - `continueToken` {string | null} - Token for the next page of videos (if any).
 * - `playlistInfo` {unknown} - Playlist metadata (parsed from header).
 * - `videos` {RawSearchResult[]} - List of raw video renderer objects.
 *
 * @throws {YtSearchError} If:
 * - `playListID` is invalid.
 * - YouTube HTML could not be parsed.
 * - Playlist is invalid or has no videos.
 * - A YouTube error alert is returned.
 */
const fetchPlayListDataFromYT = async (
  playListID: string
): Promise<SearchPlaylistType> => {
  if (typeof playListID !== "string" || playListID.trim() === "") {
    throw new YtSearchError(
      "INVALID_PLAYLIST",
      "Invalid playList ID. It must be a non-empty string.",
      { playListID }
    );
  }

  const _queryOptions = {
    app: "desktop",
    list: playListID,
  };

  try {
    const html = await fetchHtmlData(getNormalizedQueryFreeUrl(PlaylistUrl), {
      params: _queryOptions,
    });

    // Parse ytInitialData from the HTML response
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!match) {
      throw new YtSearchError(
        "PARSE_ERROR",
        "Failed to parse YouTube initial data Or Invalid playlist.",
        { playListID }
      );
    }

    const initialData = JSON.parse(match[1]!);

    // Check if response contains error alerts
    if (initialData.alerts?.length) {
      const alerts = parseAlerts(initialData.alerts);

      // Find if any are errors
      const errorAlert = alerts.find((a) => a.type === "ERROR");
      if (errorAlert) {
        throw new YtSearchError("YOUTUBE_ERROR", errorAlert.message);
      }

      // Otherwise, log warnings but continue
      const warnings = alerts.filter((a) => a.type !== "ERROR");
      if (warnings.length) {
        console.warn(
          "Playlist warnings:",
          warnings.map((w) => w.message)
        );
      }
    }

    // Navigate down to playlist contents
    const tabs =
      initialData.contents.twoColumnBrowseResultsRenderer?.tabs ?? [];
    const sectionList =
      tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents ?? [];

    const playlistInfo = initialData.header.pageHeaderRenderer;

    // Find playlistVideoListRenderer
    let playlistData: any[] = [];
    for (const section of sectionList) {
      if (section.itemSectionRenderer?.contents) {
        for (const content of section.itemSectionRenderer.contents) {
          if (content.playlistVideoListRenderer) {
            playlistData = content.playlistVideoListRenderer.contents;
            break;
          }
        }
      }
    }

    if (!playlistData.length) {
      throw new YtSearchError(
        "NO_PLAYLIST_RESULTS",
        "No videos found in playlist.",
        { playListID }
      );
    }

    // Filter out continuation tokens (they appear for load-more)
    const videos: RawSearchResult[] = playlistData.filter((c) =>
      c.hasOwnProperty("playlistVideoRenderer")
    );
    const ContinueObject = playlistData.filter((c) =>
      c.hasOwnProperty("continuationItemRenderer")
    );

    let continueToken: string | null = null;
    if (ContinueObject.length > 0) {
      continueToken =
        ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint
          ?.continuationCommand?.token ??
        ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint?.commandExecutorCommand?.commands?.find(
          (c: any) => c.hasOwnProperty("continuationCommand")
        )?.continuationCommand?.token ??
        null;
    }

    let apiToken =
      html.split('INNERTUBE_API_KEY":"')[1]?.split('"')[0] ??
      html.split('innertubeApiKey":"')[1]?.split('"')[0];

    let clientVersion =
      html.split('"INNERTUBE_CLIENT_VERSION":"')[1]?.split('"')[0] ??
      html.split('"clientVersion":"')[1]?.split('"')[0] ??
      "2.20250911.00.00";

    return {
      apiToken,
      clientVersion,
      continueToken,
      playlistInfo,
      videos,
    };
  } catch (error: unknown) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in fetchPlayListDataFromYT: ${String(error)}`,
      {
        playListID,
        originalError: error,
      }
    );
  }
};

/**
 * Fetches raw video data from YouTube watch page.
 *
 * @param videoID - YouTube video ID
 * @returns Parsed raw details including videoDetails, microFormat,
 *          primary info renderer and secondary info renderer
 * @throws {YtSearchError} When videoID is invalid, parsing fails, or network errors occur
 */
const fetchVideoDataFromYT = async (
  videoID: string
): Promise<VideoRawDetails> => {
  if (typeof videoID !== "string" || videoID.trim() === "") {
    throw new YtSearchError(
      "INVALID_VIDEO",
      "Invalid video ID. It must be a non-empty string.",
      { videoID }
    );
  }

  const _queryOptions = {
    app: "desktop",
    v: videoID,
    hl: "en",
    gl: "US",
  };

  const _headerOptions = {
    "user-agent": UserAgent,
    accept: "text/html",
    "accept-encoding": "gzip",
    "accept-language": `${_queryOptions.hl}-${_queryOptions.gl}`,
  };

  try {
    const html = await fetchHtmlData(getNormalizedQueryFreeUrl(WatchUrl), {
      params: _queryOptions,
      headers: _headerOptions,
    });

    const _initialData = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!_initialData) {
      throw new YtSearchError(
        "PARSE_ERROR",
        "Failed to parse YouTube initial data Or Invalid video.",
        { videoID }
      );
    }

    const _initialPlayerData = html.match(
      /var ytInitialPlayerResponse\s*=\s*(\{.*?\});/s
    );
    if (!_initialPlayerData) {
      throw new YtSearchError(
        "PARSE_ERROR",
        "Failed to parse YouTube initial player data Or Invalid video.",
        { videoID }
      );
    }

    const initialData = JSON.parse(_initialData[1]!);
    const initialPlayerData = JSON.parse(_initialPlayerData[1]!);

    const playability = initialPlayerData.playabilityStatus;
    if (!playability || playability.status !== "OK") {
      throw new YtSearchError(
        "YOUTUBE_ERROR",
        playability?.reason ||
          playability?.messages?.[0] ||
          "Video is not avalable (private, unavailable, or invalid).",
        { videoID, playabilityStatus: playability }
      );
    }

    const contentArray =
      initialData.contents.twoColumnWatchNextResults.results.results.contents ||
      [];
    const videoPrimaryInfoRenderer = contentArray.find((c: any) =>
      c.hasOwnProperty("videoPrimaryInfoRenderer")
    ).videoPrimaryInfoRenderer;
    const videoSecondaryInfoRenderer = contentArray.find((c: any) =>
      c.hasOwnProperty("videoSecondaryInfoRenderer")
    ).videoSecondaryInfoRenderer;
    const videoDetails = initialPlayerData.videoDetails;
    const microFormat = initialPlayerData.microformat.playerMicroformatRenderer;

    return {
      videoDetails,
      microFormat,
      videoPrimaryInfo: videoPrimaryInfoRenderer,
      videoSecondaryInfo: videoSecondaryInfoRenderer,
    };
  } catch (error: unknown) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in fetchVideoDataFromYT: ${String(error)}`,
      {
        videoID,
        originalError: error,
      }
    );
  }
};

export { fetchResultDataFromYT, fetchPlayListDataFromYT, fetchVideoDataFromYT };
