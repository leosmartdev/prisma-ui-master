import React from 'react';
import PropTypes from 'prop-types';
import { loadFlags } from 'lib/country';
import { withStyles } from '@material-ui/styles';

const flags = loadFlags();

const styles = {
  right: {
    marginRight: '8px',
  },
  none: {
    margin: '0px',
  },
};

const Flag = withStyles(styles)(props => (
  <span className={props.classes[props.margin]}>{flags.get(props.countryCode)}</span>
));

Flag.propTypes = {
  margin: PropTypes.oneOf(['none', 'right']),
};

Flag.defaultProps = {
  margin: 'none',
};

export default Flag;

/*
transaction.createTransactions([uploadAction, attachAction], onUpdate,
  rollback=[uploadActionUndo, attachActionUndo]).catch((errors, fieldErrors) => {
    [uploadActionResult, attachActionResult] = errors;
    if(uploadActionResult.success && !attachAction.success) {
        transaction.createTransaction(removeFileAction).catch((errors, fieldErrors) => { });
    }

})

responses.errors;
responses.results;

*/
