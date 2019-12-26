const Gio = imports.gi.Gio

const IdleFlag = 8

const SessionInterface = '<node> \
  <interface name="org.gnome.SessionManager"> \
    <method name="IsInhibited"> \
      <arg type="u" name="flags" direction="in"/> \
      <arg type="b" name="is_inhibited" direction="out"/> \
    </method> \
  </interface> \
</node>'

// Declare the proxy class based on the interface
const SessionProxy = Gio.DBusProxy.makeProxyWrapper(SessionInterface)

// Get the /org/freedesktop/UPower/KbdBacklight instance from the bus
let sessionProxy = new SessionProxy(
  Gio.DBus.session,
  'org.gnome.SessionManager',
  '/org/gnome/SessionManager'
)

function isIdle() {
  return sessionProxy.IsInhibitedSync(IdleFlag)
}
