import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';
import Header from 'components/Header';

import {
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
} from '@material-ui/core';

// Icons
import EditIcon from '@material-ui/icons/Edit';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  communication_config: {
    marginBottom: '20px',
  },
});

class RemoteSiteConfigList extends React.Component {
  constructor(props) {
    super(props);

    this.noValue = '-';

    this.state = {
      ftpCommConfigExpanded: true,
    };
  }

  toggleFtpCommConfig = () => {
    this.setState(prevState => ({ ftpCommConfigExpanded: !prevState.ftpCommConfigExpanded }));
  };

  toggleFtpCommConfigIcon = () => (this.state.ftpCommConfigExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />);

  editConfig = () => {
    const {
      history,
    } = this.props;

    history.push(`/remotesite-config/edit`);
  };

  getValue = (key, isChild = false, childKey, returnValue, noValue) => {
    const { currentRemoteSiteConfig } = this.props;

    if (!isChild) {
      if (currentRemoteSiteConfig && key in currentRemoteSiteConfig && currentRemoteSiteConfig[key]) {
        if (returnValue != undefined) {
          return returnValue;
        }

        return currentRemoteSiteConfig[key];
      }
    } else {
      if (currentRemoteSiteConfig && childKey && key in currentRemoteSiteConfig && childKey in currentRemoteSiteConfig[key] && currentRemoteSiteConfig[key][childKey]) {
        if (returnValue != undefined) {
          return returnValue;
        }

        return currentRemoteSiteConfig[key][childKey];
      }
    }

    if (noValue != undefined) {
      return noValue;
    }

    return this.noValue;
  };

  render() {
    const {
      classes,
    } = this.props;

    const {
      ftpCommConfigExpanded,
    } = this.state;

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
              <TableCell padding="none">{this.getValue('type')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Name')}</TableCell>
              <TableCell padding="none">{this.getValue('name')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Description')}</TableCell>
              <TableCell padding="none">{this.getValue('description')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Address')}</TableCell>
              <TableCell padding="none">{this.getValue('address')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Country')}</TableCell>
              <TableCell padding="none">{this.getValue('country')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Cospas/Sarsat Code')}</TableCell>
              <TableCell padding="none">{this.getValue('cscode')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{__('Cospas/Sarsat Name')}</TableCell>
              <TableCell padding="none">{this.getValue('csname')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <FlexContainer column align="start stretch" classes={{ root: classes.communication_config }}>
          <Header
            onClick={this.toggleFtpCommConfig}
            variant="h6"
            margin="normal"
            action={<IconButton>{this.toggleFtpCommConfigIcon()}</IconButton>}
          >
            {__('FTP Communication Config')}
          </Header>
          <Collapse in={ftpCommConfigExpanded}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell padding="none">{__('Hostname')}</TableCell>
                  <TableCell padding="none">{this.getValue('ftp_communication', true, 'hostname')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">{__('IP Address')}</TableCell>
                  <TableCell padding="none">{this.getValue('ftp_communication', true, 'ip_address')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">{__('Username')}</TableCell>
                  <TableCell padding="none">{this.getValue('ftp_communication', true, 'username')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">{__('Starting Directory')}</TableCell>
                  <TableCell padding="none">{this.getValue('ftp_communication', true, 'starting_directory', undefined, '~/')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="none">{__('Use FTP on SFTP Failure')}</TableCell>
                  <TableCell padding="none">{this.getValue('ftp_communication', true, 'fallback_to_ftp', 'Enabled', 'Disabled')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </FlexContainer>
      </FlexContainer>
    );
  }
}

RemoteSiteConfigList.propTypes = {
  /** @private withStyles */
  classes: PropTypes.object.isRequired,
  /** @private withRouter */
  history: PropTypes.object.isRequired,
  /** @private connect(mapStateToProps) */
  currentRemoteSiteConfig: PropTypes.object,
};

const mapStateToProps = state => ({
  currentRemoteSiteConfig: state.remoteSiteConfig.currentRemoteSiteConfig,
});

export default withRouter(
  connect(
    mapStateToProps,
  )(
    withStyles(
      styles
    )(RemoteSiteConfigList)
  ),
);