#!/bin/bash

export DISPLAY=:0
export XDG_RUNTIME_DIR=/run/user/$UID

dbus-send --session \
  --dest=org.gnome.Shell \
  --type=method_call \
  --print-reply \
  /org/singularities/screensaverdashboard \
  org.singularities.screensaverdashboard.$1
