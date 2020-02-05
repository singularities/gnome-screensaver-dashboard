'use strict'

// This is a handy import we'll use to grab our extension's object
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();

const idleMonitor = Extension.imports.lib.idleMonitor
const DbusServer = Extension.imports.lib.dbusServer.DbusServer
const Dashboard = Extension.imports.lib.dashboard.Dashboard

class ScreensaverDashboard {
  constructor() {
    this.dbusServer = new DbusServer()

    idleMonitor.subscribe(() => {
      this.show()
    })
  }
  // This function could be called after your extension is enabled, which could
  // be done from GNOME Tweaks, when you log in or when the screen is unlocked.
  //
  // This is when you setup any UI for your extension, change existing widgets,
  // connect signals or modify GNOME Shell's behaviour.
  enable() {
    log(`enabling ${Extension.metadata.name} version ${Extension.metadata.version}`);

  }

  // This function could be called after your extension is uninstalled, disabled
  // in GNOME Tweaks, when you log out or when the screen locks.
  //
  // Anything you created, modifed or setup in enable() MUST be undone here. Not
  // doing so is the most common reason extensions are rejected during review!
  disable() {
    log(`disabling ${Extension.metadata.name} version ${Extension.metadata.version}`);
  }

  show() {
    if (!this.dashboard) {
      this.dashboard = new Dashboard()
    }

    this.dashboard.show()
  }
}

// This function is called once when your extension is loaded, not enabled. This
// is a good time to setup translations or anything else you only do once.
//
// You MUST NOT make any changes to GNOME Shell, connect any signals or add any
// MainLoop sources here.
function init() {
  log(`initializing ${Extension.metadata.name} version ${Extension.metadata.version}`);

  return new ScreensaverDashboard()
}
