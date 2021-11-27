import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Authorization extends Component {
  isUnlessOnly = () => {
    const { session, unlessOnly } = this.props;
    return (
      unlessOnly &&
      session.permissions.length === 1 &&
      session.permissions[0].classId === unlessOnly
    );
  };

  render() {
    const { classId, action, session, denied, children } = this.props;
    if (hasPermission(session, classId, action)) {
      if (!this.isUnlessOnly()) {
        return children;
      }
    } else if (denied) {
      return children;
    }
    return null;
  }
}

Authorization.propTypes = {
  classId: PropTypes.string,
  action: PropTypes.string,
  denied: PropTypes.bool,
  unlessOnly: PropTypes.string,
  session: PropTypes.object.isRequired, // redux provided
  children: PropTypes.any.isRequired, // react provided
};

export function hasPermission(session, classId, action) {
  const { permissionMap } = session;
  let allowed = false;
  if (classId === undefined) {
    allowed = session.state !== 'initial';
  } else if (permissionMap) {
    // permissionMap is created in c2/src/session/session.js/reducer
    if (permissionMap[classId]) {
      if (!action) {
        allowed = true;
      } else {
        allowed = permissionMap[classId + action];
      }
    }
  }
  return allowed;
}

const mapStateToProps = state => ({
  session: state.session,
});
export default connect(mapStateToProps)(Authorization);
