/usr/bin/arecord -D plughw:1,0 -d 5 2>/dev/null | /usr/bin/sox -t .wav - -n stat 2>&1 | grep "Maximum amplitude" | cut -f 2 -d:
