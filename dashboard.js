const Main = imports.ui.main
const St = imports.gi.St

class Dashboard {
  constructor() {
    this.build()
  }

  build() {
    this.container = new St.Bin({
      style_class: 'container',
      reactive: true,
      x_fill: true,
      y_fill: true
    })

    let layout = new St.BoxLayout({vertical: true})
    this.container.add_actor(layout)

    // let text = new St.Label({text: 'hello work'})
    // let text2 = new St.Label({text: 'hello work 2'})
    //
    // layout.add_actor(text)
    // layout.add_actor(text2)
    //

    this.container.connect('button-press-event', this.hide.bind(this))
  }

  show() {
    Main.uiGroup.add_actor(this.container)
  }

  hide() {
    Main.uiGroup.remove_actor(this.container)
  }
}
