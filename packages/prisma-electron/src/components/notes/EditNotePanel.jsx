/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/styles';

// Components
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	IconButton,
} from "@material-ui/core";

// Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CommentIcon from '@material-ui/icons/Comment';
import EditIcon from '@material-ui/icons/Edit';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';

// App Components
import FlexContainer from 'components/FlexContainer';
import ErrorBanner from 'components/error/ErrorBanner';
import NoteEdit from 'components/notes/NoteEdit';
import PreviewPDF from 'components/notes/PreviewPDF';

// Helpers
import { __ } from 'lib/i18n';
import { formatTime, scaleImage } from 'components/notes/helpers';
import getTruncatedString from 'lib/text';
import { withTransaction } from 'server/transaction';
import * as fileActions from "file/download";
import { types } from 'incident/log-entries';

/**
 * Component for displaying a simple notes view inside the expansion panel details.
 */
Notes.propTypes = {
	/** Editing note */
	currentNote: PropTypes.object.isRequired,

	/** @private withStyles */
	classes: PropTypes.object.isRequired,
};

function Notes({ currentNote, classes }) {
	if (!currentNote.note) {
		return null;
	}

	return (
		<Typography variant="body1" className={classes.note}>
			{currentNote.note}
		</Typography>
	);
}

class EditNotePanel extends React.Component {
	static Notes = withStyles({
		note: {
			whiteSpace: 'pre-line',
			wordWrap: 'break-word',
		},
	})(Notes);

	static propTypes = {
		/**
		 * The note being editing.
		 */
		currentNote: PropTypes.object.isRequired,
		/**
		 * Primary text. If null then note is displayed or if that is null then type is shown.
		 * ----------------------------------------------
		 * | O  PRIMARY            timestamp    actions |
		 * ----------------------------------------------
		 */
		primary: PropTypes.string,
		/**
		 *  Icon to start the expansion panel.
		 * ----------------------------------------------
		 * | icn  primary            timestamp    actions |
		 * ----------------------------------------------
		 */
		icon: PropTypes.element,
		/**
		 * Actions to display on the right side of the summary . They will only be displayed during a
		 * hover over this expansion panel.
		 *
		 * NOTE: If you handle your own `onClick` for your action, you must call
		 * `event.stopPropagation()` from the source event, otherwise the expansion panel will toggle
		 * when your click even propagates.
		 *
		 * ----------------------------------------------
		 * | O  primary            timestamp    ACTIONS |
		 * ----------------------------------------------
		 */
		summaryActions: PropTypes.node,
		/*
		 * Content to display in the expanded details section when the row is toggled.
		 */
		children: PropTypes.element,
		/**
		 * Allows for external control of the expansion panel. These props will be sent directly to the
		 * Material UI <ExpansionPanel> Component.
		 */
		expansionPanelProps: PropTypes.object,
		/**
		 * When set to false, the edit button to edit the note for this note will be hidden.
		 */
		disableNoteEditing: PropTypes.bool,
		/**
		 * Callback when the user has edited the note.
		 */
		onNoteSave: PropTypes.func,
		/** @private withStyles */
		classes: PropTypes.object.isRequired,
	};

	static defaultProps = {
		primary: null,
		summaryActions: null,
		icon: <CommentIcon />,
		children: null,
		expansionPanelProps: {},
		disableNoteEditing: false,
		onNoteSave: () => { },
	};

	state = {
		isEditing: false,
		isExpanded: false,
		isHovering: false,
		isPdf: false,
		pdfData: null,
		isImage: false,
		imageData: null,
		canvasWidth: 400,
		canvasHeight: 400,
	};

	componentDidMount = async () => {
		const { currentNote } = this.props;

		if (currentNote.type != types.FILE) {
			return;
		}

		let fileId = currentNote.attachment.id;
		if (currentNote.attachment.type == 'application/pdf') {
			let pdfData = await this.getFile(fileId);

			this.setState({
				pdfData,
				isPdf: true,
			});
		} else if (currentNote.attachment.type.startsWith('image')) {
			let imageData = await this.getFile(fileId);

			this.drawImage(imageData);

			this.setState({
				imageData,
				isImage: true,
			});
		}
	};

