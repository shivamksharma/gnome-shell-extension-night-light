import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/shell/extensions/prefs.js';

const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_TEMPERATURE_KEY = "night-light-temperature";

const TEMP_MIN = 1700; // Most warm (orange)
const TEMP_MAX = 4700; // Less warm (closer to daylight)

export default class NightLightTogglePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

    const page = new Adw.PreferencesPage();
    window.add(page);

    // ═══════════════════════════════════════════════════════════════════
    // Night Light Settings Group
    // ═══════════════════════════════════════════════════════════════════
    const nightLightGroup = new Adw.PreferencesGroup({
      title: "Night Light",
    });
    page.add(nightLightGroup);

    // Enable Switch
    const enableRow = new Adw.SwitchRow({
      title: "Enable Night Light",
    });
    nightLightGroup.add(enableRow);

    // Bind to settings
    colorSettings.bind(
      NIGHT_LIGHT_ENABLED_KEY,
      enableRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );

    // Temperature Slider
    // We create a custom row for the slider since Adw doesn't have a direct slider row in 45 (Adw.SpinRow is for numbers)
    // or we can use a basic ActionRow and add a scale as suffix or child.
    // However, for a slider with labels "Less Warm" / "More Warm", we might want a custom box.
    const sliderRow = new Adw.ActionRow({
      title: "Color Temperature",
    });
    nightLightGroup.add(sliderRow);

    // Container for the scale and labels
    const scaleContainer = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
      hexpand: true,
      margin_top: 6,
      margin_bottom: 6
    });

    const lessWarmLabel = new Gtk.Label({
      label: "Cool",
      css_classes: ["dim-label"],
    });
    scaleContainer.append(lessWarmLabel);

    // Inverted logic: Gnome stores Temperature. Low = Warm, High = Cool.
    // Wait, original code:
    // lower: TEMP_MIN (1700), upper: TEMP_MAX (4700).
    // inverted: true.
    // So 1700 is "More Warm" (Low K). 4700 is "Less Warm" (High K).
    // If inverted is true on the scale, then Left is Max (4700) and Right is Min (1700).
    // The labels in original code:
    // Left: "Less Warm"
    // Right: "More Warm"
    // This matches `inverted: true`.

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
      inverted: true
    });
    tempScale.set_size_request(150, -1);
    scaleContainer.append(tempScale);

    const moreWarmLabel = new Gtk.Label({
      label: "Warm",
      css_classes: ["dim-label"],
    });
    scaleContainer.append(moreWarmLabel);

    // Add the custom container to the row (as a suffix, or just below? AdwActionRow supports suffixes)
    // Suffixes are usually at the end. If we want it to take space, we can make it the only suffix and hexpand.
    sliderRow.add_suffix(scaleContainer);

    // Connect adjustment
    tempAdjustment.connect("value-changed", () => {
      colorSettings.set_uint(NIGHT_LIGHT_TEMPERATURE_KEY, tempAdjustment.value);
    });

    colorSettings.connect(`changed::${NIGHT_LIGHT_TEMPERATURE_KEY}`, () => {
      const newTemp = colorSettings.get_uint(NIGHT_LIGHT_TEMPERATURE_KEY);
      if (tempAdjustment.value !== newTemp) {
        tempAdjustment.value = newTemp;
      }
    });

    // ═══════════════════════════════════════════════════════════════════
    // Extension Settings Group
    // ═══════════════════════════════════════════════════════════════════
    const extensionGroup = new Adw.PreferencesGroup({
      title: "Extension",
    });
    page.add(extensionGroup);

    // Restore State
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

    // Show Indicator
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

    // ═══════════════════════════════════════════════════════════════════
    // About Group
    // ═══════════════════════════════════════════════════════════════════
    const aboutGroup = new Adw.PreferencesGroup({
      title: "About",
    });
    page.add(aboutGroup);

    const aboutRow = new Adw.ActionRow({
      title: "Night Light Toggle",
      subtitle: "Quick access to GNOME's Night Light from the top panel",
    });
    // Add version as suffix
    const versionLabel = new Gtk.Label({
      label: `v${this.metadata.version}`,
      css_classes: ["dim-label"],
    });
    aboutRow.add_suffix(versionLabel);

    aboutGroup.add(aboutRow);
  }
}
