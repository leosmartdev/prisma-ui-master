import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

// Components
import PriorityAlertsListItem from 'components/alerts/PriorityAlertsListItem';

import {
  Paper,
  Table,
  TableBody,
} from '@material-ui/core';

storiesOf('Components/Alerts/PriorityAlertsListItem', module)
  .add('SARSAT Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              databaseId: '5cdc2373dea12f3214d65a49',
              noticeId: 'c81d84022ee04e3058486b39a1d5c2c4',
              createdTime: '2019-05-15T14:34:27.146200818Z',
              updatedTime: '2019-05-15T17:54:27.052219792Z',
              event: 'Sarsat',
              action: 'NEW',
              priority: 'Alert',
              target: {
                trackId: '5a11f8d597cf55289e2496431e51d815',
                registryId: '98d571d3e77e6e5a01214856ca8c59a7',
                databaseId: '5cdc2373dea12f32127963a6',
                type: 'SARSAT',
                sarsatBeacon: {
                  hexId: 'A02DD1E15CC02CD',
                  countryCode: '257',
                  serialUser: {
                    beaconType: '3',
                    aircraftAddress: '4687219',
                    certificateNumber: '179',
                    auxiliaryRadioLocatingDevice: '1',
                  },
                },
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('SART Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'SART',
                mmsi: '123456789',
              },
              updatedTime: '2019-05-15T17:54:27.052219792Z',
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('MOB Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'SART',
                mmsi: '972XXXXXX',
              },
              updatedTime: {
                seconds: 0,
                nanos: 0,
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('EPIRB Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'SART',
                mmsi: '974XXXXXX',
              },
              updatedTime: {
                seconds: 0,
                nanos: 0,
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('SART Unknown MMSI', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'SART',
              },
              updatedTime: {
                seconds: 0,
                nanos: 0,
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('OmniCom Solar Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'OmnicomSolar',
              },
              updatedTime: {
                seconds: 0,
                nanos: 0,
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ))

  .add('OmniCom VMS Alert', () => (
    <Paper elevation={2}>
      <Table>
        <TableBody>
          <PriorityAlertsListItem
            notice={{
              target: {
                type: 'OmnicomVMS',
              },
              updatedTime: {
                seconds: 123,
                nanos: 456,
              },
            }}
            openInfoPanel={action('openInfoPanel Called')}
          />
        </TableBody>
      </Table>
    </Paper>
  ));
