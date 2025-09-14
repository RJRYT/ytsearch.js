import { fetchResultDataFromYT, fetchPlayListDataFromYT } from "./fetch";
import axios from "axios";
import {
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  ContentObjectKey,
  PlayListApiUrl,
} from "./utils/constants";
import type { SearchOptions, ExtractedItem, SearchPlaylistType } from "./types";
import {
  FormatChannelObject,
  FormatPlayListInfoObject,
  FormatPlaylistObject,
  FormatPlaylistVedioObject,
  FormatVedioObject,
  fetchPlaylistNextChunk,
} from "./helper";

/**
 * Search and formats YouTube content data (videos, channels, playlists).
 *
 * @param query - The search query string.
 * @param options - Optional search options (type, sort, limit).
 * @returns A promise that resolves to an array of formatted results.
 * @throws If query or options are invalid.
 */
const SearchYt = async (
  query: string,
  options: SearchOptions = DefaultOptions
): Promise<ExtractedItem[]> => {
  if (typeof query !== "string" || query.trim() === "") {
    throw new Error("Invalid search query. Must be a non-empty string.");
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

  const fetchResponse: Record<string, any>[] = await fetchResultDataFromYT(
    query,
    options
  );

  const responseData = fetchResponse
    .filter((item) => item.hasOwnProperty(ContentObjectKey[options.type!]))
    .map((item): ExtractedItem | undefined => {
      if (options.type === "video")
        return FormatVedioObject(item.videoRenderer);

      if (options.type === "channel")
        return FormatChannelObject(item.channelRenderer);

      if (options.type === "playlist")
        return FormatPlaylistObject(item.lockupViewModel);

      return undefined;
    })
    .filter((item): item is ExtractedItem => item !== undefined);

  return responseData.slice(0, options.limit);
};

const GetPlaylistVideos = async (playListID: string): Promise<any> => {
  if (typeof playListID !== "string" || playListID.trim() === "") {
    throw new Error("Invalid playList ID. It must be a non-empty string.");
  }

  const fetchResponse: SearchPlaylistType = await fetchPlayListDataFromYT(
    playListID
  );

  const buildPage = (videos: any[], continuationToken: string): any => {
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
};

/**
 * @deprecated Use `SearchYt` instead.
 */
const extractData = SearchYt;

export default SearchYt;

export {
  extractData,
  SearchYt,
  GetPlaylistVideos,
  DefaultOptions,
  ExpectedTypes,
  ExpectedSorts,
};
