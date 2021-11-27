import { handleActions } from 'redux-actions';
import { __ } from '../../lib/i18n';
import log from 'loglevel';

const defaultTitle = __('Service Unavailable');
const defaultText = __(`
The system was unable to complete your last request. Please try again.
If problems continue, restart the application.
`);

const defaults = {
  show: false,
  title: '',
  text: '',
};

export default handleActions({
  'error/show': (state, action) => {
    if (action.payload.error) {
      log.error(action.payload.error);
    }
    return {
      ...state,
      show: true,
      title: action.payload.title || defaultTitle,
      text: action.payload.text || defaultText,
    };
  },
  'error/hide': state => ({
    ...state,
    show: false,
    title: '',
    text: '',
  }),
}, defaults);
