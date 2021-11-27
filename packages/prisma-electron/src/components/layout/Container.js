import React from 'react';
import PropTypes from 'prop-types';
import { withTheme } from '@material-ui/styles';

/* ********************************************************
 *
 * Container
 *
 ******************************************************* */

Container.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  className: PropTypes.string,
  classes: PropTypes.object,
};

export default function Container({ children, classes, ...props }) {
  let className = props.className || 'c2-container';
  if (classes && classes.root) {
    className = classes.root;
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

/* ********************************************************
 *
 * Flex Container
 *
 ******************************************************** */

const flexContainerPropTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  style: PropTypes.any,
  className: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
  classes: PropTypes.object, // only accepts {root: <className>}. All others will be ignored
  // If flex=true, align and direction are available for arranging
  // children in a flex container. This allows for quick flexbox styling.
  align: PropTypes.string,
  // Defaults to flex-direction="row" unless column is used eg <FlexContainer column/>
  column: PropTypes.bool,
  // if column is not used, then direction will set the flex direction. Used for programatically
  // setting the direction. If you know the direction already, then using no prop or column
  // is preferred for simplicity and ease of reading the code.
  direction: PropTypes.oneOf(['row', 'column']),
  wrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),

  onClick: PropTypes.func,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onMouseLeave: PropTypes.func,

  // If true, padding will be added to the container.
  padding: PropTypes.oneOf(['none', 'dense', 'normal']),

  // withTheme
  theme: PropTypes.object.isRequired,

  // forwarded ref
  innerRef: PropTypes.any,
};

const flexContainerDefaultProps = {
  padding: 'none',
  column: undefined,
  direction: undefined,
};

class FlexContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      style: this.createStyleFromProps(this.props),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      style: this.createStyleFromProps(props),
    });
  }

  createStyleFromProps(props) {
    let style = {
      display: 'flex',
    };

    if (props.align) {
      const align = this.parseAlign(props.align);
      style = {
        ...style,
        ...align,
      };
    }

    if (props.column) {
      style.flexDirection = 'column';
    } else if (props.direction === 'column') {
      style.flexDirection = props.direction;
    } else {
      style.flexDirection = 'row';
    }

    if (['nowrap', 'wrap', 'wrap-reverse', 'reverse'].includes(props.wrap)) {
      let wrap = props.wrap;
      if (props.wrap === 'reverse') {
        wrap = 'wrap-reverse';
      }

      style.flexWrap = wrap;
    }

    // Adds padding to the container
    switch (props.padding) {
      case 'dense': {
        style.padding = props.theme.spacing(1);
        break;
      }
      case 'normal': {
        style.padding = props.theme.spacing(3);
        break;
      }
      default: {
        // do nothing
      }
    }

    return style;
  }

  parseAlign(prop) {
    const style = {
      justifyContent: 'flex-start',
    };

    const split = prop.split(' ');
    style.justifyContent = this.standardizeAlignValue(split[0]);
    if (split.length === 2) {
      style.alignItems = this.standardizeAlignValue(split[1]);
    }

    return style;
  }

  standardizeAlignValue(value) {
    switch (value) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      default:
        return value;
    }
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      className,
      style,
      align,
      column,
      classes,
      padding,
      direction,
      wrap,
      children,
      innerRef,
      ...otherProps
    } = this.props;

    // Disabling becase style is on props and state
    // eslint-disable-next-line react/destructuring-assignment
    const stateStyle = this.state.style;

    /* eslint-enable no-unused-vars */
    let classNameComputed = className || 'c2-flex-container';
    if (classes && classes.root) {
      classNameComputed = classes.root;
    }

    if (style) {
      otherProps.style = {
        ...stateStyle,
        ...style,
      };
    } else {
      otherProps.style = {
        ...stateStyle,
      };
    }

    return (
      <div ref={innerRef} className={classNameComputed} {...otherProps}>
        {children}
      </div>
    );
  }
}

FlexContainer.propTypes = flexContainerPropTypes;
FlexContainer.defaultProps = flexContainerDefaultProps;
const WrappedFlexContainer = withTheme(FlexContainer);

export {
  WrappedFlexContainer as FlexContainer,
  FlexContainer as BaseFlexContainer, // For testing
};