	componentDidUpdate = () => {
		const { isImage, imageData, isEditing } = this.state;

		if (isImage && !isEditing) {
			this.drawImage(imageData);
		}
	};

	onNoteSave = async note => {
		try {
			await this.props.onNoteSave({
				...this.props.currentNote,
				note,
			});
			this.hideNoteEdit();
		} catch (error) {
			this.setState({
				noteEditFailedBannerText: error.message,
			});
		}
	};

	showNoteEdit = event => {
		this.setState({
			isEditing: true,
			isExpanded: true,
		});

		event.stopPropagation();
	};

	hideNoteEdit = () => {
		this.setState({
			isEditing: false,
		});
	};

	/**
	 * Called when expansion panel is clicked and the expansion is going to be changed.
	 */
	onChange = (event, expanded) => {
		const { expansionPanelProps } = this.props;

		// User is overriding expansion
		if (expansionPanelProps && expansionPanelProps.expanded) {
			event.stopPropagation();
			this.setState({ isExpanded: expansionPanelProps.expanded });
			return;
		}

		// We are editing, don't allow propagation.
		if (this.state.isEditing) {
			event.stopPropagation();
			this.setState({ isExpanded: true });
			return;
		}

		this.setState({
			isExpanded: expanded,
		});
	};

	/**
	 * Called when the user is no longer hovering over the expansion panel.
	 */
	onHoverOut = () => {
		this.setState({
			isHovering: false,
		});
	};

	/**
	 * Called when the user starts hovering over the expansion panel.
	 */
	onHoverIn = () => {
		this.setState({
			isHovering: true,
		});
	};

	renderSummaryActions = () => {
		const { disableNoteEditing, summaryActions, classes } = this.props;

		const { isHovering, isExpanded } = this.state;

		const { isEditing } = this.state;

		/* We render a span here so we ensure the space is provided for the actions,
		 * but if just send null to FlexContainer props are invalid and we get console
		 * errors.
		 */
		if (!isHovering && !isExpanded) {
			return <span className={classes.summaryActions} />;
		}

		return (
			<FlexContainer className={classes.summaryActions} align="end center">
				{summaryActions}
				{!disableNoteEditing && !isEditing && (
					<IconButton onClick={this.showNoteEdit}>
						<EditIcon fontSize="small" />
					</IconButton>
				)}
			</FlexContainer>
		);
	};

	getFile = async fileId => {
		const { createTransaction } = this.props;

		let data = await createTransaction(fileActions.downloadFile(fileId))
			.then(async response => await response.blob())
			.then(blob => URL.createObjectURL(blob));

		return data;
	}

	drawImage = imageData => {
		const { isEditing } = this.state;

		let img = new Image();

		img.src = imageData;

		img.onload = () => {
			if (!this.canvas || isEditing) {
				return;
			}

			let ctx = this.canvas.getContext('2d');
			let imgWidth = img.width;
			let imgHeight = img.height;
			let canvasWidth = this.canvas.parentNode.clientWidth;
			let canvasHeight = this.canvas.parentNode.clientHeight;
			let { displayWidth, displayHeight } = scaleImage(canvasWidth, canvasHeight, imgWidth, imgHeight);
			let x = (canvasWidth - displayWidth) / 2;
			let y = (canvasHeight - displayHeight) / 2;

			this.setState({
				canvasWidth,
				canvasHeight,
			});

			ctx.drawImage(img, 0, 0, imgWidth, imgHeight, x, y, displayWidth, displayHeight);
		}
	};

	renderPDFPreview = pdfData => {
		if (pdfData) {
			return (
				<PreviewPDF
					isCreating={false}
					previewPDF={pdfData}
				/>
			);
		} else {
			return (
				<FlexContainer column align="start center">
					<Typography variant="body1">{__('There is no result.')}</Typography>
				</FlexContainer>
			);
		}
	};

	renderImagePreview = () => {
		const {
			canvasWidth,
			canvasHeight,
		} = this.state;

		return (
			<FlexContainer align="center center">
				<canvas
					ref={ref => {
						this.canvas = ref;
					}}
					height={canvasHeight}
					width={canvasWidth}
				/>
			</FlexContainer>
		);
	};

