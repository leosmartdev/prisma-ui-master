import React from 'react';
import PropTypes from 'prop-types';

// Components
import DropDownButton from 'components/DropDownButton';

// Helpers & Actions
import * as Patterns from 'zones/patterns';

export default class PatternSelector extends React.Component {
  patternSelected = option => {
    const { onSelect } = this.props;
    onSelect(option.value.id);
  };

  render = () => {
    const items = Patterns.table.map(pattern => ({
      id: pattern.id,
      title: pattern.name,
      value: pattern,
    }));

    return <DropDownButton options={items} onChange={this.patternSelected} />;
  };
}

PatternSelector.propTypes = {
  selected: PropTypes.string,
  onSelect: PropTypes.func,
};
