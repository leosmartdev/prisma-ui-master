/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */

/**
 * Retrieve a list of sites from the server.
 *
 * @param {object} opts Options for configuring this request.
 * @param {object} opts.params Object with key/value pairs to be used as GET params on the request
 * @param {object} opts.headers Object with key/value pairs to be appended as HEADERS on the
 * request.
 */
const getSites = (opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.get('/site', opts.params, opts);
};

/**
 * Retrieve a single site from the server.
 *
 * @param {string} id The id of the site to retrieve (not siteId)
 * @param {object} opts Options for configuring this request.
 * @param {object} opts.params Object with key/value pairs to be used as GET params on the request
 * @param {object} opts.headers Object with key/value pairs to be appended as HEADERS on the
 *  request.
 */
const getSite = (id, opts = {}) => async (dispatch, getState) => {
  const { server } = getState();
  return server.get(`/site/${id}`, opts.params, opts);
};

export { getSites, getSite };
