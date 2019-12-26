const Mainloop = imports.mainloop
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib

const loop = new GLib.MainLoop(null, false);

const IdleTime = 1000 * 4

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

function subscribe(callback) {
  idleMonitorProxy.connectSignal('WatchFired', callback)
  idleMonitorProxy.AddIdleWatchSync(IdleTime)
}

// Mainloop.timeout_add(3000, () => { log(idleMonitorProxy.GetIdletimeSync()) }, null)

// loop.run()
