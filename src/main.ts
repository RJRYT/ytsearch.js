import { fetchResultDataFromYT, fetchPlayListDataFromYT } from "./fetch";
import { YtSearchError } from "./utils/errors";
import {
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  ContentObjectKey,
} from "./utils/constants";
import type {
  SearchOptions,
  SearchResult,
  RawSearchResult,
  SearchPlaylistType,
  PlaylistPage,
} from "./types";
import {
  FormatChannelObject,
  FormatPlayListInfoObject,
  FormatPlaylistObject,
  FormatPlaylistVedioObject,
  FormatVedioObject,
  fetchPlaylistNextChunk,
} from "./helper";

/**
 * Searches YouTube for videos, channels, or playlists and formats the results.
 *
 * @param query - The search query string (e.g. `"JavaScript tutorial"`).
 * @param options - Optional search options:
 * - `type` {"video" | "channel" | "playlist"} - The type of content to search for.
 * - `sort` {string} - Sorting option (must be one of `ExpectedSorts`).
 * - `limit` {number} - Maximum number of results to return.
 * Defaults are taken from `DefaultOptions`.
 *
 * @returns {Promise<SearchResult[]>}
 * Resolves to an array of extracted and normalized results, depending on `options.type`:
 *
 * - **VideoResult** (`{ type: "video" }`)
 *   ```ts
 *   {
 *     type: "video";
 *     id: string;
 *     title: string;
 *     image: string;
 *     thumbnail: Thumbnail;
 *     viewCount: number;
 *     shortViewCount: string;
 *     duration: string;
 *     seconds: number;
 *     author: Author | null;
 *     watchUrl: string;
 *     publishedAt: string;
 *   }
 *   ```
 *
 * - **ChannelResult** (`{ type: "channel" }`)
 *   ```ts
 *   {
 *     type: "channel";
 *     id: string;
 *     title: string;
 *     image: string;
 *     thumbnail: Thumbnail;
 *     description: string;
 *     subscriberCount: string;
 *     url: string;
 *     verified: boolean;
 *     isArtist: boolean;
 *   }
 *   ```
 *
 * - **PlaylistResult** (`{ type: "playlist" }`)
 *   ```ts
 *   {
 *     type: "playlist";
 *     contentType: string;
 *     id: string;
 *     title: string;
 *     image: string;
 *     thumbnail: Thumbnail;
 *     videoCount: number;
 *     author: Author | null;
 *     url: string;
 *   }
 *   ```
 *
 * @throws {YtSearchError}
 * - If `query` is not a non-empty string.
 * - If `options.type` is not one of `"video" | "channel" | "playlist"`.
 * - If `options.sort` is not a valid sorting option.
 */
const searchYouTube = async (
  query: string,
  options: SearchOptions = DefaultOptions
): Promise<SearchResult[]> => {
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

  try {
    const fetchResponse: Record<string, any>[] = await fetchResultDataFromYT(
      query,
      options
    );

    const responseData = fetchResponse
      .filter((item) => item.hasOwnProperty(ContentObjectKey[options.type!]))
      .map((item): SearchResult | undefined => {
        if (options.type === "video")
          return FormatVedioObject(item.videoRenderer);

        if (options.type === "channel")
          return FormatChannelObject(item.channelRenderer);

        if (options.type === "playlist")
          return FormatPlaylistObject(item.lockupViewModel);

        return undefined;
      })
      .filter((item): item is SearchResult => item !== undefined);

    return responseData.slice(0, options.limit);
  } catch (error) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in searchYouTube: ${String(error)}`,
      {
        query,
        options,
        originalError: error,
      }
    );
  }
};

/**
 * Fetches a YouTube playlist (metadata + items) and provides paginated access.
 *
 * @param playListID - The playlist ID (e.g. `"PLBCF2DAC6FFB574DE"`).
 *
 * @returns {Promise<PlaylistPage>}
 * The first page of the playlist results. Includes playlist info, video list,
 * and methods for pagination:
 *
 * ```ts
 * {
 *   playlist: PlaylistInfo;
 *   videos: PlaylistVideo[];
 *   hasNextPage: boolean;
 *   nextPage: () => Promise<PlaylistPage | null>;
 * }
 * ```
 *
 * - `playlist`: Normalized playlist info.
 * - `videos`: Array of formatted video objects.
 * - `hasNextPage`: Indicates whether more videos are available.
 * - `nextPage()`: Loads the next page, or returns `null` if no continuation exists.
 *
 * @throws {YtSearchError}
 * - If `playListID` is not a non-empty string.
 * - If the playlist fetch fails or YouTube returns an invalid response.
 */
const getPlaylistItems = async (playListID: string): Promise<PlaylistPage> => {
  if (typeof playListID !== "string" || playListID.trim() === "") {
    throw new YtSearchError(
      "INVALID_PLAYLIST",
      "Invalid playList ID. It must be a non-empty string.",
      { playListID }
    );
  }

  try {
    const fetchResponse: SearchPlaylistType = await fetchPlayListDataFromYT(
      playListID
    );

    const buildPage = (
      videos: RawSearchResult[],
      continuationToken: string | null
    ): PlaylistPage => {
      return {
        playlist: FormatPlayListInfoObject(
          fetchResponse.playlistInfo,
          playListID
        ),
        videos: videos.map((vid) =>
          FormatPlaylistVedioObject(vid.playlistVideoRenderer)
        ),
        hasNextPage: !!continuationToken,
        nextPage: async () => {
          if (!continuationToken) return null;

          const responseData = await fetchPlaylistNextChunk(
            fetchResponse.apiToken,
            continuationToken,
            fetchResponse.clientVersion
          );

          return buildPage(responseData.videos, responseData.continueToken);
        },
      };
    };

    return buildPage(fetchResponse.videos, fetchResponse.continueToken);
  } catch (error) {
    if (error instanceof YtSearchError) throw error;
    throw new YtSearchError(
      "UNKNOWN",
      `Unexpected error in getPlaylistItems: ${String(error)}`,
      {
        playListID,
        originalError: error,
      }
    );
  }
};

export default searchYouTube;

export {
  searchYouTube,
  getPlaylistItems,
  DefaultOptions,
  ExpectedTypes,
  ExpectedSorts,
};
