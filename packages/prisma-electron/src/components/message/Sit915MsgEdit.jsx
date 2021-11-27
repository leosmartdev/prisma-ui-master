import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/styles';
import { withTransaction } from 'server/transaction';
import { __ } from 'lib/i18n';

// Components
import { FlexContainer } from 'components/layout/Container';

import {
  TextField,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
} from '@material-ui/core';

// Actions & Helpers
import * as actions from 'message/message';
import { listRemoteSiteConfigs } from 'remotesite-config/remotesite-config';

const style = theme => ({
  button: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
});

class Sit915MsgEdit extends React.Component {
  MAX_CHARS = 25000;
  MAX_CHARS_PER_LINE = 69;

  static propTypes = {
    /** @private withRouter */
    history: PropTypes.object.isRequired,
    /** @private withStyles */
    classes: PropTypes.object.isRequired,
    /** @private withTransaction */
    createTransaction: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    // Group of input fields
    this.formField = [];

    this.state = {
      sites: [],
      remotesite_id: '',
      comm_link_type: '',
      narrative: 'FROM:\nTO:\nSUBJECT:\n',

      fieldErrors: {},
    };

    this.getRemoteSites();
  }

  async getRemoteSites() {
    const { createTransaction } = this.props;
    try {
      const sites = await createTransaction(listRemoteSiteConfigs());
      this.setState({
        sites,
      })
    } catch (error) {

    }
  }

  validate = () => {
    const {
      remotesite_id,
      comm_link_type,
    } = this.state;

    // Initialize
    this.setState({
      fieldErrors: {},
    });

    if (remotesite_id === '') {
      this.setError('remotesite_id', `Destination is required.`);
      return false;
    }

    if (comm_link_type === '') {
      this.setError('comm_link_type', `Communication Link is required.`);
      return false;
    }

    return true;
  };

  setError = (fieldName, errorMsg) => {
    this.setState(prevState => ({
      fieldErrors: {
        ...prevState.fieldErrors,
        [fieldName]: errorMsg,
      },
    }));
  };

  getHelperText = fieldName => {
    const { fieldErrors } = this.state;

    return fieldErrors[fieldName] ? fieldErrors[fieldName] : '';
  };

  onChange = fieldName => event => {
    let value = event.target.value;

    if (fieldName == 'narrative') {
      this.setState({
        fieldErrors: {},
      });

      if (this.isTooLong(value)) {
        this.setError('narrative', `Narrative text must not exceed 25,000 characters.`);
        return;
      }

      // Wrap the narrative text if the length of each line exceed 69
      let eachLines = value.split("\n");
      let findIndex = eachLines.findIndex(elem => {
        return elem.length > this.MAX_CHARS_PER_LINE;
      });

      if (findIndex != -1) {
        let targetLine = eachLines[findIndex];
        eachLines[findIndex] = `${targetLine.slice(0, this.MAX_CHARS_PER_LINE)}\n${targetLine.slice(this.MAX_CHARS_PER_LINE)}`;

        value = eachLines.join("\n");
      }

      // Validate if there is any disallowed character
      let upperCasedValue = value.toUpperCase();
      if (!/^[A-Z0-9-?:().,=\/\+\s]{0,}$/.test(upperCasedValue)) {
        let invalidCharacter = upperCasedValue.replace(/[A-Z0-9-?:().,=\/\+\s]{0,}/gm, '');
        this.setError('narrative', `'${invalidCharacter}' not allowed`);
        return;
      }
    }

    if (fieldName == 'remotesite_id') {
      this.setState({
        [fieldName]: value,
        'comm_link_type': 'FTP',
      });
    } else {
      this.setState({
        [fieldName]: value,
      });
    }    
  };

  isTooLong = value => {
    const numChars = this.getLengthOfText(value);
    if (numChars > this.MAX_CHARS) {
      return true;
    }
    return false;
  };

  getLengthOfText = value => {
    if (value === undefined && this.state.narrative) {
      return this.state.narrative.length;
    }

    if (value !== undefined) {
      return value.length;
    }

    return 0;
  };

