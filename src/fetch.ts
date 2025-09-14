import type {
  SearchOptions,
  SearchType,
  RawSearchResult,
  SearchPlaylistType,
} from "./types";
import {
  TypeFilters,
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  SearchUrl,
  ContentObjectKey,
  PlaylistUrl,
} from "./utils/constants";
import { fetchHtmlData, parseAlerts } from "./helper";
import { getNormalizedQueryFreeUrl } from "./utils/utils";

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
    throw new Error(
      "Invalid search query. Search query must be a non-empty string."
    );
  }

  options = { ...DefaultOptions, ...options };

  if (!ExpectedTypes.includes(options.type!)) {
    throw new Error(
      `Invalid type option. Expected one of: ${ExpectedTypes.join(", ")}`
    );
  }
  if (!ExpectedSorts.includes(options.sort!)) {
    throw new Error(
      `Invalid sort option. Expected one of: ${ExpectedSorts.join(", ")}`
    );
  }

  const _queryOptions = {
    app: "desktop",
    search_query: query,
    sp: TypeFilters[options.type as SearchType],
  };

  try {
    const html = await fetchHtmlData(SearchUrl, {
      params: _queryOptions,
    });

    // Parse ytInitialData from the HTML response
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!match) {
      throw new Error("Failed to parse YouTube initial data.");
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
      throw new Error(`No results were found.`);
    }
  } catch (error: any) {
    throw new Error(
      `Error searching for query '${query}': ${error.message ?? error}`
    );
  }
};

const fetchPlayListDataFromYT = async (
  playListID: string
): Promise<SearchPlaylistType> => {
  if (typeof playListID !== "string" || playListID.trim() === "") {
    throw new Error("Invalid playList ID. It must be a non-empty string.");
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
      throw new Error(
        "Failed to parse YouTube initial data Or Invalid playlist."
      );
    }

    const initialData = JSON.parse(match[1]!);

    // Check if response contains error alerts
    if (initialData.alerts?.length) {
      const alerts = parseAlerts(initialData.alerts);

      // Find if any are errors
      const errorAlert = alerts.find((a) => a.type === "ERROR");
      if (errorAlert) {
        throw new Error(errorAlert.message);
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
      throw new Error("No videos found in playlist.");
    }

    // Filter out continuation tokens (they appear for load-more)
    const videos = playlistData.filter((c) =>
      c.hasOwnProperty("playlistVideoRenderer")
    );
    const ContinueObject = playlistData.filter((c) =>
      c.hasOwnProperty("continuationItemRenderer")
    );

    let continueToken = null;
    if (ContinueObject) {
      continueToken =
        ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint
          ?.continuationCommand?.token ||
        ContinueObject[0]?.continuationItemRenderer?.continuationEndpoint?.commandExecutorCommand?.commands?.find(
          (c: any) => c.hasOwnProperty("continuationCommand")
        )?.continuationCommand?.token || null;
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
      videos: videos as RawSearchResult[],
    };
  } catch (error: any) {
    throw new Error(`Error searching for playlist '${playListID}': ${error}`);
  }
};

export { fetchResultDataFromYT, fetchPlayListDataFromYT };
