/**
 * Night Light Toggle Extension
 *
 * Provides quick access to GNOME's built-in Night Light feature from the top panel.
 * Click the icon to toggle Night Light on/off instantly.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

"use strict";

const { GObject, Gio, St, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// GSettings schema for GNOME's color settings (Night Light)
const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_SCHEDULE_AUTOMATIC_KEY = "night-light-schedule-automatic";
const NIGHT_LIGHT_SCHEDULE_FROM_KEY = "night-light-schedule-from";
const NIGHT_LIGHT_SCHEDULE_TO_KEY = "night-light-schedule-to";

/**
 * Night Light Panel Indicator
 * Click to toggle Night Light on/off
 */
var NightLightIndicator = GObject.registerClass(
  class NightLightIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, "Night Light Toggle", true); // true = don't create menu

      this._settings = ExtensionUtils.getSettings();
      this._colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

      // Create the panel icon
      this._icon = new St.Icon({
        icon_name: "night-light-symbolic",
        style_class: "system-status-icon",
      });
      this.add_child(this._icon);

      // Update icon state
      this._updateIcon();

      // Connect to settings using the simpler connect pattern
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

    // Handle click events
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
        // Turning ON: Force manual mode 00:00 -> 24:00 (Always On)
        // This ensures the screen warms up immediately regardless of time of day
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

let _indicator = null;
let _originalSyncFunc = null;

function init() { }

function enable() {
  _indicator = new NightLightIndicator();
  Main.panel.addToStatusArea(Me.metadata.uuid, _indicator);

  // Completely suppress the built-in indicator
  _suppressBuiltinIndicator();
}

function disable() {
  // Restore the built-in indicator behavior
  _restoreBuiltinIndicator();

  if (_indicator) {
    _indicator.destroy();
    _indicator = null;
  }
}

function _suppressBuiltinIndicator() {
  try {
    const aggregateMenu = Main.panel.statusArea.aggregateMenu;
    if (aggregateMenu && aggregateMenu._nightLight) {
      const nightLight = aggregateMenu._nightLight;

      // 1. Save the original sync function
      _originalSyncFunc = nightLight._sync;

      // 2. Monkey-patch it to do NOTHING (prevent it from showing the icon)
      nightLight._sync = function () {
        // Determine visibility, but force 'visible' to false for the icon
        // We keep the logic but stop the UI update that shows the icon
        if (this._indicator) {
          this._indicator.visible = false;
        }
      };

      // 3. Force hide it immediately
      if (nightLight._indicator) {
        nightLight._indicator.visible = false;
      }
    }
  } catch (e) {
    log(
      `Night Light Toggle: Failed to suppress built-in indicator: ${e.message}`,
    );
  }
}

function _restoreBuiltinIndicator() {
  try {
    const aggregateMenu = Main.panel.statusArea.aggregateMenu;
    if (aggregateMenu && aggregateMenu._nightLight && _originalSyncFunc) {
      const nightLight = aggregateMenu._nightLight;

      // Restore the original function
      nightLight._sync = _originalSyncFunc;
      _originalSyncFunc = null;

      // Trigger an update to restore correct state
      nightLight._sync();
    }
  } catch (e) {
    log(
      `Night Light Toggle: Failed to restore built-in indicator: ${e.message}`,
    );
  }
}
