#!/bin/bash

export DISPLAY=:0
export XDG_RUNTIME_DIR=/run/user/$UID

if [ $1 = "on" ]; then
  # Don't turn off the screen if user is iddle
  gsettings set org.gnome.desktop.session idle-delay 0
  # Remove screen saver
  dbus-send --session --dest=org.gnome.ScreenSaver --type=method_call --print-reply /org/gnome/ScreenSaver org.gnome.ScreenSaver.SetActive boolean:false
  # Turn on screen
  # https://gitlab.gnome.org/GNOME/mutter/blob/master/src/org.gnome.Mutter.DisplayConfig.xml#L255-283
  busctl --user set-property org.gnome.Mutter.DisplayConfig /org/gnome/Mutter/DisplayConfig org.gnome.Mutter.DisplayConfig PowerSaveMode i 0
elif [ $1 = "off" ]; then
  # Turn off the screen if user is iddle
  gsettings set org.gnome.desktop.session idle-delay 60
  # Turn off screen
  # https://gitlab.gnome.org/GNOME/mutter/blob/master/src/org.gnome.Mutter.DisplayConfig.xml#L255-283
  busctl --user set-property org.gnome.Mutter.DisplayConfig /org/gnome/Mutter/DisplayConfig org.gnome.Mutter.DisplayConfig PowerSaveMode i 3
fi
