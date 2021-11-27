/** *************************************
 * Thunks
 ************************************* */

const uploadFileThunk = file => (dispatch, getState) => {
  const server = getState().server;
  return new Promise((resolve, reject) => {
    server.postMultipart('/file', file).then(
      response => {
        const metadata = {
          id: response.id,
          name: file.name,
          size: file.size,
          type: file.type,
        };
        resolve(metadata);
      },
      error => {
        reject(error);
      },
    );
  });
};

/** *************************************
 * Action Creators
 ************************************* */
export const uploadFile = uploadFileThunk;
