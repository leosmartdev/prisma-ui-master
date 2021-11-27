import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

// Components
import VesselExpansionPanelSummary from 'components/fleet/vessel/VesselExpansionPanelSummary';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";

storiesOf('Components/Fleet/Vessel/VesselExpansionPanelSummary', module)
  .add('Basic', () => (
    <Accordion style={{ width: '550px' }}>
      <AccordionSummary>
        <VesselExpansionPanelSummary vessel={{ name: 'Vessel Name', type: 'Tanker' }} />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Expanded', () => (
    <Accordion style={{ width: '550px' }} expanded>
      <AccordionSummary>
        <VesselExpansionPanelSummary vessel={{ name: 'Vessel Name', type: 'C172' }} isExpanded />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Hovering', () => (
    <Accordion style={{ width: '550px' }}>
      <AccordionSummary>
        <VesselExpansionPanelSummary vessel={{ name: 'Vessel Name' }} isHovering />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Editing', () => (
    <Accordion style={{ width: '550px' }} expanded>
      <AccordionSummary>
        <VesselExpansionPanelSummary vessel={{ name: 'Vessel Name' }} isEditing />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Editing with Custom Title', () => (
    <Accordion style={{ width: '550px' }} expanded>
      <AccordionSummary>
        <VesselExpansionPanelSummary
          vessel={{ name: 'Vessel Name' }}
          isEditing
          editTitle="Custom Edit Title"
        />
      </AccordionSummary>
    </Accordion>
  ))

  .add('With Error Banner Message', () => (
    <Accordion style={{ width: '550px' }}>
      <AccordionSummary>
        <VesselExpansionPanelSummary
          vessel={{ name: 'Vessel Name' }}
          errorBannerMessage="An error has occurred"
        />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Empty vessel', () => (
    <Accordion style={{ width: '550px' }}>
      <AccordionSummary>
        <VesselExpansionPanelSummary vessel={{}} />
      </AccordionSummary>
    </Accordion>
  ))

  .add('Actions', () => (
    <Accordion style={{ width: '550px' }} expanded>
      <AccordionSummary>
        <VesselExpansionPanelSummary
          vessel={{ name: 'Action Vessel' }}
          onAction={action('Action')}
          isExpanded
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Click on the edit or more icons above and then in the Actions tab below you will see the
          dispatched action that is recieved on the `onAction` function property.
        </Typography>
      </AccordionDetails>
    </Accordion>
  ));
