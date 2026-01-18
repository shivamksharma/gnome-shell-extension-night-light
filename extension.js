import GObject from "gi://GObject";
import Gio from "gi://Gio";
import St from "gi://St";
import Clutter from "gi://Clutter";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_SCHEDULE_AUTOMATIC_KEY = "night-light-schedule-automatic";
const NIGHT_LIGHT_SCHEDULE_FROM_KEY = "night-light-schedule-from";
const NIGHT_LIGHT_SCHEDULE_TO_KEY = "night-light-schedule-to";

const NightLightIndicator = GObject.registerClass(
  class NightLightIndicator extends PanelMenu.Button {
    _init(extension) {
      super._init(0.0, "Night Light Toggle", true);

      this._extension = extension;
      this._settings = extension.getSettings();
      this._colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

      this._icon = new St.Icon({
        icon_name: "night-light-symbolic",
        style_class: "system-status-icon",
      });
      this.add_child(this._icon);

      this._updateIcon();

      this._settingsSignal = this._settings.connect(
        "changed::show-indicator",
        () => this._onShowIndicatorChanged(),
      );

      this._colorSignal = this._colorSettings.connect(
        `changed::${NIGHT_LIGHT_ENABLED_KEY}`,
        () => this._updateIcon(),
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
          false,
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
  },
);

export default class NightLightToggleExtension extends Extension {
  enable() {
    this._indicator = new NightLightIndicator(this);
    Main.panel.addToStatusArea(this.metadata.uuid, this._indicator);

    this._suppressBuiltinIndicator();
  }

  disable() {
    this._restoreBuiltinIndicator();

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }

  _suppressBuiltinIndicator() {
    try {
      const aggregateMenu = Main.panel.statusArea.aggregateMenu;
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
        this._originalSyncFunc = nightLight._sync;

        nightLight._sync = function () {
          if (this._indicator) {
            this._indicator.visible = false;
          }
        };

        if (nightLight._indicator) {
          nightLight._indicator.visible = false;
        }
      }
    } catch (e) {
      console.error(
        `Night Light Toggle: Failed to suppress built-in indicator: ${e.message}`,
      );
    }
  }

  _restoreBuiltinIndicator() {
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

      if (nightLight && this._originalSyncFunc) {
        nightLight._sync = this._originalSyncFunc;
        this._originalSyncFunc = null;

        nightLight._sync();
      }
    } catch (e) {
      console.error(
        `Night Light Toggle: Failed to restore built-in indicator: ${e.message}`,
      );
    }
  }
}
