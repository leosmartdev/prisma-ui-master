/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE SOLE
 * PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE PRIOR
 * WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * ----------------------
 * Provides access to Incident data.
 *
 * TODO: There are a number of things remaining to clean this up.
 * - We need to create the branch HOC to handle loading and null states (they are passed in as func
 *   params to withIncident, not on the child comp) EG
 * ```
 * withIncident(
 *   props => ({ props.id }),
 *   <IncidentDetailsLoading />,
 *   <IncidentDetailsEmpty />,
 * )(Wrapped);
 * ```
 * - Right now, for IncidentDetails HOC order matters for mapPropsToRequest (name isn't great for
 *   that func either). Order matters because we grab the match params to get the id and return it,
 *   but the props come from this HOC not just the child Component. Unsure if we can get around
 *   this but we should investigate.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { __ } from 'lib/i18n';
import { withTransaction } from 'server/transaction';
import { connect } from 'react-redux';

// Actions & Helpers
import { isTransferred, STATE } from './helpers';
import { updateIncident, getIncident, assignIncidentToUser } from 'incident/incident';
import { getIncidentManagers } from 'auth/roles';
import { createLogEntry, updateLogEntry, deleteLogEntry } from 'incident/log-entries';
import { forwardIncidentToSite, getMulticastsForIncident } from 'incident/forward-incident';
import { getSite } from 'site/site';
import RequestError from 'server/RequestError';

import loglevel from 'loglevel';

const log = loglevel.getLogger('incidents');

/**
 * withIncident wraps a component that requires a single Incident as it's data input. This HOC
 * will provide the following props to the inner Component:
 *  - incident {object} The requested incident from the server (or redux store). Null if not found
 *    or loading
 *  - incidentIsLoading {bool} Informs the child if there is an outstanding incident request with
 *    the server.
 *  - multicasts {array} List of all outstanding multicasts for this incident. Empty array if no
 *    multicasts are found. Completed multicasts will not be removed from the list if they created
 *    using `forwardIncidentToSite`, but no completed multicasts will be added during mount.
 *  - onSave {func} Callback to save the incident. `onSave(updatedIncident: object) => Promise`
 *  - onLogEntrySave {func} Callback to update a log entry.
 *    `onLogEntrySave(logEntry: object) => Promise(incident, RequestError)`
 *  - onLogEntryRemove {func} Callback to remove a log entry.
 *    `onLogEntryRemove(id: string) => Promise`
 *  - onLogEntryAdd {func} Callback to add a log entry.
 *    `onLogEntryAdd(logEntry: string) => Promise`
 *  - onCloseIncident {func} Callback to close an incident. Requires IncidentCommander privileges.
 *    `onCloseIncident(outcome: string, synopsis: string) => Promise`
 *  - onReopenIncident {func} Callback to reopen an incident. Requires IncidentCommander privileges.
 *    `onReopenIncident(reason: string) => Promise`
 *  - forwardIncidentToSite {func} Starts forwarding an incident to the provided site.
 *    `forwardIncidentToSite(site: object) => Promise`
 *
 * ## Usage
 *
 * Basic usage:
 * ``
 * export default withIncident(props => ({ incidentId: props.incidentId }))(WrappedComponent);
 * ```
 *
 * With Params:
 * ```
 * export default withIncident((props) => {
 *   const { incidentId } = props;
 *   const params = {
 *     someGetParam: 'value',
 *     includeLogEntries: false,
 *   };
 *
 *   return {
 *     incidentId,
 *     params,
 *   };
 * })(WrappedComponent);
 * ```
 *
 * @param {func} mapPropsToRequest Maps the incoming props to the request values needed to get
 *     the incident. Expected to return incidentId of the incident to retrieve, and optional params
 *     object if GET params need to be passed to the request. Will be called when the component is
 *     mounting and on all prop updates.
 *     `mapPropsToRequest(props: object) => { incidentId: string, params: object}`
 */
