import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/shell/extensions/prefs.js";

const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_TEMPERATURE_KEY = "night-light-temperature";

const TEMP_MIN = 1700;
const TEMP_MAX = 4700;

export default class NightLightTogglePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

    const page = new Adw.PreferencesPage();
    window.add(page);

    const nightLightGroup = new Adw.PreferencesGroup({
      title: "Night Light",
    });
    page.add(nightLightGroup);

    const enableRow = new Adw.SwitchRow({
      title: "Enable Night Light",
    });
    nightLightGroup.add(enableRow);

    colorSettings.bind(
      NIGHT_LIGHT_ENABLED_KEY,
      enableRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    const sliderRow = new Adw.ActionRow({
      title: "Color Temperature",
    });
    nightLightGroup.add(sliderRow);

    const scaleContainer = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
      hexpand: true,
      margin_top: 6,
      margin_bottom: 6,
    });

    const lessWarmLabel = new Gtk.Label({
      label: "Cool",
      css_classes: ["dim-label"],
    });
    scaleContainer.append(lessWarmLabel);

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
    tempScale.set_size_request(150, -1);
    scaleContainer.append(tempScale);

    const moreWarmLabel = new Gtk.Label({
      label: "Warm",
      css_classes: ["dim-label"],
    });
    scaleContainer.append(moreWarmLabel);

    sliderRow.add_suffix(scaleContainer);

    tempAdjustment.connect("value-changed", () => {
      colorSettings.set_uint(NIGHT_LIGHT_TEMPERATURE_KEY, tempAdjustment.value);
    });

    colorSettings.connect(`changed::${NIGHT_LIGHT_TEMPERATURE_KEY}`, () => {
      const newTemp = colorSettings.get_uint(NIGHT_LIGHT_TEMPERATURE_KEY);
      if (tempAdjustment.value !== newTemp) {
        tempAdjustment.value = newTemp;
      }
    });

    const extensionGroup = new Adw.PreferencesGroup({
      title: "Extension",
    });
    page.add(extensionGroup);

    const restoreRow = new Adw.SwitchRow({
      title: "Restore previous state on disable",
    });
    extensionGroup.add(restoreRow);

    settings.bind(
      "restore-state",
      restoreRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    const indicatorRow = new Adw.SwitchRow({
      title: "Show indicator in top bar",
    });
    extensionGroup.add(indicatorRow);

    settings.bind(
      "show-indicator",
      indicatorRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    const aboutGroup = new Adw.PreferencesGroup({
      title: "About",
    });
    page.add(aboutGroup);

    const aboutRow = new Adw.ActionRow({
      title: "Night Light Toggle",
      subtitle: "Quick access to GNOME's Night Light from the top panel",
    });

    const versionLabel = new Gtk.Label({
      label: `v${this.metadata.version}`,
      css_classes: ["dim-label"],
    });
    aboutRow.add_suffix(versionLabel);

    aboutGroup.add(aboutRow);
  }
}
