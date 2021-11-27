import React from 'react';
import PropTypes from 'prop-types';

// Components
import DropDownButton from 'components/DropDownButton';

// Helpers & Actions
import { units } from '../../format/units';

const options = [units.nauticalMiles, units.kilometers, units.meters, units.miles, units.feet];

const DistanceSelector = ({ unit, onSelect }) => {
  const onChange = selected => {
    onSelect(selected);
  };

  return <DropDownButton options={options} selected={unit} onChange={onChange} />;
};

DistanceSelector.propTypes = {
  unit: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default DistanceSelector;
