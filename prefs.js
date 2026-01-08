/**
 * Night Light Toggle Extension - Preferences
 *
 * Minimal GTK preferences window following GNOME HIG.
 * Provides controls for Night Light settings and extension preferences.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

"use strict";

const { Gio, Gtk, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// GSettings schema for GNOME's color settings (Night Light)
const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_TEMPERATURE_KEY = "night-light-temperature";

// Temperature range constants (in Kelvin)
// GNOME uses 1000K (warmest) to 10000K (coolest/disabled)
// Night Light typically uses 1700K to 4700K range
const TEMP_MIN = 1700; // Most warm (orange)
const TEMP_MAX = 4700; // Less warm (closer to daylight)

/**
 * Initialize the preferences
 */
function init() {
  ExtensionUtils.initTranslations(Me.metadata.uuid);
}

/**
 * Build the preferences widget
 * @returns {Gtk.Widget} The preferences widget
 */
function buildPrefsWidget() {
  // Get extension settings
  const settings = ExtensionUtils.getSettings();

  // Get GNOME's color settings for Night Light
  const colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

  // Create the main container
  const prefsWidget = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    margin_top: 24,
    margin_bottom: 24,
    margin_start: 24,
    margin_end: 24,
    spacing: 24,
  });

  // ═══════════════════════════════════════════════════════════════════
  // Night Light Settings Frame
  // ═══════════════════════════════════════════════════════════════════
  const nightLightFrame = new Gtk.Frame({
    label: "<b>Night Light</b>",
  });
  nightLightFrame.get_label_widget().set_use_markup(true);
  prefsWidget.append(nightLightFrame);

  const nightLightBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    margin_top: 12,
    margin_bottom: 12,
    margin_start: 12,
    margin_end: 12,
    spacing: 12,
  });
  nightLightFrame.set_child(nightLightBox);

  // Night Light Enable Toggle
  const enableBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
  });
  nightLightBox.append(enableBox);

  const enableLabel = new Gtk.Label({
    label: "Enable Night Light",
    halign: Gtk.Align.START,
    hexpand: true,
  });
  enableBox.append(enableLabel);

  const enableSwitch = new Gtk.Switch({
    active: colorSettings.get_boolean(NIGHT_LIGHT_ENABLED_KEY),
    halign: Gtk.Align.END,
    valign: Gtk.Align.CENTER,
  });
  enableBox.append(enableSwitch);

  // Bind to GNOME's Night Light setting
  colorSettings.bind(
    NIGHT_LIGHT_ENABLED_KEY,
    enableSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );

  // Color Temperature Slider
  const tempBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 6,
  });
  nightLightBox.append(tempBox);

  const tempLabel = new Gtk.Label({
    label: "Color Temperature",
    halign: Gtk.Align.START,
  });
  tempBox.append(tempLabel);

  // Create slider box with labels
  const sliderBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
  });
  tempBox.append(sliderBox);

  const lessWarmLabel = new Gtk.Label({
    label: "Less Warm",
    css_classes: ["dim-label"],
  });
  sliderBox.append(lessWarmLabel);

  // Temperature adjustment (inverted: higher temp = less warm)
  const tempAdjustment = new Gtk.Adjustment({
    lower: TEMP_MIN,
    upper: TEMP_MAX,
    step_increment: 100,
    page_increment: 500,
    value: colorSettings.get_uint(NIGHT_LIGHT_TEMPERATURE_KEY),
  });

  const tempScale = new Gtk.Scale({
    orientation: Gtk.Orientation.HORIZONTAL,
    adjustment: tempAdjustment,
    hexpand: true,
    draw_value: false,
    inverted: true,
  });
  tempScale.set_size_request(200, -1);
  sliderBox.append(tempScale);

  const moreWarmLabel = new Gtk.Label({
    label: "More Warm",
    css_classes: ["dim-label"],
  });
  sliderBox.append(moreWarmLabel);

  // Connect temperature slider to GNOME settings
  tempAdjustment.connect("value-changed", () => {
    colorSettings.set_uint(NIGHT_LIGHT_TEMPERATURE_KEY, tempAdjustment.value);
  });

  // Update slider when settings change externally
  colorSettings.connect(`changed::${NIGHT_LIGHT_TEMPERATURE_KEY}`, () => {
    const newTemp = colorSettings.get_uint(NIGHT_LIGHT_TEMPERATURE_KEY);
    if (tempAdjustment.value !== newTemp) {
      tempAdjustment.value = newTemp;
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // Extension Settings Frame
  // ═══════════════════════════════════════════════════════════════════
  const extensionFrame = new Gtk.Frame({
    label: "<b>Extension</b>",
  });
  extensionFrame.get_label_widget().set_use_markup(true);
  prefsWidget.append(extensionFrame);

  const extensionBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    margin_top: 12,
    margin_bottom: 12,
    margin_start: 12,
    margin_end: 12,
    spacing: 12,
  });
  extensionFrame.set_child(extensionBox);

  // Restore State Toggle
  const restoreBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
  });
  extensionBox.append(restoreBox);

  const restoreLabel = new Gtk.Label({
    label: "Restore previous state on disable",
    halign: Gtk.Align.START,
    hexpand: true,
  });
  restoreBox.append(restoreLabel);

  const restoreSwitch = new Gtk.Switch({
    active: settings.get_boolean("restore-state"),
    halign: Gtk.Align.END,
    valign: Gtk.Align.CENTER,
  });
  restoreBox.append(restoreSwitch);

  settings.bind(
    "restore-state",
    restoreSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );

  // Show Indicator Toggle
  const indicatorBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
  });
  extensionBox.append(indicatorBox);

  const indicatorLabel = new Gtk.Label({
    label: "Show indicator in top bar",
    halign: Gtk.Align.START,
    hexpand: true,
  });
  indicatorBox.append(indicatorLabel);

  const indicatorSwitch = new Gtk.Switch({
    active: settings.get_boolean("show-indicator"),
    halign: Gtk.Align.END,
    valign: Gtk.Align.CENTER,
  });
  indicatorBox.append(indicatorSwitch);

  settings.bind(
    "show-indicator",
    indicatorSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT,
  );

  // ═══════════════════════════════════════════════════════════════════
  // About Frame
  // ═══════════════════════════════════════════════════════════════════
  const aboutFrame = new Gtk.Frame({
    label: "<b>About</b>",
  });
  aboutFrame.get_label_widget().set_use_markup(true);
  prefsWidget.append(aboutFrame);

  const aboutBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    margin_top: 12,
    margin_bottom: 12,
    margin_start: 12,
    margin_end: 12,
    spacing: 12,
  });
  aboutFrame.set_child(aboutBox);

  const aboutLabel = new Gtk.Label({
    label:
      "Night Light Toggle\nQuick access to GNOME's Night Light from the top panel",
    halign: Gtk.Align.START,
    hexpand: true,
  });
  aboutBox.append(aboutLabel);

  const versionLabel = new Gtk.Label({
    label: `v${Me.metadata.version}`,
    css_classes: ["dim-label"],
    halign: Gtk.Align.END,
    valign: Gtk.Align.CENTER,
  });
  aboutBox.append(versionLabel);

  return prefsWidget;
}
