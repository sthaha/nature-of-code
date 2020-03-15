const V = (txt: string, v: p5.Vector) => `${txt}: ${v.x}, ${v.y}`

const projection = (p: p5, pt: p5.Vector, start: p5.Vector, end: p5.Vector) => {
  const baseV = p5.Vector.sub(end, start)
  const posV = p5.Vector.sub(pt, start)

  const theta = posV.angleBetween(baseV)
  //console.log("angle:", theta)

  const proj = baseV.copy()
  proj.setMag(posV.mag() * p.cos(theta))

  return p5.Vector.add(start, proj)
}

const withIn = (x: p5.Vector, start: p5.Vector, end: p5.Vector) => {
  if (!start || !end) {
    return false
  }
  const d = end.dist(start)
  return x.dist(start) <= d && x.dist(end) <= d
}

class Path {
  p: p5
  points: p5.Vector[]
  radius: number

  selected: number

  constructor(p: p5, points : p5.Vector[]) {
    this.p = p
    this.points = [...points]

    this.radius = 90
  }

  findNearestSegment(pos: p5.Vector) {
    const {p, points} = this

    let [start, end] = [points[0], points[1]]
    let nearest = Infinity

    console.group("nearest")
    for (let i =0; i< points.length; i++){
      const [p1, p2] = [points[i], points[(i+1) % points.length]]

      const proj = projection(p, pos, p1, p2)
      if (! withIn(proj, p1, p2)) {
        //console.log(i, "points skipping", V("start", p1), V("end", p2))
        continue
      }
      const d = pos.dist(proj)

      //console.log(
        //i, "points", V("start", p1), V("end", p2), "|",
        //V("proj", proj), "dist", d )

      if (nearest > d) {
        [start, end, nearest] = [p1.copy(), p2.copy(), d]
        console.log(i, "new nearest", V("start", start), V("end", end), "|", "D", d)
      }
    }
    console.groupEnd()

    return [start, end]
  }

  clicked(pos: p5.Vector) {
    const {p, points, radius} = this

    for (let i =0; i< points.length; i++){
      if (points[i].dist(pos) < radius)  {
        this.selected = i
        return true
      }
    }
    return false
  }

  released(pos: p5.Vector) {
    if (this.selected == -1) {
      return false
    }

    this.selected = -1
    return true
  }


  drag(pos: p5.Vector) {
    if (this.selected == -1) {
      return false
    }

    const pt =  this.points[this.selected]
    pt.x = pos.x
    pt.y = pos.y
    return true
  }



  draw() {
    const {p, points, radius} = this

    for (let i = 0; i< points.length; i++){
      const [p1, p2] = [points[i], points[(i+1) % points.length]]
      p.strokeWeight(radius)
      p.stroke(220, 110)
      p.line(p1.x, p1.y, p2.x, p2.y)

      p.strokeWeight(3)
      p.stroke("orange")
      p.line(p1.x, p1.y, p2.x, p2.y)
    }

    p.strokeWeight(2)
    for (let i = 0; i < points.length; i++){
      const pt = points[i]
      if (this.selected == i) {
        p.fill("purple")
      } else {
        p.fill(10, 182, 160, 100)
      }
      p.circle(pt.x, pt.y, 16)
    }
  }

}


class Sprite {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector

  segmentStart: p5.Vector
  segmentEnd: p5.Vector

  maxSteering: number
  maxSpeed: number
  maxVelocity: number

  radius: number
  path: Path

  constructor(p: p5, pos: p5.Vector, v: p5.Vector, path: Path) {
    this.p = p
    this.pos = pos
    this.v = v
    this.radius = 10
    this.path = path
    this.a = p.createVector(0, 0)

    this.maxSpeed = p.random(2.2, 5)
    this.maxSteering = p.random(0.8, 2.0)

    this.maxVelocity = p.random(4, 8)
  }



