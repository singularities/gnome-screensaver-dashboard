#!/usr/bin/gjs

imports.gi.versions.Gtk = '3.0';
imports.gi.versions.WebKit2 = '4.0';

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Webkit = imports.gi.WebKit2;

class Screen {

  // Create the application itself
  constructor() {
    this.application = new Gtk.Application ();

    // Connect 'activate' and 'startup' signals to the callback functions
    this.application.connect('activate', this._onActivate.bind(this));
    this.application.connect('startup', this._onStartup.bind(this));
  }

  // Callback function for 'activate' signal presents windows when active
  _onActivate() {
    this._window.fullscreen();
  }

  // Callback function for 'startup' signal builds the UI
  _onStartup() {
    this._buildUI();
  }

  // Build the application's UI
  _buildUI() {
    // Create the application window
    this._window = new Gtk.ApplicationWindow({
      application: this.application,
      type: Gtk.WindowType.TOPLEVEL });

      // Create a webview to show the web app
      this._webView = new Webkit.WebView();

      this._webView.connect('close', this._close.bind(this))

      // Put the web app into the webview
      this._webView.load_uri (GLib.filename_to_uri (GLib.get_current_dir() +
      "/dashboard.html", null));

      // Put the webview into the window
      this._window.add (this._webView);

      // Show the window and all child widgets
      this._window.show_all();
    }

    _close() {
      this._window.destroy()
    }
  };

  // Run the application
  let app = new Screen ();
  app.application.run (ARGV);
