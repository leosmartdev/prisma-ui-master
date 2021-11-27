import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';

// Icons
import EditIcon from '@material-ui/icons/Edit';

const styles = theme => ({
  container: {
    overflow: 'auto',
  },
  button: {
    marginBottom: '5px',
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
});

class ConfigList extends React.Component {
  constructor(props) {
    super(props);

    this.noValue = '-';
  }

  editConfig = () => {
    const { history } = this.props;

    history.push('/config/edit');
  };

  isNull = val => {
    return val ? val : this.noValue;
  };

  render() {
    const {
      classes,
      config,
    } = this.props;

    const site = config.site;

    return (
      <FlexContainer column align="start stretch" classes={{ root: classes.container }}>
        <FlexContainer align="end center">
          <Button
            variant="contained"
            color="primary"
            onClick={this.editConfig}
            className={classes.button}
          >
            <EditIcon
              fontSize="small"
              className={classes.leftIcon}
            />
            {__('Edit Config')}
          </Button>
        </FlexContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">{__('Type')}</TableCell>
              <TableCell padding="none">{this.isNull(site.type)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Name')}</TableCell>
              <TableCell padding="none">{this.isNull(site.name)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Description')}</TableCell>
              <TableCell padding="none">{this.isNull(site.description)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Address')}</TableCell>
              <TableCell padding="none">{this.isNull(site.address)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Country')}</TableCell>
              <TableCell padding="none">{this.isNull(site.country)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Incident Id Prefix')}</TableCell>
              <TableCell padding="none">{this.isNull(site.incidentIdPrefix)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Cospas/Sarsat Code')}</TableCell>
              <TableCell padding="none">{this.isNull(site.cscode)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Cospas/Sarsat Name')}</TableCell>
              <TableCell padding="none">{this.isNull(site.csname)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </FlexContainer>
    );
  }
}

ConfigList.propTypes = {
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
  /** @private withRouter */
  history: PropTypes.object.isRequired,
  /** @private connect(mapStateToProps) */
  config: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  config: state.config,
});

export default withRouter(
  connect(
    mapStateToProps,
  )(
    withStyles(
      styles
    )(ConfigList)
  ),
);