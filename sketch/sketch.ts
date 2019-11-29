
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
    const {p, pos,v, radius} = this
    p.noStroke()
    //console.log(pos)
    p.fill(200, 200)
    p.ellipse(pos.x, pos.y, radius*2, radius*2)
    p.stroke(200,120,100)
    p.strokeWeight(2)
    p.line(pos.x, pos.y, pos.x+v.x, pos.y+v.y)
  }
}

const sketch = (p : p5) =>  {
  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  let balls: Ball[] = [];
  const N = 8;

  const G = p.createVector(0, 4.8)
  const DragCoefficient = 0.0492

  const wind = p.createVector(3.192, 0)

  const gravity = (b :Ball) => p5.Vector.mult(G, b.m)

  const drag = (b :Ball) =>  {
    const v = b.v
    let speed  = v.mag()

    if (speed  == Infinity) {
      speed = 0
    }

    const f = p5.Vector.mult(v, -1)
    f.normalize()

    const area = 4 * p.PI * b.m * b.m * 0.06  // should use radius instead of mass
    f.mult(p.constrain(DragCoefficient * speed * speed * area, 0, b.v.mag()))
    return f
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.frameRate(30)
    for(let i =0; i < N; i++) {
      const b = new Ball(p)
      b.pos = p.createVector(i * 120, 120)
      balls.push(b)

    }
  }



  p.draw = () => {
    p.background(80)
    p.fill(80, 180, 200, 180)
    p.noStroke()
    p.rect(0,p.height/2, p.width, p.height/2)

    for(let b of balls) {
      b.applyForce(gravity(b))
      if (b.pos.y > p.width/2){
        b.applyForce(drag(b))
      }
      else {
        b.applyForce(wind)
      }
      b.update()
      b.draw()
    }
  }

  interface MouseEvent {
    clientX : number
    clientY : number
  }

  p.mousePressed = (e: MouseEvent) => {
    console.log(e)
    const b = new Ball(p)
    b.pos = p.createVector(e.clientX, e.clientY)
    balls.push(b)

  }
}


new p5(sketch)
