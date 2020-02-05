const St = imports.gi.St
const GnomeDesktop = imports.gi.GnomeDesktop


class Clock {
  constructor (layout) {
    this._buildLayout(layout)

    this._updateBox()

    this.clock = new GnomeDesktop.WallClock()
    this.clockSignal = this.clock.connect('notify::clock', this._onTick.bind(this))
  }

  remove () {
    this.clock.disconnect(this.clockSignal)
  }

  _onTick () {
    log(new Date())

    this._updateBox()
  }


  _updateBox () {
    let date = new Date()

    this.hourEntry.set_text(
      date.toLocaleString(
        'es-ES', {
          hour: 'numeric',
          minute: 'numeric'
        }
      )
    )
    this.dateEntry.set_text(
      date.toLocaleString(
        'es-ES', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }
      )
    )
  }

  _buildLayout(layout) {
    this.layout = layout

    this.hourEntry = new St.Label({ style_class: 'clock-hour' })
    layout.add_actor(this.hourEntry)

    this.dateEntry = new St.Label({ style_class: 'clock-date' })
    layout.add_actor(this.dateEntry)
  }
}
