const ByteArray = imports.byteArray
const GLib = imports.gi.GLib
const ExtensionUtils = imports.misc.extensionUtils

const Extension = ExtensionUtils.getCurrentExtension()

const Threshold = 200

const command = Extension.path + '/bin/listen.sh'

class Listener {
  currentValue () {
    return parseFloat(ByteArray.toString(GLib.spawn_command_line_sync(command)[1]))
  }

  sleep () {
    log('listener sleep')
  }

  wakeup () {
    log('listener wakeup')
  }
}
