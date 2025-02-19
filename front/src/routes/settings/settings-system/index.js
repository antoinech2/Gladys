import { Component } from 'preact';
import { connect } from 'unistore/preact';
import get from 'get-value';
import timezones from '../../../config/timezones';
import SettingsSystemPage from './SettingsSystemPage';
import actions from '../../../actions/system';
import { SYSTEM_VARIABLE_NAMES } from '../../../../../server/utils/constants';
import { RequestStatus } from '../../../utils/consts';

class SettingsSystem extends Component {
  updateTimezone = async option => {
    this.setState({
      savingTimezone: true,
      selectedTimezone: option
    });
    try {
      await this.props.httpClient.post(`/api/v1/variable/${SYSTEM_VARIABLE_NAMES.TIMEZONE}`, {
        value: option.value
      });
    } catch (e) {
      console.error(e);
    }
  };

  vacuumDatabase = async e => {
    e.preventDefault();
    this.setState({
      vacuumStarted: true
    });
    try {
      await this.props.httpClient.post('/api/v1/system/vacuum');
    } catch (e) {
      console.error(e);
    }
  };

  getTimezone = async () => {
    try {
      const { value } = await this.props.httpClient.get(`/api/v1/variable/${SYSTEM_VARIABLE_NAMES.TIMEZONE}`);
      const selectedTimezone = timezones.find(tz => tz.value === value);
      if (selectedTimezone) {
        this.setState({
          selectedTimezone
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  updateDeviceStateHistory = async e => {
    await this.setState({
      deviceStateHistoryInDays: e.target.value,
      savingDeviceStateHistory: true
    });
    try {
      await this.props.httpClient.post(`/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_STATE_HISTORY_IN_DAYS}`, {
        value: e.target.value
      });
    } catch (e) {
      console.error(e);
    }
    await this.setState({
      savingDeviceStateHistory: false
    });
  };

  updateDeviceAggregateStateHistory = async e => {
    await this.setState({
      deviceAggregateStateHistoryInDays: e.target.value,
      savingDeviceStateHistory: true
    });
    try {
      await this.props.httpClient.post(
        `/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_AGGREGATE_STATE_HISTORY_IN_DAYS}`,
        {
          value: e.target.value
        }
      );
    } catch (e) {
      console.error(e);
    }
    await this.setState({
      savingDeviceStateHistory: false
    });
  };

  updateNumberOfHoursBeforeStateIsOutdated = async e => {
    await this.setState({
      numberOfHoursBeforeStateIsOutdated: e.target.value,
      savingNumberOfHourseBeforeStateIsOutdated: true
    });
    try {
      await this.props.httpClient.post(
        `/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_STATE_NUMBER_OF_HOURS_BEFORE_STATE_IS_OUTDATED}`,
        {
          value: e.target.value
        }
      );
    } catch (e) {
      console.error(e);
    }
    await this.setState({
      savingNumberOfHourseBeforeStateIsOutdated: false
    });
  };

  getDeviceStateHistoryPreference = async () => {
    try {
      const { value } = await this.props.httpClient.get(
        `/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_STATE_HISTORY_IN_DAYS}`
      );
      this.setState({
        deviceStateHistoryInDays: value
      });
    } catch (e) {
      console.error(e);
    }
  };

  getDeviceAggregateStateHistoryPreference = async () => {
    try {
      const { value } = await this.props.httpClient.get(
        `/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_AGGREGATE_STATE_HISTORY_IN_DAYS}`
      );
      this.setState({
        deviceAggregateStateHistoryInDays: value
      });
    } catch (e) {
      console.error(e);
      const status = get(e, 'response.status');
      if (status === 404) {
        // Default value is -1
        this.setState({
          deviceAggregateStateHistoryInDays: '-1'
        });
      }
    }
  };

  getNumberOfHoursBeforeStateIsOutdated = async () => {
    try {
      const { value } = await this.props.httpClient.get(
        `/api/v1/variable/${SYSTEM_VARIABLE_NAMES.DEVICE_STATE_NUMBER_OF_HOURS_BEFORE_STATE_IS_OUTDATED}`
      );
      this.setState({
        numberOfHoursBeforeStateIsOutdated: value
      });
    } catch (e) {
      console.error(e);
      // if variable doesn't exist, value is 48
      this.setState({
        numberOfHoursBeforeStateIsOutdated: 48
      });
    }
  };

  componentDidMount() {
    this.props.getInfos();
    this.props.getDiskSpace();
    this.props.getContainers();
    this.getTimezone();
    this.getDeviceStateHistoryPreference();
    this.getDeviceAggregateStateHistoryPreference();
    this.getNumberOfHoursBeforeStateIsOutdated();
    // we start the ping a little bit after to give it some time to breathe
    this.refreshPingIntervalId = setInterval(() => {
      this.props.ping();
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshPingIntervalId);
  }

  constructor(props) {
    super(props);
    this.state = {
      vacuumStarted: false
    };
  }

  render(
    props,
    {
      selectedTimezone,
      deviceStateHistoryInDays,
      deviceAggregateStateHistoryInDays,
      vacuumStarted,
      numberOfHoursBeforeStateIsOutdated,
      savingNumberOfHourseBeforeStateIsOutdated
    }
  ) {
    const isDocker = get(props, 'systemInfos.is_docker');
    const upgradeDownloadInProgress = props.downloadUpgradeStatus === RequestStatus.Getting;
    const upgradeDownloadFinished = props.downloadUpgradeStatus === RequestStatus.Success;
    const upgradeAvailable =
      !upgradeDownloadInProgress && !upgradeDownloadFinished && get(props, 'systemInfos.new_release_available');
    return (
      <SettingsSystemPage
        {...props}
        isDocker={isDocker}
        upgradeDownloadInProgress={upgradeDownloadInProgress}
        upgradeDownloadFinished={upgradeDownloadFinished}
        upgradeAvailable={upgradeAvailable}
        timezoneOptions={timezones}
        updateTimezone={this.updateTimezone}
        selectedTimezone={selectedTimezone}
        deviceStateHistoryInDays={deviceStateHistoryInDays}
        deviceAggregateStateHistoryInDays={deviceAggregateStateHistoryInDays}
        numberOfHoursBeforeStateIsOutdated={numberOfHoursBeforeStateIsOutdated}
        savingNumberOfHourseBeforeStateIsOutdated={savingNumberOfHourseBeforeStateIsOutdated}
        updateDeviceStateHistory={this.updateDeviceStateHistory}
        updateDeviceAggregateStateHistory={this.updateDeviceAggregateStateHistory}
        updateNumberOfHoursBeforeStateIsOutdated={this.updateNumberOfHoursBeforeStateIsOutdated}
        vacuumDatabase={this.vacuumDatabase}
        vacuumStarted={vacuumStarted}
      />
    );
  }
}

export default connect(
  'httpClient,session,systemPing,systemInfos,systemDiskSpace,systemContainers,downloadUpgradeProgress,downloadUpgradeStatus',
  actions
)(SettingsSystem);
