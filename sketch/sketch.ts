class Path {
  p: p5
  points: p5.Vector[]
  radius: number

  constructor(p: p5, points : p5.Vector[]) {
    this.p = p
    this.points = [...points]

    this.radius = 90
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

    this.maxForce = p.random(2, 4)
    this.maxSpeed = p.random(5, 8)
    //this.maxForce = 5 //p.random(5)
    //this.maxSpeed = 8 //p.random(8)
  }



  projection(pt: p5.Vector, start: p5.Vector, end: p5.Vector) {
    const {p, } = this

    const posV = p5.Vector.sub(pt, start)
    const baseV = p5.Vector.sub(end, start)

    const theta = posV.angleBetween(baseV)
    console.log("angle:", theta)

    const proj = baseV.copy()
    proj.setMag(posV.mag() * p.cos(theta))

    return p5.Vector.add(start, proj)
  }


  follow() {
    const {p, pos} = this

    // prediction
    const futureV = this.v.copy()
    futureV.mult(2)
    const futurePos = p5.Vector.add(pos, futureV)

    // does it lead to path
    const start = this.path.points[0]
    const end = this.path.points[1]

    const proj = this.projection(this.pos, start, end)
    const futureProj = this.projection(futurePos, start, end)

    p.strokeWeight(8)
    p.stroke(55, 220, 80, 170)
    p.point(proj.x, proj.y)

    p.stroke(255, 80, 80, 170)
    p.point(futureProj.x, futureProj.y)

    const approaching = pos.dist(proj) - futureProj.dist(futurePos) >  this.maxForce

    if (approaching) {
      return
    }

    this.steer(p5.Vector.add(futureProj, p.createVector(50,0)))
  }

  steer(target: p5.Vector) {
    const {p, pos, path, maxForce} = this

    //const futureV = p5.Vector.add(target, p5.createVector(50, 0))
    //const futurePos = p5.Vector.add(pos, futureV)


    // does it lead to path
    //const start = path.points[0]
    //const end = path.points[1]
    //const target = this.projection(futurePos, start, end)

    p.strokeWeight(8)
    p.stroke(225, 220, 80, 180)
    p.point(target.x, target.y)


    const desired = p5.Vector.sub(target, pos)
    const mag = p.map(pos.dist(target), 0, path.radius, 0, maxForce)
    desired.setMag(mag)

    this.a.add(desired)
  }

  update() {
    this.v.add(this.a)
    this.v.limit(this.maxSpeed)
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
    v(50, 400),
    v(900, 400),
    //v(200, 600),
    //v(250, 500),
    //v(400, 500),
    //v(600, 400),
  ]

  const path = new Path(p, pts)
  const sprites = [
    new Sprite(p, v(250, 200), v(20, -12), path),
    new Sprite(p, v(200, 200), v(0, 20), path),
    new Sprite(p, v(200, 200), v(20, 20), path),
    new Sprite(p, v(200, 200), v(20, -20), path),
    new Sprite(p, v(200, 200), v(-20, 0), path),
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
      s.follow()
      s.update()
      s.draw()
    }
  }
}

new p5(sketch)
