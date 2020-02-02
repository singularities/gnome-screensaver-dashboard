const ByteArray = imports.byteArray
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const ExtensionUtils = imports.misc.extensionUtils

const Extension = ExtensionUtils.getCurrentExtension()

const Screen = Extension.imports.lib.screen.Screen

const Threshold = 0.2
const QuietInterval = 1 * 60 * 1000

const listenCommand = Extension.path + '/bin/listen.sh'
const screenCommand = Extension.path + '/bin/screen.sh'

// https://stackoverflow.com/a/59959242/579934
class Listener {
  constructor () {
    this.screen = new Screen()
    this._lastNoise = new Date() + QuietInterval + 1
  }

  listen () {
    log('listener wakeup')
    this._startListening()
  }

  sleep () {
    log('listener sleep')

    this._proc.force_exit()

    this.screen.off()
  }

  _startListening () {
    this._proc = new Gio.Subprocess({
      argv: [listenCommand],
      flags: Gio.SubprocessFlags.STDOUT_PIPE
    })

    this._proc.init(null);

     let stdout = new Gio.DataInputStream({
         base_stream: this._proc.get_stdout_pipe()
     });

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
          log(`sound: ${value}`)
          this._lastNoise = new Date()

          this.screen.on()
        } else {
          log(`no sound: ${value}`)
          let currentQuietInterval = new Date() - this._lastNoise

          if (currentQuietInterval > QuietInterval) {
            this.screen.off()
          }
        }

        this._readLine(stdout)
      }
    } catch (e) {
      logError(e);
    }
  }

  _readLine(stdout) {
    stdout.read_line_async(
      GLib.PRIORITY_DEFAULT,
      null, // Cancellable, if you want it
      this._parseListening.bind(this)
    )
  }
}
