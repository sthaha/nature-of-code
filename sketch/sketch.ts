class Walker {
  p : p5
  x : number
  y : number

  constructor(p: p5) {
    this.p = p

    this.x = p.width/2
    this.y = p.height/2
  }

  step() {
    const next = Math.floor(this.p.random(4))
    const dist = Math.floor(this.p.random(8))
    if (next == 0) {
      this.x += dist
    } else if (next == 1) {
      this.x -= dist
    } else if (next == 2) {
      this.y += dist
    } else {
      this.y -= dist
    }
    this.wrap()
  }

  wrap() {
    const {width, height} = this.p

    if (this.x < 0) {
      this.x = width
    } else if (this.x > width) {
      this.x = 0
    }

    if (this.y < 0) {
      this.y = height
    } else if (this.y > height) {
      this.y = 0
    }

  }

  draw() {
    const {p, x, y} = this
    console.log("at: ", x, y)
    p.stroke(200, 180)
    p.strokeWeight(6)
    p.point(x, y)
  }
}

const sketch = (p : p5) =>  {
  let w : Walker
  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(0)
    w  = new Walker(p)
  }


  p.draw = () => {
    w.step()
    w.draw()
  }
}

new p5(sketch)
