const Mainloop = imports.mainloop
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const ExtensionUtils = imports.misc.extensionUtils;

const Extension = ExtensionUtils.getCurrentExtension();
const DBus = Extension.imports.lib.dbus

const IdleTime = 1000 * 60

// This the D-Bus interface as XML
const IdleMonitorInterface = '<node>\
  <interface name="org.gnome.Mutter.IdleMonitor"> \
    <method name="GetIdletime"> \
      <arg name="idletime" direction="out" type="t"/> \
    </method> \
    <method name="AddIdleWatch"> \
      <arg name="interval" direction="in" type="t" /> \
      <arg name="id" direction="out" type="u" /> \
    </method> \
    <method name="AddUserActiveWatch"> \
      <arg name="id" direction="out" type="u" /> \
    </method> \
    <method name="RemoveWatch"> \
      <arg name="id" direction="in" type="u" /> \
    </method> \
    <method name="ResetIdletime"/> \
    <signal name="WatchFired"> \
      <arg name="id" direction="out" type="u" /> \
    </signal> \
  </interface> \
</node>'

// Declare the proxy class based on the interface
const IdleMonitorProxy = Gio.DBusProxy.makeProxyWrapper(IdleMonitorInterface)

// Get the /org/freedesktop/UPower/KbdBacklight instance from the bus
let idleMonitorProxy = new IdleMonitorProxy(
    Gio.DBus.session,
    'org.gnome.Mutter.IdleMonitor',
    '/org/gnome/Mutter/IdleMonitor/Core'
)

class IdleMonitor {
  static subscribe (type, callback) {
    this.instance().subscribe(type, callback)
  }

  static instance () {
    if (this._instance) {
      return this._instance
    }

    this._instance = new IdleMonitor()
    return this._instance
  }

  constructor () {
    this._idleCallbacks = []
    this._activeCallbacks = {}

    DBus.subscribe((_proxy, _dbus, name) => {
      if (name != 'org.gnome.Mutter.IdleMonitor') {
        return
      }

      idleMonitorProxy.connectSignal('WatchFired', this._onWatchFired.bind(this))
      idleMonitorProxy.AddIdleWatchRemote(IdleTime, (id) => {
        this._idleWatchId = id
      })

    })
  }

  subscribe (type, callback) {
    switch (type) {
      case 'idle':
        this._addIdleCallback(callback)

        break;
      case 'active':
        this._addActiveCallback(callback)
        break;
      default:
        log(`Unknown IdleMonitor subscribe type: ${type}`)
    }
  }

  _addIdleCallback (callback) {
    this._idleCallbacks.push(callback)
  }

  _addActiveCallback (callback) {
    idleMonitorProxy.AddUserActiveWatchRemote((id) => {
      this._activeCallbacks[id.toString()] = callback
    })
  }

  _onWatchFired (_proxy, _, id) {
    if (id.toString() === this._idleWatchId.toString()) {
      this._idleCallbacks.forEach((callback) => {
        callback(_proxy, _, id)
      })

      return
    }

    let activeId = id.toString()

    this._activeCallbacks[activeId]()

    delete this._activeCallbacks[activeId]

    idleMonitorProxy.RemoveWatchRemote(id)
  }
}
