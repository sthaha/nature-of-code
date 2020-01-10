function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}

class P5MouseEvent {
  clientX: number
  clientY: number
}

class Target {
  p: p5

  pos: p5.Vector
  radius = 20
  dragged = false

  constructor(p :p5, pos: p5.Vector) {
    this.p = p
    this.pos = pos
  }

  draw() {
    const {p, pos, radius} = this

    p.strokeWeight(3)
    p.stroke(128, 200, 200, 180)
    p.fill(128, 200, 200, 180)

    const {x, y} = pos
    const  d = radius * 2
    p.ellipse(x, y, d, d)
  }

  hasPoint(x: number, y: number) {
    const {p, pos, radius} = this
    return pos.dist(p.createVector(x, y)) <= radius
  }
}


class Draggable  {
  p: p5
  pos: p5.Vector
  dragged = false

  onDragStarted(e: P5MouseEvent) {
    this.dragged = true
    console.log("drag start")
  }

  onDragStopped(e: P5MouseEvent) {
    this.dragged = false
    console.log("drag stopped")
  }

  onMouseDragged(e: P5MouseEvent) {
    if (!this.dragged) {
      return
    }

    console.log("dragging ...")

    this.pos = this.p.createVector(e.clientX, e.clientY)
  }
}

interface Target extends Draggable {}

applyMixins(Target, [Draggable]);

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
  let target = new Target(p, v(300, 300 ))


  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    //noLoop()
  }

  p.draw = () => {
    p.background(0)
    target.draw()
  }


  p.mousePressed = (e: P5MouseEvent) => {
    if (!target.hasPoint(e.clientX, e.clientY)) {
      console.log("target clicked outside", e)
      return
    }
    target.onDragStarted(e)
  }

  p.mouseReleased = (e: P5MouseEvent) => {
    if (!target.hasPoint(e.clientX, e.clientY)) {
      console.log("target clicked outside", e)
      return
    }
    target.onDragStopped(e)
  }

  p.mouseDragged = (e: P5MouseEvent) => {
    target.onMouseDragged(e)
  }
}

new p5(sketch)
