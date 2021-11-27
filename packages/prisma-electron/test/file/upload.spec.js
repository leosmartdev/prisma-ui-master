import * as uploadActions from 'file/upload';
import { mockStore } from '../common';

describe('file/upload', () => {
  describe('[thunk] uploadFile', () => {
    let mockServer = null;
    let defaultState = {};

    const empty = {
      files: {},
    };

    beforeEach(() => {
      mockServer = jest.fn().mockImplementation(() => {
        return {};
      });
      defaultState = {
        server: mockServer,
        ...empty,
      };
    });

    it('on success calls correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newFile = {
        path: 'path/to/file.txt',
        name: 'file.txt',
        type: 'image/png',
        size: 64,
      };

      const uploadedFile = {
        id: 'ID',
      };

      mockServer.postMultipart = jest.fn(() => Promise.resolve(uploadedFile, newFile));

      return store.dispatch(uploadActions.uploadFile(newFile)).then(response => {
        expect(mockServer.postMultipart).toHaveBeenCalledTimes(1);
        expect(mockServer.postMultipart).toHaveBeenCalledWith('/file', newFile);

        expect(response).toEqual({
          id: 'ID',
          name: newFile.name,
          type: newFile.type,
          size: newFile.size,
        });
      });
    });

    it('on failure calls correct actions', () => {
      const store = mockStore({ ...defaultState });

      const newFile = {
        name: 'file.txt',
        type: 'NOTE_FILE',
        size: 64,
        md5: 'HASH',
      };

      const error = {
        statusText: 'Failed',
      };

      mockServer.postMultipart = jest.fn(() => Promise.reject(error));

      return store.dispatch(uploadActions.uploadFile(newFile)).catch(response => {
        expect(mockServer.postMultipart).toHaveBeenCalledTimes(1);
        expect(mockServer.postMultipart).toHaveBeenCalledWith('/file', newFile);

        expect(response).toBe(error);
      });
    });
  });
});
