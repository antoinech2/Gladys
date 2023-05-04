import { Text } from 'preact-i18n';

import SetupLocalModeCard from './local/SetupLocalModeCard';
import SetupRemoteModeCard from './remote/SetupRemoteModeCard';

const SetupModePanel = ({
  dockerBased,
  networkModeValid,
  usbConfigured,
  setupMode,
  selectSetupMode,
  resetSetupMode,
  disabled
}) => {
  if (setupMode) {
    return (
      <div class="form-inline">
        <div class="form-group">
          <Text id={`integration.zigbee2mqtt.setup.modes.${setupMode}.title`} />
        </div>
        <button class="btn btn-primary btn-sm ml-auto" onClick={resetSetupMode} disabled={disabled}>
          <Text id="integration.zigbee2mqtt.setup.changeButtonLabel" />
        </button>
      </div>
    );
  }

  return (
    <div class="card-deck" data-cy="z2m-setup-local-panel">
      <SetupLocalModeCard
        dockerBased={dockerBased}
        networkModeValid={networkModeValid}
        usbConfigured={usbConfigured}
        disabled={disabled}
        selectSetupMode={selectSetupMode}
      />
      <SetupRemoteModeCard resetSetupMode={resetSetupMode} disabled={true} selectSetupMode={selectSetupMode} />
    </div>
  );
};

export default SetupModePanel;
