import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withStyles } from '@material-ui/styles';
import { Document, Page, pdfjs } from "react-pdf";
import { pdfjsworker } from "pdfjs-dist/es5/build/pdf.worker.entry";

// Component Imports
import FlexContainer from 'components/FlexContainer';

import {
  Divider,
  IconButton,
  Tooltip,
  TextField,
  FormControlLabel,
} from '@material-ui/core';

// Icons
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import GetAppIcon from '@material-ui/icons/GetApp';
import AddIcon from '@material-ui/icons/Add';
import BackIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';

class PreviewPDF extends React.Component {
  static propTypes = {
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** 
     * PDF to preview 
     * Uint8Array | URL
     */
    previewPDF: PropTypes.any,
    /** PDF file name */
    filename: PropTypes.any,
    /** Create note with previewing PDF file */
    onCreateNote: PropTypes.any,
    /** True when showing PDF on CreateNotePanel */
    isCreating: PropTypes.bool.isRequired,
    /** Download function */
    onDownload: PropTypes.any,
    showDownloadButton: PropTypes.bool.isRequired,
    showCreateNoteButton: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    isCreating: true,
    showDownloadButton: false,
    showCreateNoteButton: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      // Page width
      width: 0,
      // Current scale
      scale: 1,
      // PDF src
      pdfSrc: null,
      numPages: 1,
      curPage: 1,
      pageEditorValue: 1,
    }

    // Set pdf-js worker
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsworker;
  }

  componentDidMount = () => {
    const { previewPDF, isCreating } = this.props;

    // To fit to screen
    let width = this.pdf_container.getBoundingClientRect().width;

    let pdfSrc;
    if (isCreating) {
      pdfSrc = { data: previewPDF };
    } else {
      pdfSrc = { url: previewPDF };
    }

    this.setState({
      pdfSrc,
      width,
    });
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.isCreating == true && JSON.stringify(nextProps.previewPDF) != JSON.stringify(this.props.previewPDF) ||
      nextProps.isCreating == false && nextProps.previewPDF != this.props.previewPDF) {
      let pdfSrc;
      if (nextProps.isCreating) {
        pdfSrc = { data: nextProps.previewPDF };
      } else {
        pdfSrc = { url: nextProps.previewPDF };
      }

      this.setState({
        pdfSrc,
      });
    }
  };

  onDocumentLoad = ({ numPages }) => {
    this.setState({
      numPages,
    });
  };

  // Zoom in
  onZoomIn = () => {
    this.setState(prevState => ({
      scale: prevState.scale + 0.1,
    }));
  };

  // Zoom out
  onZoomOut = () => {
    const { scale } = this.state;

    if (scale >= 0.2) {
      this.setState(prevState => ({
        scale: prevState.scale - 0.1,
      }));
    }
  };

  // Fit to width
  onFitToWidth = () => {
    this.setState({
      scale: 1,
    });
  };

  // Download PDF file
  onDownload = () => {
    const { filename, previewPDF, onDownload } = this.props;

    onDownload(filename, previewPDF);
  };

  // Create note
  onCreateNote = () => {
    const { previewPDF, filename, onCreateNote } = this.props;

    onCreateNote(previewPDF, filename);
  };

  onBackPage = () => {
    this.setState(prevState => {
      let prevPage = prevState.curPage - 1;

      return {
        curPage: prevPage,
        pageEditorValue: prevPage,
      };
    });
  };

  onNextPage = () => {
    this.setState(prevState => {
      let nextPage = prevState.curPage + 1;

      return {
        curPage: nextPage,
        pageEditorValue: nextPage,
      };
    });
  };

  onChangePageEditor = event => {
    this.setState({
      pageEditorValue: parseInt(event.target.value),
    });
  };

  onKeyDownPageEditor = event => {
    const { numPages, curPage } = this.state;
    const key = event.key;
    let curValue = event.target.value;

    if (isNaN(key)) {
      event.preventDefault();
    }

    curValue = parseInt(curValue);

    if (key === 'ArrowUp' && curValue !== numPages) {
      this.setState({
        pageEditorValue: curValue + 1,
      });
    }

    if (key === 'ArrowDown' && curValue !== 1) {
      this.setState({
        pageEditorValue: curValue - 1,
      });
    }

    if (key === 'Enter') {
      if (curValue > numPages || curValue <= 0) {
        this.setState({
          pageEditorValue: curPage,
        });

        return;
      }

      this.setState({
        curPage: curValue,
      });
    }
  };

  render() {
    const {
      classes,
      showDownloadButton,
      showCreateNoteButton,
    } = this.props;

    const {
      width,
      scale,
      pdfSrc,
      numPages,
      curPage,
      pageEditorValue,
    } = this.state;

    return (
      <div
        id="pdf_container"
        className={classes.container}
        ref={ref => this.pdf_container = ref}
      >
        <Divider
          classes={{ root: classes.divider }}
        />
        <FlexContainer align="center center">
          {numPages > 1 && (
            <React.Fragment>
              {/* PAGE */}
              <IconButton
                onClick={this.onBackPage}
                disabled={curPage === 1}
              >
                <BackIcon />
              </IconButton>

              <FormControlLabel
                classes={{ root: classes.pageEditorLabel }}
                control={(
                  <TextField
                    classes={{ root: classes.pageEditor }}
                    value={pageEditorValue}
                    onChange={this.onChangePageEditor}
                    onKeyDown={this.onKeyDownPageEditor}
                  />
                )}
                label={` / ${numPages}`}
              />

              <IconButton
                onClick={this.onNextPage}
                disabled={curPage === numPages}
              >
                <NextIcon />
              </IconButton>

              <Divider orientation="vertical" flexItem />
            </React.Fragment>
          )}

          {/* SIZE */}
          <IconButton onClick={this.onZoomOut}>
            <ZoomOutIcon />
          </IconButton>
          <span className={classes.scale}>
            {`${parseInt(scale * 100)} %`}
          </span>
          <IconButton onClick={this.onZoomIn}>
            <ZoomInIcon />
          </IconButton>
          <Tooltip title="Fit to width">
            <IconButton onClick={this.onFitToWidth}>
              <ZoomOutMapIcon />
            </IconButton>
          </Tooltip>
          {showDownloadButton && (
            <Tooltip title="Download">
              <IconButton onClick={this.onDownload}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
          )}
          {showCreateNoteButton && (
            <Tooltip title="Create note">
              <IconButton onClick={this.onCreateNote}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </FlexContainer>
        <Document
          file={pdfSrc}
          className={scale < 1 ? classes.pdfDocument : ''}
          onLoadSuccess={this.onDocumentLoad}
        >
          <Page
            pageNumber={curPage}
            renderTextLayer={false}
            width={width}
            scale={scale}
          />
        </Document>
      </div>
    );
  }
}

export default withStyles(() => ({
  container: {
    marginTop: '10px',
    overflowX: 'auto',
  },
  divider: {
    margin: '10px 0',
  },
  scale: {
    color: 'white',
  },
  pdfDocument: {
    display: 'flex',
    justifyContent: 'center',
  },
  pageEditor: {
    '& input': {
      textAlign: 'center'
    },
    width: 40,
  },
  pageEditorLabel: {
    'marginLeft': 0,
    'marginRight': 5,
  },
}))(PreviewPDF);