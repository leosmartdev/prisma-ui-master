import React from 'react';
import { __ } from 'lib/i18n';

// Routing
import { AnimatedPageRoute } from 'components/layout/Page';
import { LeftDrawerRoute } from 'components/layout/LeftDrawer';

// Component Imports
import NoteListPanel from './NoteListPanel';
import NoteDetails from './NoteDetails';

/**
 * Notes
 * Base component for Notes containing all the Routes and components.
 */
class Notes extends React.Component {
  render() {
    return [
      <LeftDrawerRoute
        key="note-management-list-notes"
        exact
        path="/notes"
        component={NoteListPanel}
        title={__('Notes')}
        routeOnClose="/"
      />,
      <AnimatedPageRoute
        key="note-management-create-note"
        path="/notes/create"
      >
        <NoteDetails />
      </AnimatedPageRoute>,
      <AnimatedPageRoute
        key="note-management-note-details"
        path="/notes/details/:id/:assigned"
      >
        <NoteDetails />
      </AnimatedPageRoute>,
    ];
  }
}

export default Notes;
