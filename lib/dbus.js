const Gio = imports.gi.Gio

const DBusInterface = '<node> \
  <interface name="org.freedesktop.DBus"> \
    <signal name="NameAcquired"> \
      <arg type="s"/> \
    </signal> \
  </interface> \
</node>'

// Declare the proxy class based on the interface
const DBusProxy = Gio.DBusProxy.makeProxyWrapper(DBusInterface)

// Get the /org/freedesktop/UPower/KbdBacklight instance from the bus
let dbusProxy = new DBusProxy(
  Gio.DBus.session,
  'org.freedesktop.DBus',
  '/org/freedesktop/DBus'
)

function subscribe(callback) {
  dbusProxy.connectSignal('NameAcquired', callback)
}
