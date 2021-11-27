/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Helpers for dealing with text in the application.
 */

/**
 * Returns a truncated version of the string provided with the ellipsis added to the end of the
 * string. If the string is less than the length, it will just return the string.
 *
 * If a newline exists on the string, the trucated string will be split on the newline, so even if
 * the string is longer than length, if a newline occurs before length then the full string before
 * the newline is returned.
 *
 * Spacing is also taken into account and will be trimmed from the end of the string
 * before the ellipsis is added. So the resulting string length may be less than the length param.
 *
 * @param {string} str The string to truncate.
 * @param {int} length The max length of the string. Will truncate to be exactly this length
 *                     if the provided string is longer than that length including the added
 *                     ellipsis. Default 20 characters.
 *
 * @return {string} The trucated string. Guranteed to be less than or equal to `length`.
 *                  Returns empty string if input string is null or undefined.
 *
 * Eg.
 * ```
 * const title = 'This is a note that is long. ';
 * const trunc = getTruncatedTitleString(title, 10);
 * -> 'This is...'
 * ```
 *
 * ```
 * const title = 'This is\n a note that is long. ';
 * const trunc = getTruncatedTitleString(title, 10);
 * -> 'This is'
 * ```
 *
 */
export default function getTruncatedString(str, length = 20) {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }

  const trimmed = str.split(/\r?\n/)[0];
  if (trimmed && trimmed.length > length) {
    return `${trimmed.substring(0, length - 3).trim()}...`;
  }
  return trimmed;
}
