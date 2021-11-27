/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Container for easily creating flexbox interface layouts.
 */
import React from 'react';
import PropTypes from 'prop-types';
import withTheme from '@material-ui/core/styles/withTheme';

/* ********************************************************
 *
 * Flex Container
 *
 ******************************************************** */

class FlexContainer extends React.Component {
  static propTypes = {
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
  };

  static defaultProps = {
    padding: 'none',
    column: undefined,
    direction: undefined,
    children: null,
    className: null,
    style: null,
    align: undefined,
    wrap: null,
    classes: undefined,
    onClick: null,
    onMouseOver: null,
    onMouseOut: null,
    onMouseLeave: null,
  };

  static getDerivedStateFromProps(props) {
    return {
      style: FlexContainer.createStyleFromProps(props),
    };
  }

  static createStyleFromProps(props) {
    let style = {
      display: 'flex',
    };

    if (props.align) {
      const align = FlexContainer.parseAlign(props.align);
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
      let { wrap } = props;
      if (props.wrap === 'reverse') {
        wrap = 'wrap-reverse';
      }

      style.flexWrap = wrap;
    }

    // Adds padding to the container
    switch (props.padding) {
      case 'dense': {
        style.padding = props.theme.spacing.unit;
        break;
      }
      case 'normal': {
        style.padding = props.theme.spacing.unit * 3;
        break;
      }
      default: {
        // do nothing
      }
    }

    return style;
  }

  static parseAlign(prop) {
    const style = {
      justifyContent: 'flex-start',
    };

    const split = prop.split(' ');
    style.justifyContent = FlexContainer.standardizeAlignValue(split[0]);
    if (split.length === 2) {
      style.alignItems = FlexContainer.standardizeAlignValue(split[1]);
    }

    return style;
  }

  static standardizeAlignValue(value) {
    switch (value) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      default:
        return value;
    }
  }

  state = {
    style: {},
  };

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
      ...otherProps
    } = this.props;
    /* eslint-disable no-unused-vars */

    // eslint-disable-next-line react/destructuring-assignment
    const stateStyle = this.state.style;

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
      <div className={classNameComputed} {...otherProps}>
        {children}
      </div>
    );
  }
}

export default withTheme()(FlexContainer);
export { FlexContainer as BaseFlexContainer };
