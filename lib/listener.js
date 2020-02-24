const ByteArray = imports.byteArray
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const ExtensionUtils = imports.misc.extensionUtils

const Extension = ExtensionUtils.getCurrentExtension()

const Screen = Extension.imports.lib.screen.Screen
const IdleMonitor = Extension.imports.lib.idleMonitor.IdleMonitor

const Threshold = 0.2
const QuietInterval = 1 * 60 * 1000

const listenCommand = Extension.path + '/bin/listen.sh'
const screenCommand = Extension.path + '/bin/screen.sh'

// https://stackoverflow.com/a/59959242/579934
class Listener {
  constructor () {
    this._listen = false
    this.screen = new Screen()
    this._lastNoise = new Date() + QuietInterval + 1

    IdleMonitor.subscribe('idle', this._onIdle.bind(this))
  }

  listen () {
    log('listener wakeup')

    if (this._listen) {
      return
    }

    this._listen = true

    if (this._idle) {
      this._startListening()
    }
  }

  sleep () {
    log('listener sleep')

    if (!this._listen) {
      return
    }

    this._listen = false

    this._stopListening()

    this.screen.off()
  }

  _onIdle () {
    log('_onIdle')
    this._idle = true

    if (this._listen) {
      this._startListening()
    }

    IdleMonitor.subscribe('active', this._onActive.bind(this))
  }

  _onActive () {
    log('_onActive')
    this._idle = false

    if (this._listen) {
      this._stopListening()
    }
  }

  _startListening () {
    log('_startListening')

    this._proc = new Gio.Subprocess({
      argv: [listenCommand],
      flags: Gio.SubprocessFlags.STDOUT_PIPE
    })

    this._proc.init(null)

    let stdout = new Gio.DataInputStream({
     base_stream: this._proc.get_stdout_pipe()
    })

    this._readLine(stdout)

    // Check the process completion
    // this._proc.wait_check_async(null, onProcExited.bind(this));
  }

  _parseListening (stdout, result) {
    try {
      let line = stdout.read_line_finish_utf8(result)[0];

      // %null generally means end of stream
      if (line !== null) {
        let value = parseFloat(line)

        if (value > Threshold) {
          this._lastNoise = new Date()

          if (this.screen.status !== 'on') {
            log(`sound: ${value}`)
          }
          this.screen.on()
        } else {
          let currentQuietInterval = new Date() - this._lastNoise

          if (currentQuietInterval > QuietInterval) {
            if (this.screen.status !== 'off') {
              log(`no sound: ${value}`)
            }
            this.screen.off()
          }
        }

        this._readLine(stdout)
      }
    } catch (e) {
      logError(e);
    }
  }

  _stopListening () {
    log('_stopListening')

    this._proc.force_exit()
  }

  _readLine(stdout) {
    stdout.read_line_async(
      GLib.PRIORITY_DEFAULT,
      null, // Cancellable, if you want it
      this._parseListening.bind(this)
    )
  }
}
