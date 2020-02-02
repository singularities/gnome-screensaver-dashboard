while true; do
  /usr/bin/sox -t pulseaudio default -n stat trim 0 5 2>&1 | grep "Maximum amplitude" | cut -f 2 -d:
done
