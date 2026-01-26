<h1 align="center">🌙 Night Light Toggle - GNOME Shell Extension</h1>

<p align="center">
  <strong>Quick access to GNOME's built-in Night Light feature from the top panel</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-42--49-4A86CF?style=flat-square&logo=gnome&logoColor=white" alt="GNOME 42-49">
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Version-2-green?style=flat-square" alt="Version">
</p>

---

## ✨ Features

- **🌙 Instant Toggle** — Force Night Light ON/OFF immediately, overriding automatic scheduling
- **🌡️ Temperature Control** — Adjust color warmth (1700K-4700K) without opening GNOME Settings
- **🎯 Native Integration** — Follows GNOME Human Interface Guidelines (HIG)
- **⚙️ Lightweight & Efficient** — Minimal resource usage
- **📱 Modern Preferences** — Clean GTK4 settings interface
- **🔄 Manual Override** — Disables automatic scheduling when manually toggled

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Activities     🌙 Night Light (Warm)                 🔋 🔊 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Compatibility

| GNOME Shell Version |        Supported         |
| :-----------------: | :----------------------: |
|         42          |            ✅            |
|         43          |            ✅            |
|         44          |            ✅            |
|         45          |            ✅            |
|         46          |            ✅            |
|         47          |            ✅            |
|         48          |            ✅            |
|         49          |            ✅            |

---

## 📥 Installation

### From extensions.gnome.org (Recommended)

1. Visit [extensions.gnome.org](https://extensions.gnome.org)
2. Search for "Night Light Toggle"
3. Click the toggle to install and enable

### Manual Installation

1. Download from [GitHub](https://github.com/shivamksharma/gnome-shell-extension-night-light-toggle)
2. Extract to `~/.local/share/gnome-shell/extensions/night-light-toggle@sam.shell-extensions/`
3. Restart GNOME Shell (`Alt+F2`, type `r`, press Enter)
4. Enable via GNOME Extensions or GNOME Tweaks

### From Source

```bash
git clone https://github.com/shivamksharma/gnome-shell-extension-night-light.git
cp -r gnome-shell-extension-night-light ~/.local/share/gnome-shell/extensions/night-light-toggle@sam.shell-extensions/
```

---

## ⚙️ Configuration

Access preferences through GNOME Extensions → Night Light Toggle → Settings

### Night Light Settings
- **Enable Night Light** — Toggle Night Light on/off
- **Color Temperature** — Adjust warmth from Cool (4700K) to Warm (1700K)

---

## 🔧 Technical Overview

Integrates with GNOME Settings Daemon's color plugin to control Night Light. Provides manual override functionality that bypasses automatic scheduling.

---

## 📁 File Structure

```
night-light-toggle@sam.shell-extensions/
├── extension.js              # Main extension logic
├── metadata.json             # Extension metadata
├── prefs.js                  # Preferences UI
├── schemas/                  # GSettings schema
├── LICENSE                   # GPL-3.0 license
└── README.md                 # This file
```

---

## 🛠️ Development

### Prerequisites
- GNOME Shell 42+
- GJS and GTK4

### Testing
```bash
cp -r . ~/.local/share/gnome-shell/extensions/night-light-toggle@sam.shell-extensions/
glib-compile-schemas schemas/
gnome-extensions enable night-light-toggle@sam.shell-extensions
```

Debug with: `journalctl -f -o cat /usr/bin/gnome-shell`

---

## 🤝 Contributing

Contributions welcome! Please test on multiple GNOME versions and follow the GNOME Code of Conduct.

---

## 📄 License

**GNU General Public License v3.0** — see [LICENSE](LICENSE) for details.

*Not affiliated with or endorsed by the GNOME Project. Community maintained.*
