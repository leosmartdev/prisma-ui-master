import React from 'react';
import moment from 'moment-timezone';
import { storiesOf } from '@storybook/react';

import LogEntryExpansionPanel from 'components/incidents/log-entries/LogEntryExpansionPanel';

storiesOf('Components/Incidents/Log Entries/LogEntryExpansionPanel', module)
  .add('Note', () => (
    <div style={{ width: '550px' }}>
      <LogEntryExpansionPanel
        logEntry={{
          type: 'NOTE',
          note: 'This is a note',
        }}
      />
    </div>
  ))
  .add('Note with editing disabled', () => (
    <div style={{ width: '550px' }}>
      <LogEntryExpansionPanel
        logEntry={{
          type: 'NOTE',
          note: 'This is a note',
        }}
        disableNoteEditing
      />
    </div>
  ))
  .add('Locked note', () => (
    <div style={{ width: '550px' }}>
      <LogEntryExpansionPanel
        logEntry={{
          type: 'NOTE',
          note: 'This is a note',
        }}
        locked
      />
    </div>
  ))
  .add('Note with timestamp', () => (
    <div style={{ width: '550px' }}>
      <LogEntryExpansionPanel
        logEntry={{
          type: 'NOTE',
          note: 'This is a note',
          timestamp: {
            seconds: 1,
            nanos: 0,
          },
        }}
        disableNoteEditing
      />
    </div>
  ))
  .add('Empty data', () => (
    <div style={{ width: '550px' }}>
      <LogEntryExpansionPanel logEntry={{}} />
    </div>
  ));
