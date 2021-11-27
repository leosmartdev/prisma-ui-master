import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DeviceInfoSidebar from 'components/fleet/devices/DeviceInfoSidebar/DeviceInfoSidebar';
import Card from '@material-ui/core/Card/Card';
import { HashRouter as Router } from 'react-router-dom';
import Provider from 'react-redux/es/components/Provider';
import { createStore } from 'redux';

export const vesselDeviceOmniCom = {
  id: '5b84406cd680050cdab1c970',
  type: 'pleasure',
  name: 'omni',
  devices: [
    {
      id: '5b802524d68005584a42d1cb',
      type: 'OmnicomVMS',
      deviceId: '12',
      networks: [
        {
          subscriberId: '555234010030456',
          type: 'satellite-data',
          providerId: 'iridium',
          registryId: '4b6a6510ec550c47e20ae2f66ed365f4',
        },
        {
          subscriberId: '999234010030477',
          type: 'cellular-data',
          providerId: '3g',
          registryId: '1ab5dd7a1a758658adb630fb95505be0',
        },
      ],
      configuration: {
        id: '5b802524d68005584a42d1cb',
        entities: [],
        configuration: {
          '@type': 'type.googleapis.com/prisma.tms.omnicom.OmnicomConfiguration',
        },
        lastUpdate: '2018-08-24T15:32:52.291714678Z',
        original: {
          '@type': 'type.googleapis.com/prisma.tms.omnicom.Gp',
          Header: 'Aw==',
          BeaconID: 12,
          IDMsg: 769,
          DatePosition: {
            Year: 18,
            Month: 8,
            Day: 24,
            Minute: 32,
            Longitude: 104.046906,
            Latitude: 0.87519836,
          },
          PositionReportingInterval: {},
          GeofencingEnable: {
            OnOff: 1,
          },
          PositionCollectionInterval: {},
          Password: {
            ValueInMn: 'ICAgICAgICAgICAgICAg',
          },
          Routing: {},
          FirmwareDomeVersion: 'ICAg',
          JunctionBoxVersion: 'ICAg',
          SIMCardICCID: 'ICAgICAgICAgICAgICAgICAgICA=',
          G3IMEI: 'OTk5MjM0MDEwMDMwNDc3',
          IRIIMEI: 'NTU1MjM0MDEwMDMwNDU2',
          CRC: 29,
        },
      },
    },
  ],
  crew: [],
};

export const deviceOmniCom = vesselDeviceOmniCom.devices[0];

export const actions = {
  onPinTask: action('onPinTask'),
  onArchiveTask: action('onArchiveTask'),
};

const reducer = state => state;
const store = createStore(reducer, {});

storiesOf('Components/Fleet/Devices', module).add('OmniCom Info', () => (
  <Card style={{ maxWidth: '350px' }}>
    <Router>
      <Provider store={store}>
        <DeviceInfoSidebar vessel={vesselDeviceOmniCom} device={deviceOmniCom} />
      </Provider>
    </Router>
  </Card>
));
