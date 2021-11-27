import PropTypes from 'prop-types';

const PrismaPropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
    ])),
  ]),
};

export default PrismaPropTypes;

