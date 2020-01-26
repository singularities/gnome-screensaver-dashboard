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

    Gio.bus_own_name(
      Gio.BusType.SESSION,
      'org.singularities.screensaverdashboard',
      Gio.BusNameOwnerFlags.NONE,
      this.onBusAcquired.bind(this),
      this.noOp,
      this.noOp
    )
  }

  onBusAcquired(connection) {
    connection.register_object(
      '/org/singularities/screensaverdashboard',
      GioInterface,
      this.methodCallClosure.bind(this),
      this.noOp,
      this.noOp
    )
  }

  methodCallClosure (connection, sender, objectPath, interfaceName,
                     methodName, parameters, invocation) {
    this.listener[methodName]()

    invocation.return_value(null)
  }

  noOp () {
  }
}
