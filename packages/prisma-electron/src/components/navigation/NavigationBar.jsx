import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { makeStyles } from '@material-ui/styles';
import color from 'color';

// Components
import Authorization from 'components/security/Authorization';
import { FlexContainer } from 'components/layout/Container';
import NavigationBarMenuItem from './NavigationBarMenuItem';
import NavigationSubMenu from './NavigationSubMenu';
import NavigationSubMenuItem from './NavigationSubMenuItem';

import {
  Paper,
} from '@material-ui/core';

// Icons
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import FleetIcon from '@material-ui/icons/DirectionsBoat';
import IncidentIcon from '@material-ui/icons/Flag';
import MapIcon from '@material-ui/icons/Map';
import ProfileIcon from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import UsersIcon from '@material-ui/icons/Group';
import ConfigIcon from '@material-ui/icons/SettingsApplications';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoIcon from 'resources/svg/Logo';
import NavigationBarItem from './NavigationBarItem';
import NoteIcon from '@material-ui/icons/EventNote';
import RemoteSiteConfigIcon from '@material-ui/icons/PermDataSetting';
import ForumIcon from '@material-ui/icons/Forum';

// Actions & Helpers
import * as navigationActions from 'navigation/navigation';

const useStyles = makeStyles(theme => ({
  '@keyframes profileDrawerClose': {
    from: { left: theme.c2.drawers.profile.width },
    to: { left: 0 },
  },
  '@keyframes profileDrawerOpen': {
    from: { left: 0 },
    to: { left: theme.c2.drawers.profile.width },
  },
  root: {
    width: props => {
      if (props.navExpanded) {
        return theme.c2.navBar.expandedWidth;
      }
      return theme.c2.navBar.width;
    },
    left: props => {
      if (props.profileDrawerOpen) {
        return theme.c2.drawers.profile.width;
      }
      return theme.c2.navBar.offsetX;
    },
    top: '0px',
    bottom: '0px',
    zIndex: '1300',
    position: 'absolute',
    transition: 'top 225ms cubic-bezier(0.23, 1, 0.32, 1)',
    backgroundColor: `${color(theme.palette.background.default).darken(0.1)}`,
  },
  rootProfileOpen: {
    animation: '$profileDrawerOpen 225ms cubic-bezier(0, 0, 0.2, 1)',
  },
  logo: {
    transform: `translatex(-${theme.spacing(1.5)}px)`,
  },
  flexContainer: {
    height: '100%',
  },
  clickContainer: {
    flex: 1,
  },
}));

NavigationBar.propTypes = {
  // map state
  profileDrawerOpen: PropTypes.bool.isRequired,
  numAlerts: PropTypes.number.isRequired,
  navExpanded: PropTypes.bool.isRequired,
  failedMessageCount: PropTypes.number.isRequired,
  brand: PropTypes.object.isRequired, // connect provided
  // map dispatch
  toggleNavigationBarExpanded: PropTypes.func.isRequired,
};

function NavigationBar({
  numAlerts,
  brand,
  profileDrawerOpen,
  navExpanded,
  toggleNavigationBarExpanded,
  failedMessageCount,
}) {
  const classes = useStyles({ navExpanded, profileDrawerOpen });
  const [anchorEl, setAnchorEl] = React.useState({});

  const handleMenuOpen = (key, value) => {
    let buffAnchorEl = { ...anchorEl };

    buffAnchorEl[key] = value;
    setAnchorEl(buffAnchorEl);
  };

  const handleMenuClose = key => {
    let buffAnchorEl = { ...anchorEl };

    buffAnchorEl[key] = null;
    setAnchorEl(buffAnchorEl);
  };

  const settingsElemKey = 'settings';

  let rootClasses = classes.root;
  if (profileDrawerOpen) {
    rootClasses = `${rootClasses} ${classes.rootProfileOpen}`;
  }
  return (
    <Paper elevation={2} classes={{ root: rootClasses }} square>
      <FlexContainer column align="center stretch" className={classes.flexContainer}>
        <NavigationBarItem to="/" title={brand.name || __('PRISMA')} className={classes.logo}>
          <LogoIcon height="48px" width="48px" />
        </NavigationBarItem>
        <NavigationBarItem to="/" title={__('Map')}>
          <MapIcon />
        </NavigationBarItem>

        <Authorization classId="Incident">
          <NavigationBarItem to="/incidents" title={__('Incidents')}>
            <IncidentIcon />
          </NavigationBarItem>
        </Authorization>

        <Authorization classId="IncidentLogEntry">
          <NavigationBarItem to="/notes" title={__('Notes')}>
            <NoteIcon />
          </NavigationBarItem>
        </Authorization>

        <NavigationBarItem to="/alerts" title={__('Notices')} badge badgeCount={numAlerts}>
          {numAlerts === 0 ? <NotificationsIcon /> : <NotificationsActiveIcon />}
        </NavigationBarItem>

        <Authorization classId="Message">
          <NavigationBarItem to="/message/list" title={__('Messages')} badge badgeCount={failedMessageCount}>
            <ForumIcon />
          </NavigationBarItem>
        </Authorization>

        <Authorization classId="Fleet" action="READ">
          <NavigationBarItem to="/fleet" title={__('Fleets')}>
            <FleetIcon />
          </NavigationBarItem>
        </Authorization>

        <NavigationBarItem to="/search" title={__('Search')}>
          <SearchIcon />
        </NavigationBarItem>

        <NavigationBarItem to="/profile" title={__('Profile')}>
          <ProfileIcon />
        </NavigationBarItem>

        <NavigationBarMenuItem elemKey={settingsElemKey} title="Settings" onClick={handleMenuOpen}>
          <SettingsIcon />
        </NavigationBarMenuItem>

        <div aria-hidden onClick={toggleNavigationBarExpanded} className={classes.clickContainer} />
      </FlexContainer>

      {/* MENU */}
      <NavigationSubMenu
        anchorEl={anchorEl[settingsElemKey]}
        keepMounted
        open={Boolean(anchorEl[settingsElemKey])}
        onClose={() => handleMenuClose(settingsElemKey)}
        MenuListProps={{
          onClick: () => handleMenuClose(settingsElemKey),
          onMouseLeave: () => handleMenuClose(settingsElemKey)
        }}
      >
        <Paper>
          <Authorization classId="User">
            <NavigationSubMenuItem to="/users" title={__('Users')}>
              <UsersIcon />
            </NavigationSubMenuItem>
          </Authorization>

          <Authorization classId="Config">
            <NavigationSubMenuItem to="/config/list" title={__('Local Site Config')}>
              <ConfigIcon />
            </NavigationSubMenuItem>
          </Authorization>

          <Authorization classId="RemoteSite">
            <NavigationSubMenuItem to="/remotesite-config/list" title={__('Remote Site Config')}>
              <RemoteSiteConfigIcon />
            </NavigationSubMenuItem>
          </Authorization>
        </Paper>
      </NavigationSubMenu>
    </Paper>
  );
}

/**
 * Redux mappings for nav bar
 */
const mapStateToProps = state => ({
  profileDrawerOpen: state.profileDrawer.open,
  numAlerts: state.notifications.list ? state.notifications.list.length : 0,
  navExpanded: state.navigationBar.expanded,
  brand: state.config.brand || {},
  failedMessageCount: state.message.failedCount,
});

const mapDispatchToProps = dispatch => ({
  toggleNavigationBarExpanded: () => {
    dispatch(navigationActions.toggleNavigationBarExpanded());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NavigationBar);