export const withIncident = mapPropsToRequest => WrappedComponent => {
  class WithIncident extends React.Component {
    static propTypes = {
      /** @private Privided through withTransaction */
      createTransaction: PropTypes.func.isRequired,
      /** @private connect(mapStateToProps) */
      incidents: PropTypes.array.isRequired,
      /** @private connect(mapStateToProps) */
      multicastMap: PropTypes.object.isRequired,
      /** @private connect(mapStateToProps) */
      users: PropTypes.array.isRequired,
    };

    state = {
      /**
       * The incident retrieved from the server. Null if we do not have the incident yet.
       */
      incident: null,
      /**
       * True when request is loading.
       */
      isLoading: false,
      /**
       * Error message banner text. Provides feedback if a request fails. Child
       * can render or not as they see fit. Null when there are no errors.
       */
      errorBannerText: null,
      /**
       * Field errors if a save or update fails. This provides direct feedback if the user
       * entered incorrect data in a form. Null when there are no field errors.
       */
      fieldErrors: null,
      /**
       * List of all outstanding multicasts for this incident. Empty array if no multicasts are
       * found. Completed multicasts will not be removed from the list if they created using
       * `forwardIncidentToSite`, but no completed multicasts will be added during mount.
       *
       * Will update when the multicast is updated.
       */
      multicasts: [],
    };

    constructor(props) {
      super(props);

      this._isMounted = false;
      this.incidentId = null;
      this.params = undefined;
      this.getIncidentUsersTries = 0; // only allow so many tries before giving up
      this.multicastIds = new Set(); // list of multicast IDs associated with this incident.
    }

    componentDidMount() {
      this._isMounted = true;

      // Set incident ID from the child component provided mapPropsToRequest.
      const { incidentId, params } = mapPropsToRequest(this.props);
      this.params = params;
      if (incidentId !== this.incidentId) {
        this.incidentId = incidentId;
      }

      // Get the incident object
      const incident = this.props.incidents.find(incident => incident.id === this.incidentId);
      if (typeof incident === 'undefined') {
        this.getIncident();
      }

      // Get list of incident managers for displaying their details.
      this.getIncidentUsersTries = 0; // only allow so many tries before giving up
      this.usersLoading = true;
      this.props.createTransaction(getIncidentManagers());

      // Get all multicasts for this incident.
      this.getMulticastsForIncident();

      if (this._isMounted) {
        this.setState({ incident });
      }
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    componentWillReceiveProps(newProps) {
      // update incidents and multicasts
      const incident = newProps.incidents.find(incident => incident.id === this.incidentId);
      const multicasts = this.filterMulticastMap(newProps.multicastMap);

      // Get the incident users
      if (!this.usersLoading && (!newProps.users || newProps.users.length === 0)) {
        if (this.getIncidentUsersTries < 5) {
          this.getIncidentUsersTries += 1;
          this.createTransaction(getIncidentManagers());
        }
      } else if (newProps.users && newProps.users.length > 0) {
        // users finished loading.
        this.usersLoading = false;
      }

      if (this._isMounted) {
        this.setState({ incident, multicasts });
      }
    }

    /**
     * Filters the multicastMap from redux into just the multicasts associated with the multicastIds
     * on this instance.
     *
     * @param {object} multicastMap The multicasts from redux.
     * @return {array} List of multicasts filtered by the list of multicastIds
     */
    filterMulticastMap = multicastMap => {
      const multicasts = [];
      for (const id of this.multicastIds) {
        multicasts.push(multicastMap[id]);
      }
      return multicasts;
    };

    /**
     * Retreives the list of multicasts associated with this incident.
     * This will set the list of `multicastIds` on the instance. This
     * is the list that will determine which multicasts belong to this
     * incident.
     */
    getMulticastsForIncident = async () => {
      try {
        const action = getMulticastsForIncident(this.incidentId);
        const multicasts = await this.props.createTransaction(action);

        if (multicasts) {
          const ids = multicasts.map(multicast => multicast.id);
          this.multicastIds = new Set([...this.multicastIds, ...ids]);
          if (this._isMounted) {
            this.setState((prevState, props) => ({
              multicasts: this.filterMulticastMap(props.multicastMap),
            }));
          }
        }
      } catch (error) {
        log.error('Failed to get list of multicasts for this incident', error);
      }
    };

    /**
     * Gets the site that is set as the destination in the provided multicast from the server.
     * This lets us get useful information like name, position, etc...
     *
     * @param {object} multicast The incident forward multicast object.
     * @return {object} The site object, or null if a failure occurred.
     */
    getSiteForMulticast = async multicast => {
      if (multicast.destinations.length !== 1) {
        log.error('Multicast should have a single site destination. Got: ', multicast.destinations);
        return null;
      }

      try {
        const action = getSite(multicast.destinations[0].id);
        const site = await this.props.createTransaction(action);
        log.debug('Got site', site);
        return site;
      } catch (error) {
        log.error(`Failed to get site information for multicast ${multicast.id}.`, error);
        return null;
      }
    };

    /**
     * Saves an incident.
     *
     * Takes an incident and creates a transaction to save the incident to the server. Will return
     * the updated incident on success or on failure, will throw `RequestError`. Request error will
     * contain fieldErrors if any were found as well as a human readable message. The message will
     * take into account the status code and shouldn't have a need to be modified by the child
     * component.
     *
     * @param {object} incident The incident to be saved.
     * @return {object} The updated incident returned from the server.
     * @throws {RequestError} An error containing the response from the server, fieldErrors, and a
     *                        message in human readable localized form.
     */
    onSave = async incident => {
      const action = updateIncident(incident);

      try {
        const updatedIncident = await this.props.createTransaction(action);
        if (this._isMounted) {
          this.setState({ incident: updatedIncident });
        }
        return updatedIncident;
      } catch (error) {
        log.error('Failed to save incident', error);
        const defaultMessage = __('An error occurred saving the incident. Please try again later.');
        throw RequestError.parseRequestErrorFromResponse(error, defaultMessage);
      }
    };

    /**
     * Adds a log entry on an incident.
     *
     * Adds the log entry to the incident.
     * Will return the entire updated incident (not just the log entry) on success or on failure,
     * will throw `RequestError`. Request error will contain fieldErrors if any were found as well
     * as a human readable message. The message will take into account the status code and shouldn't
     * have a need to be modified by the child component.
     *
     * @param {object} logEntry The log entry to add.
     * @return {object} The entire updated incident returned from the server.
     * @throws {RequestError} An error containing the response from the server, fieldErrors, and a
     *                        message in human readable localized form.
     */
    onLogEntryAdd = async logEntry => {
      try {
        const action = createLogEntry(this.state.incident, logEntry);
        const incident = await this.props.createTransaction(action);
        if (this._isMounted) {
          this.setState({ incident });
        }
        return incident;
      } catch (error) {
        // TODO customize the error message based on the type of log entry being created
        log.error('Failed to create log Entry', error);
        const defaultMessage = __(
          'An error occurred creating the log entry. Please try again later.',
        );
        throw RequestError.parseRequestErrorFromResponse(error, defaultMessage);
      }
    };

    /**
     * Updates a log entry on an incident.
     *
     * Changes the log entry on the incident. The log entry must contain the ID of the entry.
     * Will return the entire updated incident (not just the log entry) on success or on failure,
     * will throw `RequestError`. Request error will contain fieldErrors if any were found as well
     * as a human readable message. The message will take into account the status code and shouldn't
     * have a need to be modified by the child component.
     *
     * @param {object} logEntry The log entry to update.
     * @return {object} The entire updated incident returned from the server.
     * @throws {RequestError} An error containing the response from the server, fieldErrors, and a
     *                        message in human readable localized form.
     */
    onLogEntrySave = async logEntry => {
      try {
        const action = updateLogEntry(this.state.incident, logEntry);
        const incident = await this.props.createTransaction(action);
        if (this._isMounted) {
          this.setState({ incident });
        }
        return incident;
      } catch (error) {
        // TODO customize the error message based on the type of log entry being saved
        log.error('Failed to save log Entry', error);
        const defaultMessage = __(
          'An error occurred saving the log entry. Please try again later.',
        );
        throw RequestError.parseRequestErrorFromResponse(error, defaultMessage);
      }
    };

    /**
     * Removes a log entry from an incident.
     *
     * Removes the log entry. The log entry must contain the ID of the entry.
     * Will return the entire updated incident (not just the log entry) on success or on failure,
     * will throw `RequestError`. Request error will contain fieldErrors if any were found as well
     * as a human readable message. The message will take into account the status code and shouldn't
     * have a need to be modified by the child component.
     *
     * @param {object} logEntry The log entry to remove.
     * @return {object} The entire updated incident returned from the server.
     * @throws {RequestError} An error containing the response from the server, fieldErrors, and a
     *                        message in human readable localized form.
     */
    onLogEntryRemove = async logEntry => {
      try {
        const action = deleteLogEntry(this.state.incident, logEntry);
        const incident = await this.props.createTransaction(action);
        if (this._isMounted) {
          this.setState({ incident });
        }
        return incident;
      } catch (error) {
        // TODO customize the error message based on the type of log entry being removed
        log.error('Failed to remove log Entry', error);
        const defaultMessage = __(
          'An error occurred removing the log entry. Please try again later.',
        );
        throw RequestError.parseRequestErrorFromResponse(error, defaultMessage);
      }
    };

    /**
     * Assigns the incident to the provided user. If assignmentType is provided, the assignment will
     * be for that type, otherwise, this function will change the  `assignee` on the incident.
     *
     * If the incident is currently transferring, this action will also "accept" the incident and
     * mark it from Transferred to the Open state.
     *
     * @param {object} user The user we are assigning to.
     * @param {string} assignmentType what are we assigning? Valid options are `assignee` and
     * `commander` (eg the assignment prop values on incident object)
     * @return {Promise} Resolves with incident {object} and rejects with {RequestError} error.
     */
    assignIncidentToUser = async (user, assignmentType = 'assignee') => {
      try {
        const incident = { ...this.state.incident };

        if (isTransferred(incident)) {
          // set the state of the incident to open since we are assigning a transferred incident.
          // this essentially accepts the incident and marks it as open and ready for users
          // to use.
          incident.state = STATE.OPEN;
        }
        const action = assignIncidentToUser(incident, user, assignmentType);
        return await this.props.createTransaction(action);
      } catch (error) {
        log.error(`Failed to assign incident to user ${user.userId}. Reason: `, error);
        throw RequestError.parseRequestErrorFromResponse(
          error,
          __('An error occurred assigning the incident. Please try again later.'),
          __('Sorry, we were unable to assign the incident.'),
        );
      }
    };

    /**
     * Forwards the incident to the provided site.
     *
     * This function posts a multicast to the server. It will return the multicast object from the
     * server on success, or forward the response when an error occurs. The multicast will also
     * be available on the `multicasts` propertly handed to the child component. This is an array
     * of all open multicasts, so when the multicast is created it will appear as an item in that
     * array. All updates to the multicast will automatically be updated on that prop, so
     * child does not need to handle anything to get re-renders on multicast updates.
     *
     * @param {object} site The site to forward the incident to.
     * @return {Promise} Resolves with multicast {object} and rejects with {RequestError} error.
     */
    forwardIncidentToSite = async site => {
      try {
        const action = forwardIncidentToSite(this.state.incident.id, site.id);
        const multicast = await this.props.createTransaction(action);
        // Add the multicast ID to the set of multicasts ID so we know to keep track of this
        // multicast
        this.multicastIds.add(multicast.id);
        // We will add the multicast here just in case the props was updated by redux before we set
        // the multicast ID above. This ensures the multicast makes it to the child component.
        if (this._isMounted) {
          this.setState(prevState => ({
            multicasts: [...prevState.multicasts, multicast],
          }));
        }
        return multicast;
      } catch (error) {
        log.error('Failed create multicast for incident forward', error);
        const prefix = __(
          `An error occurred initiating Incident transfer to site ${site.name || ''}.`,
        );
        const requestError = RequestError.parseRequestErrorFromResponse(error, '', prefix);

        if (this._isMounted) {
          this.setState({ errorBannerText: requestError.message });
        }
        throw requestError;
      }
    };

    /** Since we are a HOC, update display name */
    getDisplayName = name => `withIncident(${name})`;

    /**
     * Get the incident from the server.
     */
    getIncident = () => {
      const action = getIncident(this.incidentId);
      this.props.createTransaction(action).then(
        () => {
          if (this._isMounted) {
            this.setState({
              isLoading: false,
              errorBannerText: null,
              fieldErrors: null,
            });
          }
        },
        response => {
          log.error('Cannot get incident. ', response);
          if (this._isMounted) {
            this.setState({
              isLoading: false,
              errorBannerText: `${__('An error occurred getting incident')} : ${response.statusText ||
                __('Unkown Error')}`,
              fieldErrors: null,
            });
          }
        },
      );
    };

    render() {
      const { incident, isLoading, errorBannerText, fieldErrors, multicasts } = this.state;

      // Remove our custom props so they don't pass through.
      const {
        incidents,
        multicastMap,
        // users, // Incident Details relies on this for now, but should be removed in the future.
        ...rest
      } = this.props;

      return (
        <WrappedComponent
          incident={incident}
          multicasts={multicasts}
          incidentIsLoading={isLoading}
          errorBannerText={errorBannerText}
          fieldErrors={fieldErrors}
          onSave={this.onSave}
          onLogEntryAdd={this.onLogEntryAdd}
          onLogEntrySave={this.onLogEntrySave}
          onLogEntryRemove={this.onLogEntryRemove}
          onCloseIncident={() => {
            console.warn('onCloseIncident not implemented in withIncident');
          }}
          onReopenIncident={() => {
            console.warn('onReopenIncident not implemented in withIncident');
          }}
          assignIncidentToUser={this.assignIncidentToUser}
          forwardIncidentToSite={this.forwardIncidentToSite}
          {...rest}
        />
      );
    }
  }

  const mapStateToProps = state => ({
    incidents: state.incidents.incidents || [],
    users: state.roles.usersByRole.IncidentManager || [],
    multicastMap: state.multicasts || {},
    currentUser: (state.session || {}).user || {},
  });

  return withTransaction(connect(mapStateToProps)(WithIncident));
};

export default withIncident;
