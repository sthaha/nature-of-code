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

    //console.log("dragging ...")
    this.pos = this.p.createVector(e.clientX, e.clientY)
  }
}

interface Target extends Draggable {}

applyMixins(Target, [Draggable]);


class Sprite {
  p: p5
  pos: p5.Vector
  radius: number = 4

  target: Target
  maxSpeed: number
  maxForce: number
  v : p5.Vector


  a : p5.Vector

  constructor(p: p5, pos: p5.Vector, target: Target, v: p5.Vector, maxSpeed: number, maxForce: number) {
    this.p =  p
    this.pos =  pos
    this.v =  v

    this.target =  target
    this.maxSpeed =  maxSpeed
    this.maxForce =  maxForce

  }

  steeringForce(): p5.Vector {
    const {p, target, pos, maxForce, maxSpeed} = this

    const desired = p5.Vector.sub(target.pos, pos)
    desired.limit(maxSpeed)

    const steering = desired.sub(this.v)
    steering.limit(maxForce)
    return steering

  }

  fleeingForce(): p5.Vector {
    const {p, target, pos, maxForce, maxSpeed} = this

    const desired = p5.Vector.sub(pos, target.pos)
    //console.log("> v", this.v, "desired:", desired, "dist:", pos.dist(target.pos))
    //desired.div(pos.dist(target.pos)* 2)

    desired.limit(maxSpeed)

    const steering = desired.sub(this.v)
    steering.div(pos.dist(target.pos))
    steering.limit(maxForce)
    return steering

  }

  update(){
    //const f = this.fleeingForce()
    const f = this.steeringForce()

    //console.log("> v", this.v, "f:", f)
    this.v.add(f)
    this.pos.add(this.v)
    this.wrap()
  }

  wrap() {
    const {pos, radius, p} = this
    const {width, height} = p

    if (pos.x + radius < 0) {
      pos.x = width + radius
    }else if (pos.x - radius > width) {
      pos.x = -radius
    }

    if (pos.y + radius < 0) {
      pos.y = height + radius
    }else if (pos.y - radius > height) {
      pos.y = -radius
    }
  }

  draw() {
    const {p, pos} = this


    p.strokeWeight(3)
    p.stroke(108, 240, 200, 180)
    p.fill(108, 240, 200, 180)

    const {x, y} = pos
    p.ellipse(x, y, 10, 10)

    const head = p5.Vector.add(pos, this. v)
    //head.setMag(8)

    p.stroke(208, 140, 100, 180)
    p.line(pos.x, pos.y, head.x, head.y)

    // copied
    const theta = this.v.heading() + p.PI/2;
    const r = this.radius
    p.stroke(108, 240, 200, 250)
    p.push();
      p.translate(x,y);
      p.rotate(theta);

      p.beginShape();
        p.vertex(0, -r*2);
        p.vertex(-r, r*2);
        p.vertex(r, r*2);
      p.endShape(p.CLOSE);
    p.pop();
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

  const r  = (x: number) => p.random(x)
  const range  = (x: number) => p.map(r(1), 0, 1, -x, x)

  const v = (x: number, y: number) => p.createVector(x, y)
  const rv = (x: number, y: number) => p.createVector(range(x), range(y))

  let target = new Target(p, v(400, 400 ))
  let sprites = [
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(400, 400).add(rv(150, 150)), target, rv(0.8,-0.2), r(14), r(0.8)),
    new Sprite(p, v(600, 300), target, v(-2.8, 0), 8, 30),
  ]

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()
  }

  p.draw = () => {
    p.background(0)
    target.draw()
    for (const s of sprites) {
      s.update()
      s.draw()
    }
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
