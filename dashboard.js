const Main = imports.ui.main
const St = imports.gi.St
const Tweener = imports.ui.tweener

class Dashboard {
  constructor() {
    this.build()
  }

  build() {
    this.container = new St.Bin({
      style_class: 'container',
      reactive: true
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

  hide() {
    Tweener.addTween(
      this.container,
      {
        opacity: 0,
        time: 0.5,
        transition: 'easeOutQuad',
        onComplete: this.remove.bind(this)
      }
    )
  }

  remove() {
    Main.uiGroup.remove_actor(this.container)
  }
}
