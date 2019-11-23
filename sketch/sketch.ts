
class Ball {
  p: p5

  pos : p5.Vector
  v : p5.Vector
  a : p5.Vector
  m : number

  radius: number

  constructor(p: p5) {
    this.p = p
    this.m = p.random(2, 5)
    const r = this.m * 5
    this.radius = r
    this.pos = p.createVector(p.random(r, p.width - r), p.random(r, p.height -r))
    //this.v = p.createVector(p.random(5, 12), p.random(0.5, 2))
    this.v = p.createVector()
    this.a = p.createVector()
  }

  applyForce(f: p5.Vector) {
    const x = p5.Vector.div(f, this.m)
    this.a.add(x)
  }

  update() {
    const {pos, a, p, radius, v} = this

    v.add(a)
    pos.add(v)

    if (pos.x + radius  > p.width ) {
      pos.x = p.width - radius
      this.v = p.createVector(-v.x, v.y)

    } else if (pos.x - radius < 0 ) {
      pos.x = radius
      this.v = p.createVector(-v.x, v.y)
    }

    if (pos.y +radius > p.height ) {
      pos.y = p.height - radius
      this.v = p.createVector(v.x, -v.y)

    } else if(pos.y - radius < 0) {
      pos.y = radius
      this.v = p.createVector(v.x, -this.v.y)
    }
    a.mult(0)
  }
  draw() {
    const {p, pos, radius} = this
    p.noStroke()
    //console.log(pos)
    p.fill(200, 200)
    p.ellipse(pos.x, pos.y, radius*2, radius*2)
  }
}

const sketch = (p : p5) =>  {
  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  let balls: Ball[] = [];
  const N = 3;

  const G = p.createVector(0, 6.8)
  const DragCoefficient = 0.00000028

  const wind = p.createVector(0.072, 0)

  const gravity = (b :Ball) => p5.Vector.mult(G, b.m)

  const drag = (b :Ball) =>  {
    const v = b.v
    let speed  = v.mag()

    if (speed  == Infinity) {
      console.log("Drag", b.v,  speed , b.radius, DragCoefficient * speed * speed * b.radius)
      speed = 0
    }

    const f = p5.Vector.mult(v, -1)
    f.normalize()

    const area = 4 * p.PI * b.m * b.m * 0.08  // should use radius instead of mass
    f.mult(DragCoefficient * speed * speed * area)
    return f
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.frameRate(30)
    for(let i =0; i < N; i++) {
      const b = new Ball(p)
      balls.push(b)
    }
  }



  p.draw = () => {
    p.background(0)

    for(let b of balls) {
      b.applyForce(wind)
      b.applyForce(gravity(b))
      b.applyForce(drag(b))
      b.update()
      b.draw()
    }
  }

  p.mousePressed = (e) => {
    console.log(e)
    balls.push(new Ball(p))
  }
}


new p5(sketch)
