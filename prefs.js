const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const COLOR_SCHEMA = "org.gnome.settings-daemon.plugins.color";
const NIGHT_LIGHT_ENABLED_KEY = "night-light-enabled";
const NIGHT_LIGHT_TEMPERATURE_KEY = "night-light-temperature";

const TEMP_MIN = 1700;
const TEMP_MAX = 4700;

function init() {
  // Initialization if needed
}

function fillPreferencesWindow(window) {
  const settings = ExtensionUtils.getSettings();
  const colorSettings = new Gio.Settings({ schema: COLOR_SCHEMA });

  const page = new Adw.PreferencesPage();
  window.add(page);

  const nightLightGroup = new Adw.PreferencesGroup({
    title: "Night Light",
  });
  page.add(nightLightGroup);

  // Enable Night Light
  const enableRow = new Adw.ActionRow({
    title: "Enable Night Light",
  });
  const enableSwitch = new Gtk.Switch({
    valign: Gtk.Align.CENTER,
  });
  enableRow.add_suffix(enableSwitch);
  enableRow.activatable_widget = enableSwitch;
  nightLightGroup.add(enableRow);

  colorSettings.bind(
    NIGHT_LIGHT_ENABLED_KEY,
    enableSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Color Temperature
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

  // Restore State
  const restoreRow = new Adw.ActionRow({
    title: "Restore previous state on disable",
  });
  const restoreSwitch = new Gtk.Switch({
    valign: Gtk.Align.CENTER,
  });
  restoreRow.add_suffix(restoreSwitch);
  restoreRow.activatable_widget = restoreSwitch;
  extensionGroup.add(restoreRow);

  settings.bind(
    "restore-state",
    restoreSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // Show Indicator
  const indicatorRow = new Adw.ActionRow({
    title: "Show indicator in top bar",
  });
  const indicatorSwitch = new Gtk.Switch({
    valign: Gtk.Align.CENTER,
  });
  indicatorRow.add_suffix(indicatorSwitch);
  indicatorRow.activatable_widget = indicatorSwitch;
  extensionGroup.add(indicatorRow);

  settings.bind(
    "show-indicator",
    indicatorSwitch,
    "active",
    Gio.SettingsBindFlags.DEFAULT
  );

  // About
  const aboutGroup = new Adw.PreferencesGroup({
    title: "About",
  });
  page.add(aboutGroup);

  const aboutRow = new Adw.ActionRow({
    title: "Night Light Toggle",
    subtitle: "Quick access to GNOME's Night Light from the top panel",
  });

  const me = ExtensionUtils.getCurrentExtension();
  const versionLabel = new Gtk.Label({
    label: `v${me.metadata.version}`,
    css_classes: ["dim-label"],
  });
  aboutRow.add_suffix(versionLabel);

  aboutGroup.add(aboutRow);
}
