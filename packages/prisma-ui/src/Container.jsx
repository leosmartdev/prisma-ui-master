import React from 'react';
import PropTypes from 'prop-types';

Container.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  classes: PropTypes.object,
  className: PropTypes.string,
};

Container.defaultProps = {
  children: null,
  classes: undefined,
  className: null,
};

export default function Container({ children, classes, className, ...props }) {
  let computedClassNames = className || 'c2-container';
  if (classes && classes.root) {
    computedClassNames = classes.root;
  }

  return (
    <div className={computedClassNames} {...props}>
      {children}
    </div>
  );
}
