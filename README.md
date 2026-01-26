# Night Light Toggle

A default GNOME Shell extension that provides quick access to GNOME's built-in Night Light feature from the top panel.

## Features

- **Instant ON**: Acts as a manual override, forcing Night Light ON immediately regardless of time of day (disables automatic scheduling when toggled ON)
- **Temperature Control**: Adjust color warmth without opening GNOME Settings
- **Native Look & Feel**: Follows GNOME Human Interface Guidelines (HIG)

## Installation

### From Source

1. Clone or download this repository
2. Copy the folder `nightlighttoggle@sam` to your GNOME Shell extensions directory:
   ```bash
   cp -r nightlighttoggle@sam ~/.local/share/gnome-shell/extensions/
   ```
3. Compile the schemas:
   ```bash
   cd ~/.local/share/gnome-shell/extensions/nightlighttoggle@sam
   glib-compile-schemas schemas/
   ```
4. Restart GNOME Shell (Log out and log back in, or press `Alt+F2`, type `r`, and hit Enter on X11)
5. Enable the extension using **Extensions** app or terminal:
   ```bash
   gnome-extensions enable nightlighttoggle@sam
   ```

## Compatibility

- GNOME Shell 42, 43, 44, 45, 46, 47, 48, 49
- Wayland and X11 compatible

## License

GPL-3.0
