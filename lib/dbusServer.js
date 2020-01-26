const Gio = imports.gi.Gio

const Interface = '<node> \
  <interface name="org.singularities.screensaverdashboard"> \
    <method name="sleep"></method> \
    <method name="wakeup"></method> \
  </interface> \
</node>';

const GioInterface = Gio.DBusNodeInfo.new_for_xml(Interface).interfaces[0]

class DbusServer {
  constructor() {
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
    log('bus acquired');
    connection.register_object(
      '/org/singularities/screensaverdashboard',
      GioInterface,
      this.methodCallClosure,
      this.noOp,
      this.noOp
    )
  }

  methodCallClosure (connection, sender, objectPath, interfaceName,
                     methodName, parameters, invocation) {
    invocation.return_value(null)
  }

  noOp () {
  }
}
