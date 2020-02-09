class Path {
  p: p5
  points: p5.Vector[]
  radius: number

  constructor(p: p5, points : p5.Vector[]) {
    this.p = p
    this.points = [...points]

    this.radius = 40
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

      //const m = (p2.y - p1.y)/(p2.x - p1.x)
      //const c = p2.y - (m * p2.x)

      //const y = (x: number, r: number) => m*x + c + r

      //p.stroke("purple")
      //p.line(p1.x, y(p1.x, radius), p2.x, y(p2.x, radius))

      //p.stroke("green")
      //p.line(p1.x, y(p1.x, -radius), p2.x, y(p2.x, -radius))

    }
  }
}


class Sprite {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  radius: number
  path: Path

  constructor(p: p5, pos: p5.Vector, v: p5.Vector, path: Path) {
    this.p = p
    this.pos = pos
    this.v = v
    this.radius = 10
    this.path = path
  }


  projection(v: p5.Vector, base: p5.Vector) {
    const {p} = this

    return p.createVector()
  }

  dist(pt: p5.Vector, target: p5.Vector) {
    const {p} = this
    return p.createVector()
  }


  follow() {
    // prediction
    const futureV = this.v.copy()
    futureV.mult(1.3)
    const futurePos = p5.Vector.add(this.pos, futureV)

    // does it lead to path
    const start = this.path.points[0]
    const end = this.path.points[1]
    const base = p5.Vector.sub(end, start)

    // get project point of current
    const projection = this.dist(this.pos, base)
    const future = this.dist(futurePos, base)
    // get project point of future

    //if (isApproaching()) {
      //return
    //}

    // push a bit more
    // find projection
    // steer towards it
  }

  steering() {
    const {p} = this
    return p.createVector()
  }

  update() {
    this.v.add(this.steering())
    this.pos.add(this.v)
    this.wrap()
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

    console.log("heading", v.heading())
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

  const pts = [
    v(0, 500),
    v(900, 500),
    //v(200, 600),
    //v(250, 500),
    //v(300, 500),
    //v(400, 400),
  ]

  const path = new Path(p, pts)
  const sprites = [
    new Sprite(p, v(250, 200), v(20, 0), path),
    //new Sprite(p, v(200, 200), v(0, 20), path),
    //new Sprite(p, v(200, 200), v(20, 20), path),
    //new Sprite(p, v(200, 200), v(20, -20), path),
    //new Sprite(p, v(200, 200), v(-20, 0), path),
  ]

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()
  }

  p.draw = () => {
    p.background(0)

    p.fill(200)
    p.stroke(255)
    p.strokeWeight(5)
    path.draw()
    for (const s of sprites) {
      s.update()
      s.draw()
    }
  }
}

new p5(sketch)
