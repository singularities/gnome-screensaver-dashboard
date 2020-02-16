const Main = imports.ui.main
const St = imports.gi.St
const Tweener = imports.ui.tweener
const ExtensionUtils = imports.misc.extensionUtils

const Extension = ExtensionUtils.getCurrentExtension()

const IdleMonitor = Extension.imports.lib.idleMonitor.IdleMonitor
const Clock = Extension.imports.lib.clock.Clock

// https://developer.gnome.org/clutter/stable/clutter-Events.html#ClutterEventType
// CLUTTER_BUTTON_PRESS and CLUTTER_TOUCH_END (touch events may start with begin or update)
const HideEvents = [6, 15]

class Dashboard {
  constructor() {
    this.build()

    IdleMonitor.subscribe('idle', this.show.bind(this))
  }

  build() {
    this.container = new St.Bin({
      style_class: 'container',
      reactive: true
    })

    let layout = new St.BoxLayout({vertical: true})
    this.container.add_actor(layout)

    let clockBox = new St.BoxLayout({
      vertical: true,
      style_class: 'clock'
    })
    layout.add_actor(clockBox)

    this.clock = new Clock(clockBox)

    // let text = new St.Label({text: 'hello work'})
    // let text2 = new St.Label({text: 'hello work 2'})
    //
    // layout.add_actor(text)
    // layout.add_actor(text2)
    //

    // We should connect to `button-press-event` and `touch-event` signals
    // https://developer.gnome.org/clutter/stable/ClutterActor.html#ClutterActor.signals
    // but it touch-event is not available
    // Maybe because of the version?
    this.container.connect('event', this.hide.bind(this))
  }

  show() {
    log('dashboard show')

    this.container.opacity = 0

    Main.uiGroup.add_actor(this.container)

    Tweener.addTween(
      this.container,
      {
        opacity: 255,
        time: 2,
        transition: 'easeOutQuad',
      }
    )
  }

  hide(_container, event) {
    log('hide:' + event.type());
    if (!HideEvents.includes(event.type())) {
      return
    }

    Tweener.addTween(
      this.container,
      {
        opacity: 0,
        time: 0.3,
        transition: 'easeOutQuad',
        onComplete: this.remove.bind(this)
      }
    )
  }

  remove() {
    Main.uiGroup.remove_actor(this.container)
  }
}
