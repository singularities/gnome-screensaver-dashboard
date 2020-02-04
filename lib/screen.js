const Gio = imports.gi.Gio

const ScreenSaverInterface = '<node> \
  <interface name="org.gnome.ScreenSaver"> \
    <method name="SetActive"> \
      <arg type="b" name="value" direction="in"> \
      </arg> \
    </method> \
  </interface> \
</node>'
const MutterDisplayConfigInterface = '<node> \
  <interface name="org.gnome.Mutter.DisplayConfig"> \
    <property type="i" name="PowerSaveMode" access="readwrite"/> \
  </interface> \
</node>'

const ScreenSaverProxy = Gio.DBusProxy.makeProxyWrapper(ScreenSaverInterface)
const MutterDisplayProxy = Gio.DBusProxy.makeProxyWrapper(MutterDisplayConfigInterface)

class Screen {
  constructor () {
    this.status = 'off'
    this.sessionSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.session'})
  }

  // DBusProxies are lazy initialize to avoid locks in extension init
  get screenSaverProxy () {
    if (this._screenSaverProxy) {
      return this._screenSaverProxy
    }

    return this._buildScreenSaverProxy()
  }

  // DBusProxies are lazy initialize to avoid locks in extension init
  get mutterDisplayProxy () {
    if (this._mutterDisplayProxy) {
      return this._mutterDisplayProxy
    }

    return this._buildMutterDisplayProxy()
  }

  on () {
    if (this.status == 'on') {
      return
    }

    this.status = 'on'

    // # Turn on screen
    // # https://gitlab.gnome.org/GNOME/mutter/blob/master/src/org.gnome.Mutter.DisplayConfig.xml#L255-283
    this.mutterDisplayProxy.PowerSaveMode = 0

    // # Remove screen saver
    this.screenSaverProxy.SetActiveRemote(false)

    // # Don't turn off the screen if user is idle
    this.sessionSettings.set_uint('idle-delay', 0)
  }

  off () {
    if (this.status == 'off') {
      return
    }

    this.status = 'off'

    // # Turn off screen
    // # https://gitlab.gnome.org/GNOME/mutter/blob/master/src/org.gnome.Mutter.DisplayConfig.xml#L255-283
    this.mutterDisplayProxy.PowerSaveMode = 3

    // # Turn off the screen if user is idle
    this.sessionSettings.set_uint('idle-delay', 60)
  }

  _buildScreenSaverProxy () {
    this._screenSaverProxy = new ScreenSaverProxy(
      Gio.DBus.session,
      'org.gnome.ScreenSaver',
      '/org/gnome/ScreenSaver'
    )

    return this._screenSaverProxy
  }

  _buildMutterDisplayProxy () {
    this._mutterDisplayProxy = new MutterDisplayProxy(
      Gio.DBus.session,
      'org.gnome.Mutter.DisplayConfig',
      '/org/gnome/Mutter/DisplayConfig'
    )

    return this._mutterDisplayProxy
  }
}
