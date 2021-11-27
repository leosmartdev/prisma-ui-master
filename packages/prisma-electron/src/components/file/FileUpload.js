import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import Dropzone from 'react-dropzone';

import { FlexContainer } from 'components/layout/Container';
import ErrorBanner from 'components/error/ErrorBanner';

import {
  CircularProgress,
  Typography,
} from "@material-ui/core";

// Icons
import CheckIcon from '@material-ui/icons/Check';

// Actions
import * as uploadActions from 'file/upload';

const styles = () => ({
  dropzone: {
    extends: 'container',
    cursor: 'pointer',
  },
  container: {
    height: '150px',
    border: '2px dashed rgb(102,102,102)',
    borderRadius: '5px',
  },
});

class FileUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      numFilesLeft: 0,
      numFilesTotal: 0,
      numFilesUploaded: 0,
      numFilesFailed: 0,
    };
    this.numFiles = 0;
    this.finishedUploads = [];
    this.failedUploads = [];
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  uploadFile = file => {
    const action = uploadActions.uploadFile(file);
    this.props.createTransaction(action).then(
      response => {
        this.finishedUploads.push(response);
        if (this.mounted) {
          this.setState({
            numFilesLeft: this.numFiles - (this.finishedUploads.length + this.failedUploads.length),
            numFilesUploaded: this.finishedUploads.length,
          });
        }

        this.checkIfDone();
      },
      response => {
        this.failedUploads.push(response);
        if (this.mounted) {
          this.setState({
            numFilesLeft: this.numFiles - (this.finishedUploads.length + this.failedUploads.length),
            numFilesFailed: this.failedUploads.length,
          });
        }
        this.checkIfDone();
      },
    );
  };

  checkIfDone = () => {
    if (this.finishedUploads.length + this.failedUploads.length === this.numFiles) {
      this.props.onUploadFinished(this.finishedUploads, this.failedUploads);
      setTimeout(() => {
        this.resetStats();
      }, 5000);
    }
  };

  resetStats = () => {
    if (this.mounted) {
      this.setState({
        numFilesLeft: 0,
        numFilesTotal: 0,
        numFilesUploaded: 0,
        numFilesFailed: 0,
      });
    }

    this.numFiles = 0;
    this.finishedUploads = [];
    this.failedUploads = [];
  };

  /** ********************************
   * File Upload
   ********************************* */

  onDrop = files => {
    this.setState({
      numFilesLeft: files.length,
      numFilesTotal: files.length,
      numFilesUploaded: 0,
      numFilesFailed: 0,
    });

    this.numFiles = files.length;
    this.finishedUploads = [];
    this.failedUploads = [];

    if (files && files.length > 0) {
      files.map(file => {
        this.uploadFile(file);
      });
    }
  };

  render() {
    const loading = this.state.numFilesLeft > 0;
    if (loading) {
      return (
        <FlexContainer
          column
          align="center center"
          classes={{ root: this.props.classes.container }}
        >
          <CircularProgress variant="indeterminate" color="primary" size={24} />
          <Typography variant="subtitle1" align="center">
            {`${__('Uploading File')} ${this.state.numFilesTotal - this.state.numFilesLeft + 1}
            ${__(' of')} ${this.state.numFilesTotal}`}
          </Typography>
        </FlexContainer>
      );
    }
    if (this.state.numFilesTotal > 0) {
      return (
        <FlexContainer
          column
          align="center center"
          classes={{ root: this.props.classes.container }}
        >
          {this.state.numFilesFailed > 0 && (
            <ErrorBanner message={`${this.state.numFilesFailed} ${__('Uploads Failed')}`} />
          )}
          <FlexContainer>
            {this.state.numFilesFailed === 0 && <CheckIcon />}
            <Typography variant="subtitle1" align="center">
              {`${this.state.numFilesUploaded} `}
              {this.state.numFilesUploaded === 1 ? __('File Uploaded') : __('Files Uploaded')}
            </Typography>
          </FlexContainer>
        </FlexContainer>
      );
    }
    return (
      <Dropzone className={this.props.classes.dropzone} onDrop={this.onDrop}>
        <FlexContainer
          column
          align="center center"
          classes={{ root: this.props.classes.container }}
        >
          <Typography variant="subtitle1" align="center">
            {__('Drop Files Here to Click to Add')}
          </Typography>
        </FlexContainer>
      </Dropzone>
    );
  }
}

FileUpload.propTypes = {
  // Callback when upload is done. Passes two params, array of successfull uploads and array of
  // failed.
  onUploadFinished: PropTypes.func.isRequired,
  // Callback that is used
  uploadStatus: PropTypes.func,
  // Callback if the upload fails
  classes: PropTypes.object.isRequired, // withStyles

  // withTransaction
  createTransaction: PropTypes.func.isRequired,
};

export default (FileUpload = withStyles(styles)(withTransaction(FileUpload)));
