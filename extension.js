const { Clutter, Gio, GObject, St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_SCHEDULE_AUTOMATIC_KEY = "night-light-schedule-automatic";
const NIGHT_LIGHT_SCHEDULE_FROM_KEY = "night-light-schedule-from";
const NIGHT_LIGHT_SCHEDULE_TO_KEY = "night-light-schedule-to";

let indicator = null;

const NightLightIndicator = GObject.registerClass(
  class NightLightIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, "Night Light Toggle", true);

      this._settings = ExtensionUtils.getSettings();
      this._colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

      this._icon = new St.Icon({
        icon_name: "night-light-symbolic",
        style_class: "system-status-icon",
      });
      this.add_child(this._icon);

      this._updateIcon();

      this._settingsSignal = this._settings.connect(
        "changed::show-indicator",
        () => this._onShowIndicatorChanged()
      );

      this._colorSignal = this._colorSettings.connect(
        `changed::${NIGHT_LIGHT_ENABLED_KEY}`,
        () => this._updateIcon()
      );

      this._onShowIndicatorChanged();
    }

    vfunc_event(event) {
      if (
        event.type() === Clutter.EventType.BUTTON_PRESS ||
        event.type() === Clutter.EventType.TOUCH_BEGIN
      ) {
        this._toggle();
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    }

    _toggle() {
      const current = this._colorSettings.get_boolean(NIGHT_LIGHT_ENABLED_KEY);
      const newState = !current;

      if (newState) {
        this._colorSettings.set_boolean(
          NIGHT_LIGHT_SCHEDULE_AUTOMATIC_KEY,
          false
        );
        this._colorSettings.set_double(NIGHT_LIGHT_SCHEDULE_FROM_KEY, 0.0);
        this._colorSettings.set_double(NIGHT_LIGHT_SCHEDULE_TO_KEY, 24.0);
      }

      this._colorSettings.set_boolean(NIGHT_LIGHT_ENABLED_KEY, newState);
    }

    _updateIcon() {
      const enabled = this._colorSettings.get_boolean(NIGHT_LIGHT_ENABLED_KEY);
      this._icon.opacity = enabled ? 255 : 140;
    }

    _onShowIndicatorChanged() {
      this.visible = this._settings.get_boolean("show-indicator");
    }

    destroy() {
      if (this._settingsSignal) {
        this._settings.disconnect(this._settingsSignal);
        this._settingsSignal = null;
      }
      if (this._colorSignal) {
        this._colorSettings.disconnect(this._colorSignal);
        this._colorSignal = null;
      }
      this._settings = null;
      this._colorSettings = null;
      super.destroy();
    }
  }
);

function init() {
  // Initialization if needed
}

function enable() {
  indicator = new NightLightIndicator();
  Main.panel.addToStatusArea('night-light-toggle', indicator);

  _suppressBuiltinIndicator();
}

function disable() {
  _restoreBuiltinIndicator();

  if (indicator) {
    indicator.destroy();
    indicator = null;
  }
}

// Helper variables for suppression logic
let _originalSyncFunc = null;

function _suppressBuiltinIndicator() {
  try {
    let nightLight = null;

    if (
      Main.panel.statusArea.aggregateMenu &&
      Main.panel.statusArea.aggregateMenu._nightLight
    ) {
      nightLight = Main.panel.statusArea.aggregateMenu._nightLight;
    } else if (Main.panel.statusArea.quickSettings) {
      if (Main.panel.statusArea.quickSettings._nightLight) {
        nightLight = Main.panel.statusArea.quickSettings._nightLight;
      }
    }

    if (nightLight) {
      _originalSyncFunc = nightLight._sync;

      // Override _sync to keep the built-in indicator hidden
      nightLight._sync = function () {
        if (this._indicator) {
          this._indicator.visible = false;
        }
      };

      // Hide the built-in indicator immediately
      if (nightLight._indicator) {
        nightLight._indicator.visible = false;
      }
    }
  } catch (e) {
    global.logError(`Night Light Toggle: Failed to suppress built-in indicator: ${e.message}`);
  }
}

function _restoreBuiltinIndicator() {
  try {
    let nightLight = null;
    if (
      Main.panel.statusArea.aggregateMenu &&
      Main.panel.statusArea.aggregateMenu._nightLight
    ) {
      nightLight = Main.panel.statusArea.aggregateMenu._nightLight;
    } else if (
      Main.panel.statusArea.quickSettings &&
      Main.panel.statusArea.quickSettings._nightLight
    ) {
      nightLight = Main.panel.statusArea.quickSettings._nightLight;
    }

    if (nightLight && _originalSyncFunc) {
      nightLight._sync = _originalSyncFunc;
      _originalSyncFunc = null;

      nightLight._sync();
    }
  } catch (e) {
    global.logError(`Night Light Toggle: Failed to restore built-in indicator: ${e.message}`);
  }
}
