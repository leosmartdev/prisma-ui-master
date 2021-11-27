import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { PriorityAlertsList } from 'components/alerts/PriorityAlertsList';
import notices from './notices.data';

storiesOf('Components/Alerts/PriorityAlertsList', module)
  .add('Single Alert', () => (
    <div style={{ position: 'fixed', top: '0', left: '0' }}>
      <PriorityAlertsList notices={notices.slice(0, 1)} />
    </div>
  ))

  .add('Two Alerts', () => (
    <div style={{ position: 'fixed', top: '0', left: '0' }}>
      <PriorityAlertsList notices={notices.slice(0, 2)} />
    </div>
  ))

  .add('Multiple Alerts', () => (
    <div style={{ position: 'fixed', top: '0', left: '0' }}>
      <PriorityAlertsList notices={notices} />
    </div>
  ));
