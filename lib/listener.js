const ByteArray = imports.byteArray
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio
const ExtensionUtils = imports.misc.extensionUtils

const Extension = ExtensionUtils.getCurrentExtension()

const Threshold = 0.2
const QuietInterval = 5 * 60 * 1000

const listenCommand = Extension.path + '/bin/listen.sh'
const screenCommand = Extension.path + '/bin/screen.sh'

class Listener {
  constructor () {
    this._screenStatus = 'off'
    this._keepListening = false
    this._lastNoise = new Date() + QuietInterval + 1
  }
  // currentValue () {
  //   return parseFloat(ByteArray.toString(GLib.spawn_command_line_sync(listenCommand)[1]))
  // }

  listen () {
    log('listener wakeup')
    this._keepListening = true
    this._triggerListen()
  }

  sleep () {
    log('listener sleep')
    this._keepListening = false
  }

  _triggerListen () {
    let [result, pid, inFd, outFd, errFd] =
      GLib.spawn_async_with_pipes(null, [listenCommand], null, 0, null);

    this.listenPid = pid
    this.listenInFd = inFd
    this.listenOutFd = outFd
    this.listenErrFd = errFd

    this.out_reader = new Gio.DataInputStream({
      base_stream: new Gio.UnixInputStream({fd: outFd})
    })

    this.out_reader.read_upto_async('', 0, 0, null, this._parseListening.bind(this));
  }

  _parseListening (source_object, result) {
    let [output, length] = this.out_reader.read_upto_finish(result)
    let value = parseFloat(output)

    log(value)

    GLib.spawn_close_pid(this.listenPid)

    // Break loop after closing pid
    if (!this._keepListening) {
      this._turnScreen('off')
      return
    }

    if (value > Threshold) {
      log('if')
      this._lastNoise = new Date()

      this._turnScreen('on')
    } else {
      log('else')
      let currentQuietInterval = new Date() - this._lastNoise

      if (currentQuietInterval > QuietInterval) {
        this._turnScreen('off')
      }
    }

    this._triggerListen()
  }

  _turnScreen (value) {
    log('_turnScreen ' + value);
    if (this._screenStatus == value) {
      return
    }

    this._screenStatus = value

    GLib.spawn_command_line_sync(`${screenCommand} ${value}`)
  }
}
