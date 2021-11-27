/** *************************************
 * Thunks
 ************************************* */
const downloadFileThunk = fileId => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    let header = {
      credentials: 'include',
    };

    fetch(server.buildHttpUrl(`/file/${fileId}`), header)
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
};

/** *************************************
 * Action Creators
 ************************************* */
export const downloadFile = downloadFileThunk;
