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
  const d = end.dist(start)
  return x.dist(start) <= d && x.dist(end) < d
}

class Path {
  p: p5
  points: p5.Vector[]
  radius: number

  constructor(p: p5, points : p5.Vector[]) {
    this.p = p
    this.points = [...points]

    this.radius = 90
  }

  nearestLine(pos: p5.Vector) {
    const {p, points} = this

    let [start, end] = [points[0], points[1]]
    let nearest = Infinity

    console.group("nearest")
    for (let i =0; i< points.length-1; i++){
      const [p1, p2] = [points[i], points[i+1]]

      const proj = projection(p, pos, p1, p2)
      if (! withIn(proj, p1, p2)) {
        console.log("points skipping", V("start", p1), V("end", p2))
        continue
      }
      const d = pos.dist(proj)

      console.log(
        "points", V("start", p1), V("end", p2), "|",
        V("proj", proj), "dist", d )

      if (nearest > d) {
        [start, end, nearest] = [p1.copy(), p2.copy(), d]
        console.log("new nearest", V("start", start), V("end", end), "|", "D", d)
      }
    }
    console.groupEnd()

    return [start, end]
  }

  draw() {
    const {p, points, radius} = this


    for (let i =0; i< points.length-1; i++){
      const p1 = points[i]
      const p2 = points[i+1]


      p.strokeWeight(radius)
      p.stroke(250, 120)
      p.line(p1.x, p1.y, p2.x, p2.y)

      p.strokeWeight(3)
      p.stroke("orange")
      p.line(p1.x, p1.y, p2.x, p2.y)
    }
  }

}


class Sprite {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector

  maxForce: number
  maxSpeed: number

  radius: number
  path: Path

  constructor(p: p5, pos: p5.Vector, v: p5.Vector, path: Path) {
    this.p = p
    this.pos = pos
    this.v = v
    this.radius = 10
    this.path = path
    this.a = p.createVector(0, 0)

    this.maxForce = p.random(1.2, 2.2)
    this.maxSpeed = p.random(2.2, 5)
    //this.maxForce = 5 //p.random(5)
    //this.maxSpeed = 8 //p.random(8)
  }



  follow() {
    const {p, pos, v, path} = this


    // prediction
    const futureV = p5.Vector.mult(v, 12)
    const futurePos = p5.Vector.add(pos, futureV)

    const [start, end] =  path.nearestLine(futurePos)
    p.strokeWeight(4)
    p.stroke(255, 20, 40, 100)
    p.line(start.x, start.y, end.x, end.y)

    console.log(V("start", start), V("end", end))
    const futureProj = projection(p, futurePos, start, end)

    // future projection
    p.strokeWeight(16)
    p.stroke(225, 220, 180, 150)
    p.point(futureProj.x, futureProj.y)


    const enRoute = futureProj.dist(futurePos) < path.radius/2.5
    if (enRoute) {
      return
    }

    const proj = projection(p, pos, start, end)
    console.log(V("proj", proj), V("future", futureProj), "dist:", proj.dist(futureProj))

    // current project: green
    p.strokeWeight(12)
    p.stroke(55, 220, 80, 170)
    p.point(proj.x, proj.y)

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
    p.strokeWeight(22)
    p.stroke(225, 12, 80, 180)
    p.point(target.x, target.y)


    this.steer(target)
  }

  steer(target: p5.Vector) {
    const {p, pos, v,  path, maxSpeed, maxForce} = this

    p.strokeWeight(5)
    p.stroke(255, 118, 80, 170)
    p.strokeWeight(8)
    p.point(target.x, target.y)


    const desired = p5.Vector.sub(target, pos)
    const mag = p.map(pos.dist(target), 0, path.radius, 0, maxSpeed)
    desired.setMag(mag)

    const steering  = desired.sub(v)
    steering.limit(maxForce)


    //console.log("desired: ", desired.x, desired.y,
                //"| steer", steering.x, steering.y,
                //"mag: ", steering.mag(),
                //"max", maxForce)

    this.a.add(steering)
  }

  update() {
    this.v.add(this.a)
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
    //new Sprite(p, v(200, 200), v(20, 20), path),
    //new Sprite(p, v(200, 200), v(20, -20), path),
    //new Sprite(p, v(200, 200), v(-20, 0), path),
  ]

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    const {width, height} = p
    const border = 250
    const pts = [
      v(border, border),
      v(width - border, border),
      v(width-border, height-border),
      v(border, height-border),
      v(border, border),
    ]
    path.points = pts
    noLoop()
  }



  const addSprite = () => sprites.push(new Sprite(p, v(p.mouseX, p.mouseY), randV(-3, 3), path))
  p.mouseDragged = addSprite
  p.mousePressed = addSprite

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
