import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';

// Components
import FlexContainer from 'components/FlexContainer';

import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';

// Icons
import PlaceIcon from '@material-ui/icons/Place';

export default class SearchResultsList extends React.Component {
  getPrimaryText = searchItem => {
    let label = searchItem.label;
    let mmsi = null;

    searchItem.matches.map(match => {
      switch (match.name) {
        case 'callsign': {
          label = `${text}: ${match.value}`;
          break;
        }
        case 'mmsi': {
          mmsi = `${__('MMSI')}: ${match.value}`;
          break;
        }
      }
    });

    const text = (
      <FlexContainer align="space-between center">
        <Typography variant="body2">{label}</Typography>
        {mmsi && searchItem.labelType !== 'mmsi' && (
          <Typography variant="caption">{mmsi}</Typography>
        )}
      </FlexContainer>
    );
    return text;
  };

  getPrimaryTextSecondLine = searchItem => {
    let text = null;
    let imo = null;
    let destination = null;
    searchItem.matches.map(match => {
      switch (match.name) {
        case 'imo': {
          imo = `${__('IMO')}: ${match.value}`;
          break;
        }
        case 'destination': {
          destination = (
            <FlexContainer align="end center">
              <Typography variant="caption">
                <PlaceIcon style={{ width: '18px' }} />
              </Typography>
              <Typography variant="caption">{match.value}</Typography>
            </FlexContainer>
          );
          break;
        }
      }
    });

    text = (
      <FlexContainer align="space-between center">
        {destination}
        {imo && <Typography variant="caption">{imo}</Typography>}
      </FlexContainer>
    );
    return text;
  };

  render = () => {
    const { results, onSelect } = this.props;

    if (results == null) {
      return null;
    }

    return (
      <List dense>
        <Divider />
        {results.length === 0 && (
          <ListItem>
            <ListItemText primary={__('No results')} />
          </ListItem>
        )}
        {results.length !== 0 &&
          results.map(result => (
            <ListItem
              disableGutters
              button
              divider
              key={result.registryId}
              onClick={() => onSelect(result)}
            >
              {/*
                            <ListItemAvatar>{this.getSearchIcon(result)}</ListItemAvatar>
                            */}
              <ListItemText
                disableTypography
                primary={this.getPrimaryText(result)}
                secondary={this.getPrimaryTextSecondLine(result)}
              />
            </ListItem>
          ))}
      </List>
    );
  };
}

SearchResultsList.propTypes = {
  results: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
};
