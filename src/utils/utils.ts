import { YtSearchError } from "./errors";

/**
 * Converts a time string (e.g., 'mm:ss' or 'hh:mm:ss') to total seconds.
 *
 * @param timeString - The time string to convert.
 * @returns The equivalent time in seconds, or 0 if invalid.
 */
const toSeconds = (timeString: string): number => {
  const timeArray = timeString.split(":").reverse();
  let seconds = 0;
  for (let i = 0; i < timeArray.length; i++) {
    seconds += parseInt(timeArray[i] ?? "0", 10) * Math.pow(60, i);
  }
  return isNaN(seconds) ? 0 : seconds;
};

/**
 * Formats a large number into a short string (e.g., 1500 -> '1.5K').
 *
 * @param num - The number to format.
 * @returns The shortened number string.
 */
const shortNumber = (num: number): string => {
  if (num < 1000) return num.toString(); // no suffix
  const suffixes = ["", "K", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const scaled = num / Math.pow(10, magnitude * 3);
  return scaled.toFixed(1).replace(/\.0$/, "") + suffixes[magnitude];
};

/**
 * Recursively finds the first string value in a JSON object that matches a regex.
 * Stops searching after the first match is found.
 * @param data - The data to search (can be an object, array, or primitive).
 * @param regex - The regular expression to test against.
 * @returns The first matching string, or undefined if no match is found.
 */
const findFirstMatchingValue = (
  data: unknown,
  regex: RegExp
): string | undefined => {
  if (Array.isArray(data)) {
    for (const item of data) {
      const match = findFirstMatchingValue(item, regex);
      if (match) {
        return match;
      }
    }
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const match = findFirstMatchingValue(
          (data as Record<string, unknown>)[key],
          regex
        );
        if (match) {
          return match;
        }
      }
    }
  } else if (typeof data === "string" && regex.test(data)) {
    return data;
  }

  return undefined;
};

/**
 * Normalizes a URL by ensuring it uses the HTTPS protocol and returns the URL without its query string.
 * - Adds 'https://' if the protocol is missing.
 * - Converts 'http://' to 'https://'.
 * - Throws an error for invalid URL formats that cannot be fixed.
 *
 * @param {string} urlString The potentially malformed URL string.
 * @returns {string} A normalized, query-free HTTPS URL.
 */
const getNormalizedQueryFreeUrl = (urlString: string): string => {
  // Normalize the input string by trimming whitespace and converting to lowercase for protocol check
  const normalizedInput = urlString.trim();

  // Prepend 'https://' if the URL does not start with a protocol
  let fullUrlString = normalizedInput;
  if (
    !normalizedInput.startsWith("http://") &&
    !normalizedInput.startsWith("https://")
  ) {
    fullUrlString = `https://${normalizedInput}`;
  } else if (normalizedInput.startsWith("http://")) {
    // Replace 'http' with 'https'
    fullUrlString = normalizedInput.replace("http://", "https://");
  }

  try {
    const urlObj = new URL(fullUrlString);
    urlObj.search = ""; // Remove query parameters
    return urlObj.toString();
  } catch (error) {
    throw new YtSearchError("UNKNOWN", "Invalid URL provided", {
      urlString,
      originalError: error,
    });
  }
};

/**
 * Converts seconds to a human-readable mm:ss or hh:mm:ss format.
 *
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} - The formatted duration string.
 */
const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const formattedSeconds = String(seconds).padStart(2, "0");

  return hours > 0
    ? `${hours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Converts an ISO 8601 date string into a human-readable format.
 *
 * @param {string} isoDate - The ISO 8601 date string (e.g., "2022-07-12T05:12:29-07:00").
 * @param {Intl.DateTimeFormatOptions} [options] - Optional formatting options for the output.
 *   Defaults to: { year: "numeric", month: "long", day: "numeric" }
 * @param {string} [locale="en-US"] - Optional locale string (default: "en-US").
 *
 * @returns {string} The formatted date string in human-readable form.
 *
 * @example
 * ```ts
 * formatDate("2022-07-12T05:12:29-07:00");
 * // "July 12, 2022"
 *
 * formatDate("2022-07-12T05:12:29-07:00", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
 * // "Tuesday, Jul 12, 2022"
 * ```
 */
const formatDate = (
  isoDate: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
  locale: string = "en-US"
): string => {
  if (!isoDate || typeof isoDate !== "string") {
    return "";
  }

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return "";
  }
}

export {
  toSeconds,
  shortNumber,
  findFirstMatchingValue,
  getNormalizedQueryFreeUrl,
  formatDuration,
  formatDate,
};
