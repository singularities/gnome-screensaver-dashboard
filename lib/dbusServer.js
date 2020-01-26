const Gio = imports.gi.Gio

const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Listener = Extension.imports.lib.listener.Listener

const Interface = '<node> \
  <interface name="org.singularities.screensaverdashboard"> \
    <method name="sleep"></method> \
    <method name="wakeup"></method> \
  </interface> \
</node>';

const GioInterface = Gio.DBusNodeInfo.new_for_xml(Interface).interfaces[0]

class DbusServer {
  constructor() {
    this.listener = new Listener()

    this._ownName()
  }

  _ownName () {
    Gio.bus_own_name(
      Gio.BusType.SESSION,
      'org.singularities.screensaverdashboard',
      Gio.BusNameOwnerFlags.NONE,
      this._onBusAcquired.bind(this),
      this._noOp,
      this._noOp
    )
  }

  _onBusAcquired(connection) {
    connection.register_object(
      '/org/singularities/screensaverdashboard',
      GioInterface,
      this._methodCallClosure.bind(this),
      this._noOp,
      this._noOp
    )
  }

  _methodCallClosure (connection, sender, objectPath, interfaceName,
                     methodName, parameters, invocation) {
    this.listener[methodName]()

    invocation.return_value(null)
  }

  _noOp () {
  }
}
