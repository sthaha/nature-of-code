class Base {
  p: p5
  start: p5.Vector
  end:  p5.Vector

  constructor(p: p5, start: p5.Vector, end: p5.Vector) {
    this.p = p
    this.start = start
    this.end = end
  }

  draw() {
    const {p, start, end} = this

    p.stroke(100, 220, 130, 200)
    p.strokeWeight(3)
    p.line(start.x, start.y, end.x, end.y)

  }

  vector() {
    return p5.Vector.sub(this.end, this.start)
  }
}


class Sprite {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  radius: number
  base: Base

  constructor(p: p5, base: Base) {
    this.p = p
    this.base = base
    this.radius = 10
    const randomV = p.createVector(p.random(50, 150), p.random(50, 150))
    this.pos = p5.Vector.add(base.start, randomV)
  }


  projection() {
    const {p, pos, base} = this

    const posV = p5.Vector.sub(pos, base.start)
    const baseV = base.vector()

    const theta = posV.angleBetween(baseV)
    console.log("angle:", theta)

    const proj = baseV.copy()
    proj.setMag(posV.mag() * p.cos(theta))

    return p5.Vector.add(base.start, proj)
  }

  dist(pt: p5.Vector, target: p5.Vector) {
    const {p} = this
    return p.createVector()
  }


  mouseMoved() {
    const {p} = this
    this.pos = p.createVector(p.mouseX, p.mouseY)
    //this.p.redraw()
  }


  wrap() {
    const {pos, p, radius} = this
    const {width, height} = p

    if (pos.x + radius < 0) {
      pos.x = width
    } else if (pos.x - radius > width) {
      pos.x = 0
    }

    if (pos.y + radius < 0) {
      pos.y = height
    } else if (pos.y - radius > height) {
      pos.y = 0
    }

  }

  draw() {
    const {p, radius, pos, base}= this
    const {start} = base

    p.strokeWeight(3)
    p.stroke(200, 109, 169, 218)
    p.line(start.x, start.y, pos.x, pos.y)
    p.strokeWeight(8)
    p.point(pos.x, pos.y)

    const proj = this.projection()
    console.log("projection", proj)

    p.stroke("orange")
    p.strokeWeight(8)
    p.point(proj.x, proj.y)

    p.stroke(10, 170, 220, 190)
    p.strokeWeight(3)
    p.line(proj.x, proj.y, pos.x, pos.y)

  }



}


const sketch = (p : p5) =>  {

  let isLooping = true
  const noLoop = () => {isLooping = false; p.noLoop()}
  const loop = () => {isLooping = true; p.loop()}
  const toggleLoop = () => isLooping ? noLoop() :  loop()

  p.keyPressed = () => {
    switch(p.keyCode) {
      case p.ESCAPE: toggleLoop(); return;
      case 32: p.redraw(); return
    }
    switch (p.key) {
      case 'i':
        p.redraw()
        break
    }
  }


  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  const v = (x: number, y: number) => p.createVector(x, y)

  const base = new Base(p, v(200, 250), v(800, 450))
  const sprite = new Sprite(p, base)

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()
  }

  p.mouseMoved = () => sprite.mouseMoved()

  p.draw = () => {
    p.background(0)

    p.fill(200)
    p.stroke(255)
    p.strokeWeight(5)
    base.draw()
    sprite.draw()
  }
}

new p5(sketch)