	render() {
		const {
			currentNote,
			classes,
			primary,
			icon,
			children,
			expansionPanelProps,
		} = this.props;

		const {
			isEditing,
			isExpanded,
			noteEditFailedBannerText,
			isPdf,
			pdfData,
			isImage,
		} = this.state;

		const primaryText = currentNote.note || currentNote.type;
		const iconClasses = `${classes.summaryIcon} ${currentNote.target ? classes.searchObject : ''}`;
		const entryIcon = currentNote.target ? <LocationSearchingIcon /> : icon;
		const hasDetails = children !== null && typeof children !== 'undefined';
		let details = children;
		let timestamp = null;

		// Set timestamp
		if (currentNote.timestamp) {
			timestamp = formatTime(currentNote.timestamp.seconds * 1000, 'l LT z');
		}

		// If the user did not set any details and we have a note, default to showing the note.
		if (!hasDetails && currentNote.note) {
			details = <EditNotePanel.Notes currentNote={currentNote} />;
		}

		let staticContent = details;
		if (isPdf == true) {
			staticContent = this.renderPDFPreview(pdfData);
		} else if (isImage == true) {
			staticContent = this.renderImagePreview();
		}

		return (
			<Accordion
				onChange={this.onChange}
				onMouseOver={this.onHoverIn}
				onFocus={this.onHoverIn}
				onBlur={this.onHoverOut}
				onMouseLeave={this.onHoverOut}
				{...expansionPanelProps}
				expanded={isExpanded}
			>
				<AccordionSummary expandIcon={details ? <ExpandMoreIcon /> : null}>
					<FlexContainer align="start center" className={classes.summary}>
						{/** Icon */}
						{React.cloneElement(entryIcon, { className: iconClasses })}

						{/** Primary Text */}
						<FlexContainer align="start stretch" className={classes.summaryPrimary}>
							<FlexContainer column align="center start" className={classes.summaryPrimary}>
								<Typography variant="body2" className={classes.summaryPrimaryText}>
									{getTruncatedString(primary || primaryText, 85)}
								</Typography>
							</FlexContainer>
						</FlexContainer>

						{/** Timestamp */}
						<Typography variant="body1" className={classes.summaryTimestamp}>
							{timestamp}
						</Typography>

						{/** Actions */}
						{this.renderSummaryActions()}
					</FlexContainer>
				</AccordionSummary>
				{(isEditing || details || isPdf || isImage) && (
					<AccordionDetails className={classes.details}>
						<FlexContainer column align="start stretch" className={classes.detailsContainer}>
							{!isEditing ? (
								staticContent
							) : (
								<FlexContainer column align="start center">
									<ErrorBanner message={noteEditFailedBannerText} />
									<NoteEdit
										note={currentNote.note}
										rows={20}
										fullWidth
										onCancel={this.hideNoteEdit}
										onSave={this.onNoteSave}
									/>
								</FlexContainer>
							)}
						</FlexContainer>
					</AccordionDetails>
				)}
			</Accordion>
		);
	}
}

export default withStyles(theme => ({
	summary: {
		width: '100%',
	},
	summaryIcon: {
		color: 'white',
		marginRight: theme.spacing(2),
		alignSelf: 'center',
	},
	searchObject: {
		color: theme.palette.secondary.light,
	},
	summaryPrimary: {
		flex: 6,
		minWidth: 0,
		width: '0px', // This prevents the flex on smaller sizes from overflowing the summary
		marginRight: theme.spacing(3),
	},
	summaryPrimaryText: {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		width: '100%',
	},
	summaryTimestamp: {
		flex: 2,
	},
	summaryActions: {
		flex: 1,
		height: '44px', // set height or the panel will flicker on hover as height changes by 1px
		alignSelf: 'center',
		'& > button, & > a > button': {
			marginLeft: -theme.spacing(1),
		},
	},
	details: {
		maxHeight: '500px',
		overflowY: 'auto',
		width: '100%',
	},
	detailsContainer: {
		width: '100%',
	},
}))(withTransaction(EditNotePanel));
