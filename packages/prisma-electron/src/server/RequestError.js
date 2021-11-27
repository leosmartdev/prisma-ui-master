/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 * Wrapper for request errors that contains a localized ready for displaying to a user error message
 */
import { __ } from 'lib/i18n';

export default class RequestError {
  /**
   * Returns a new instance of RequestError with the provided error and for 401, 403, and 500
   * errors provides a human readable error messages.
   *
   * For most requests, the error messages for 401,403, and 500 errors are the same.
   * So this function will check if one of those statuses was returned, otherwise it will
   * return the default message passed in.
   *
   * Optional prefix can be passed in and will be pre-pended to to the message if a message was set.
   *
   * If no default message (defaultMessage = null) is passed in and no better message is set,
   * then message will be null. If default message is an empty string then only prefix
   * will be set.
   *
   * @param {object} error The response from the server.
   * @param {string} defaultMessage Default message to use if a better message isn't found.
   * @param {string} prefix When found, this prefix will be prepending to all message strings.
   * @return {RequestError}
   */
  static parseRequestErrorFromResponse(error, defaultMessage, prefix = null) {
    let message = defaultMessage;
    switch (error.status) {
      case 401:
      case 403: {
        message = __('Sorry, you are not authorized to perform this action.');
        break;
      }
      case 500: {
        message = __(
          'An error occured on the server. Please try again later or contact your system administrator.',
        );
        break;
      }
    }

    if (prefix !== null && message !== null) {
      message = `${prefix} ${message}`;
    }

    return new RequestError(error, message, error.fieldErrors);
  }

  /**
   * Generic request exception. Thrown when a REST error occured.
   * This object holds the original error from the server as well as a user displayable
   * message and parsed field errors if applicable.
   *
   * @param {object} error The underlying error from the server.js
   * @param {string} message User displayable error. The function throwing this exception must parse
   *                         the error status codes and provide a localized message here. This takes
   *                         the place of passing errorBannerText around the application.
   * @param {FieldErrors} fieldErrors A FieldError object if the request was a POST/PUT and user
   *                                  input incorrect data.
   */
  constructor(error, message = __('An unknown error occured.'), fieldErrors = undefined) {
    this.error = error;
    this.message = message;
    this.fieldErrors = fieldErrors;
  }
}
