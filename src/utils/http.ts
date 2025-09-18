import axios from "axios";
import { handleAxiosError } from "./errors";

/**
 * Fetches raw HTML data from YouTube using a GET request.
 *
 * @param url - The YouTube page URL to fetch.
 * @param config - Axios configuration to include in the request.
 * @returns A promise that resolves to the raw HTML response data.
 * @throws {YtSearchError} Throws a standardized error if the request fails
 *         due to network issues, rate limiting, or YouTube being unavailable.
 */
export async function fetchHtmlData(
  url: string,
  config: Record<string, any>
): Promise<any> {
  try {
    const res = await axios.get(url, config);
    return res.data;
  } catch (err) {
    handleAxiosError(err, { url, config });
  }
}

/**
 * Fetches and parses API data from YouTube using a POST request.
 *
 * @param url - The YouTube API endpoint URL.
 * @param body - The request payload to send in the POST body.
 * @param config - Additional Axios configuration (headers, params, etc.).
 * @returns A promise that resolves to the parsed response data.
 * @throws {YtSearchError} Throws a standardized error if the request fails
 *         due to network issues, rate limiting, or YouTube being unavailable.
 */
export async function fetchApiData(
  url: string,
  body: Record<string, any>,
  config: Record<string, any>
): Promise<any> {
  try {
    const res = await axios.post(url, body, config);
    return res.data;
  } catch (err) {
    handleAxiosError(err, { url, body, config });
  }
}
