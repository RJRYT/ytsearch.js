import type { SearchOptions, SearchType, RawSearchResult } from "./types";
import {
  TypeFilters,
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  SearchUrl,
  ContentObjectKey,
} from "./utils/constants";
import { fetchHtmlData } from "./helper";

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
) => {
  return null;
};

export { fetchResultDataFromYT, fetchPlayListDataFromYT };
