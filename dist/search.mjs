import axios from "axios";
import {
  TypeFilters,
  DefaultOptions,
  ExpectedSorts,
  ExpectedTypes,
  SearchUrl,
  ContentObjectKey,
} from "./utils/constants.mjs";

/**
 * Searches for YouTube videos based on the given query.
 *
 * @param {string} query - The search query string.
 * @param {Object} options - Optional settings for the search.
 * @param {string} options.type - The type of results to return ('video', 'channel', 'playlist').
 * @param {string} options.sort - The sorting method ('relevance', 'upload_date', 'view_count', 'rating').
 * @param {number} options.limit - The maximum number of results to return.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of video data objects from the search results.
 * @throws {Error} If no results are found or an error occurs during the search.
 */
const search = async (query, options = DefaultOptions) => {
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

  // TODO: Implement sorting in the search results
  const _queryOptions = {
    app: "desktop",
    search_query: query,
    sp: TypeFilters[options.type],
  };

  try {
    const response = await axios.get(SearchUrl, { params: _queryOptions });
    const html = response.data;

    // Parse the initial data object from the HTML response
    const findInitialData = html.match(/var ytInitialData = {(.*?)};/g)[0];
    const fixData = findInitialData.replace(/var ytInitialData = /g, "");
    const initialData = JSON.parse(fixData.slice(0, -1));

    // Find the array of video data objects in the initial data object
    let data =
      initialData.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;
    let index,
      confirm = false;
    for (let i = 0; i < data.length; i++) {
      if (confirm) break;
      if (data[i].hasOwnProperty("itemSectionRenderer")) {
        for (let j = 0; j < data[i].itemSectionRenderer.contents.length; j++) {
          if (
            data[i].itemSectionRenderer.contents[j].hasOwnProperty(
              ContentObjectKey[options.type]
            )
          ) {
            index = i;
            confirm = true;
            break;
          }
        }
      }
    }

    // If video data objects were found, return them. Otherwise, throw an error.
    if (
      typeof data[index] === "object" &&
      data[index].hasOwnProperty("itemSectionRenderer")
    ) {
      data = data[index].itemSectionRenderer.contents;
      return data;
    } else {
      throw new Error(`No results were found.`);
    }
  } catch (error) {
    throw new Error(
      `Error searching for query '${query}': ${
        error.message ? error.message : error
      }`
    );
  }
};

export default search;