  follow() {
    const {p, pos, v, path, segmentStart, segmentEnd} = this

    // prediction
    const futureV = p5.Vector.mult(v, 12)
    const futurePos = p5.Vector.add(pos, futureV)

    if (!withIn(futurePos, segmentStart, segmentEnd)) {
      const [s, e] =  path.findNearestSegment(futurePos)

      this.segmentStart = s
      this.segmentEnd = e
    }

    const [start, end] = [this.segmentStart, this.segmentEnd]

    //p.strokeWeight(4)
    //p.stroke(255, 20, 40, 100)
    //p.line(start.x, start.y, end.x, end.y)

    //console.log(V("start", start), V("end", end))
    const futureProj = projection(p, futurePos, start, end)

    // future projection
    //p.strokeWeight(16)
    //p.stroke(225, 220, 180, 150)
    //p.point(futureProj.x, futureProj.y)

    const proj = projection(p, pos, start, end)
    //console.log(V("proj", proj), V("future", futureProj), "dist:", proj.dist(futureProj))

    // current project: green
    //p.strokeWeight(12)
    //p.stroke(55, 220, 80, 170)
    //p.point(proj.x, proj.y)

    const enRoute = futureProj.dist(futurePos) < path.radius/2.5
    if (enRoute) {
      return
    }

    //const dist = pos.dist(proj)
    //console.log("r", path.radius, "dist:", dist, "projected dist: ", futureProj.dist(futurePos))

    let target: p5.Vector

    if (!withIn(futureProj, start, end)) {
      const dest = futureProj.dist(start) < futureProj.dist(end) ? start : end
      target = dest.copy()
    } else {
      const bitMore = p5.Vector.sub(futureProj, start)
      bitMore.limit(25)
      target = p5.Vector.add(futureProj, bitMore)
    }

    // future projection
    //p.strokeWeight(22)
    //p.stroke(225, 12, 80, 180)
    //p.point(target.x, target.y)


    this.steer(target)
  }

  steer(target: p5.Vector) {
    const {p, pos, v,  path, maxSpeed, maxSteering} = this

    p.strokeWeight(5)
    p.stroke(255, 118, 80, 170)
    p.strokeWeight(8)
    p.point(target.x, target.y)


    const desired = p5.Vector.sub(target, pos)
    const mag = p.map(pos.dist(target), 0, path.radius, 0, maxSpeed)
    desired.setMag(mag)

    const steering = p5.Vector.sub(desired, v)
    steering.limit(maxSteering)


    //console.log("desired: ", desired.x, desired.y,
                //"| steer", steering.x, steering.y,
                //"mag: ", steering.mag(),
                //"max", maxSteering)

    this.a.add(steering)
  }

  update() {
    const {v, a, maxVelocity} = this
    if (this.a.mag() == 0) {
      this.a = p5.Vector.sub(p5.Vector.mult(v, 1.015), v)
    }
    this.v.add(this.a)
    this.v.limit(maxVelocity)
    this.pos.add(this.v)
    this.wrap()

    // clear acceleration
    this.a.mult(0)

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
    const {p, radius, pos, v}= this

    p.stroke(100,250, 200, 180)
    p.strokeWeight(8)
    p.point(pos.x, pos.y)

    p.stroke("gray")
    p.strokeWeight(2)
    p.line(pos.x, pos.y, pos.x + v.x, pos.y + v.y)

    p.push()
      p.translate(pos.x, pos.y)
      p.rotate(v.heading() - p.PI/2)


      p.stroke(100, 200, 125, 150)
      p.strokeWeight(4)
      p.fill(100, 200, 125, 110)
      p.beginShape()
        p.vertex(radius/2, 0)
        p.vertex(0, 15)
        p.vertex(-radius/2, 0)
      p.endShape()
    p.pop()

    //console.log("heading", v.heading())
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
  }


  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  const v = (x: number, y: number) => p.createVector(x, y)
  const randV = (l: number, h: number) => v(p.random(l, h), p.random(l, h))


  const path = new Path(p, [])
  const sprites = [
    new Sprite(p, v(150, 230), v(3, -12), path),
    new Sprite(p, v(200, 200), v(20, 20), path),
    new Sprite(p, v(200, 200), v(20, -20), path),
    new Sprite(p, v(200, 200), v(-20, 0), path),
  ]

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    const {width, height} = p
    const border = 150
    const pts = [
      v(border, border),                    // o
      v((width - border)/2, border),        //  -----o
      v(width - border, border),            // |      ---o
      v(width-border, height-border),       // |         |
      v((width - border)/2, height-border), // |     o---o
      v(border, height-border),             // o-----
    ]
    path.points = pts
    //noLoop()
  }


  const mousePos = () => v(p.mouseX, p.mouseY)
  const addSprite = () => sprites.push(new Sprite(p, mousePos(), randV(-3, 3), path))
  p.mousePressed = () => path.clicked(mousePos()) ||  addSprite()
  p.mouseDragged = () => path.drag(mousePos()) || addSprite()
  p.mouseReleased = () => path.released(mousePos()) || addSprite()

  p.draw = () => {
    p.background(0)

    p.fill(200)
    p.stroke(255)
    p.strokeWeight(5)
    path.draw()
    for (const s of sprites) {
      s.follow()
      s.update()
      s.draw()
    }
  }
}

new p5(sketch)