  onSave = async () => {
    const {
      createTransaction,
      history,
    } = this.props;

    const {
      remotesite_id,
      comm_link_type,
      narrative,
    } = this.state;

    // Remove unvisible words
    let regex = /(\s|^)(CR|LF|SI|SO|SP|NUL|ENQ|BEL)(\s|$)/g;
    let buff_narrative = narrative.toUpperCase();
    while (regex.test(buff_narrative)) {
      buff_narrative = buff_narrative.replace(regex, ' ').trim();
    }

    const newMessage = {
      remotesite_id,
      comm_link_type,
      narrative: buff_narrative,
    };

    // Validate form data
    let validated = this.validate();

    if (!validated) {
      return;
    }

    await createTransaction(actions.createSit915Message(newMessage));

    history.push(`/message/list`);
  };

  onCancel = () => {
    const { history } = this.props;

    history.push(`/message/list`);
  };

  getCommLinkTypes = () => {
    const {
      sites,
      remotesite_id,
    } = this.state;

    const nullElem = (
      <MenuItem
        value=""
        key="null"
        disabled={true}
      >
        {__('No available communication links')}
      </MenuItem>
    );

    let remotesite = sites.find(elem => {
      return elem.id == remotesite_id;
    });

    if (!remotesite || !remotesite.comm_link_types) {
      return nullElem;
    }

    let availableCommLinks = remotesite.comm_link_types.map(elem => {
      if (elem.enabled) {
        let comm_link_type = elem.name;

        return (
          <MenuItem value={comm_link_type} key={comm_link_type}>
            {comm_link_type}
          </MenuItem>
        );
      }
    }).filter(elem => {
      return elem !== undefined;
    });

    if (availableCommLinks.length == 0) {
      return nullElem;
    }

    return availableCommLinks;
  }

  render() {
    const {
      classes,
    } = this.props;

    const {
      sites,
      remotesite_id,
      comm_link_type,
      narrative,
      fieldErrors,
    } = this.state;

    let remoteSiteMenuItems = (
      <MenuItem
        value=""
        key="null"
        disabled={true}
      >
        {__('No registered remote sites')}
      </MenuItem>
    );
    if (sites.length !== 0) {
      remoteSiteMenuItems = sites.map(site => (
        <MenuItem value={site.id} key={site.id}>
          {`${site.csname} (${site.cscode})`}
        </MenuItem>
      ));
    }

    return (
      <FlexContainer column align="start stretch">
        <FormControl margin="dense">
          <FlexContainer column align="center stretch">
            <InputLabel htmlFor="remotesite_id">{__('Destination')}</InputLabel>
            <Select
              value={remotesite_id}
              onChange={this.onChange('remotesite_id')}
              input={<Input id="remotesite_id" fullWidth />}
            >
              {remoteSiteMenuItems}
            </Select>
            <FormHelperText
              error={fieldErrors.remotesite_id !== undefined}
            >
              {this.getHelperText('remotesite_id')}
            </FormHelperText>
          </FlexContainer>
        </FormControl>
        <FormControl margin="dense">
          <FlexContainer column align="center stretch">
            <InputLabel htmlFor="comm_link_type">{__('Communication Link')}</InputLabel>
            <Select
              value={comm_link_type}
              onChange={this.onChange('comm_link_type')}
              input={<Input id="comm_link_type" fullWidth />}
            >
              {this.getCommLinkTypes()}
            </Select>
            <FormHelperText
              error={fieldErrors.comm_link_type !== undefined}
            >
              {this.getHelperText('comm_link_type')}
            </FormHelperText>
          </FlexContainer>
        </FormControl>
        <TextField
          id="narrative"
          multiline
          rows="10"
          label={__('Narrative Text')}
          margin="dense"
          value={narrative}
          helperText={this.getHelperText('narrative')}
          inputRef={input => { this.formField.push(input); }}
          onChange={this.onChange('narrative')}
          error={fieldErrors.narrative !== undefined}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <Divider className={classes.divider} />

        <FlexContainer align="space-between center">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={this.onSave}
          >
            {__('Send')}
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            onClick={this.onCancel}>
            {__('Cancel')}
          </Button>
        </FlexContainer>

      </FlexContainer>
    );
  }
}

export default withRouter(
  withTransaction(
    withStyles(style)(
      Sit915MsgEdit
    )
  )
);