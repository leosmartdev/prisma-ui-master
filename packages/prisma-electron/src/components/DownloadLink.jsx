/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ------------------------------------
 *
 * Similar to <Link> but for download buttons. This wraps the <a> tag with proper styles and
 * provides the child with access to getAttachmentURL to provide easy file download links.
 *
 * Usage:
 * ```
 * <DownloadLink
 *   uri={`/${incident.id}`}
 *   filename='name-of-download'
 *   onClick={this.calledWhenDownloadClicked}
 * >
 *  <IconButton>
 *    <DownloadIcon />
 *  </IconButton>
 * </DownloadLink>
 * ```
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';

DownloadLink.propTypes = {
  /**
   * Passed as the parameter to `server.buildHttpUrl`. This is how the download
   * link is created.
   */
  uri: PropTypes.string.isRequired,
  /**
   * Sets the default name of the file when downloaded. User can change this in the system download
   * window.
   */
  filename: PropTypes.string,
  /**
   * Callback when the link is clicked. Not required. You can use this to close menus or modals
   * if needed.
   *
   * ## Signature
   * `onClick(event: Event) -> void`
   */
  onClick: PropTypes.func,
  /**
   * Child components. This component is a wrapper and expects an inner component with the <Button>
   * or <MenuItem> type component.
   */
  children: PropTypes.element.isRequired,

  /** @private withStyles */
  classes: PropTypes.object.isRequired,
  /** @private mapStateToProps */
  buildHttpUrl: PropTypes.func.isRequired,
};

DownloadLink.defaultProps = {
  filename: 'prisma-file-download',
  onClick: () => {},
};

function DownloadLink({
  uri,
  filename,
  onClick,
  children,

  classes,
  buildHttpUrl,
}) {
  return (
    <a href={buildHttpUrl(uri)} download={filename} onClick={onClick} className={classes.link}>
      {children}
    </a>
  );
}

const mapStateToProps = state => ({
  buildHttpUrl: state.server.buildHttpUrl,
});

export default withStyles({
  link: {
    textDecoration: 'none',
  },
})(connect(mapStateToProps)(DownloadLink));
