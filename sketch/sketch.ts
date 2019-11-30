
class Thing {
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



}

class Ball {
  p: p5

  pos : p5.Vector
  v : p5.Vector
  a : p5.Vector
  m : number

  forces: p5.Vector[] = []

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
    this.forces.push(f)

    const x = p5.Vector.div(f, this.m)
    this.a.add(x)
  }

  update() {
    const {pos, a, p, radius, v} = this

    v.add(a)
    pos.add(v)

    if (pos.x + radius  > p.width ) {
      pos.x = p.width - radius
      this.v = p.createVector(-v.x * 0.95, v.y)

    } else if (pos.x - radius < 0 ) {
      pos.x = radius
      this.v = p.createVector(-v.x * 0.95, v.y)
    }

    if (pos.y +radius > p.height ) {
      pos.y = p.height - radius
      this.v = p.createVector(v.x, -v.y * 0.95)

    } else if(pos.y - radius < 0) {
      pos.y = radius
      this.v = p.createVector(v.x, -this.v.y * 0.95)
    }
    a.mult(0)
  }
  draw() {
    const {p, pos,v, radius, forces} = this
    p.noStroke()
    //console.log(pos)
    p.fill(200, 200)
    p.ellipse(pos.x, pos.y, radius*2, radius*2)
    p.strokeWeight(2)

    for (let i = 0, len = forces.length; i < len; i++) {
      p.stroke(100,150 + i * 30, 100, 120)
      const f = forces[i]
      p.line(pos.x, pos.y, pos.x+f.x*2, pos.y+f.y*2)
    }

    p.strokeWeight(3)
    p.stroke(200,120,100)
    p.line(pos.x, pos.y, pos.x+v.x, pos.y+v.y)
    this.forces = []
  }

}

const sketch = (p : p5) =>  {

  const N = 8;
  let balls: Ball[] = [];
  const G = p.createVector(0, 2.8)
  const DragCoefficient = 0.0202
  const windDir = p.createVector(0.692, 0)


  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  // forces

  const wind =  (b: Ball)=> b.applyForce(windDir)
  const gravity = (b :Ball) =>  b.applyForce(p5.Vector.mult(G, b.m))

  const drag = (b :Ball) =>  {
    const v = b.v
    let speed  = v.mag()

    const f = p5.Vector.mult(v, -1)
    f.normalize()

    //const area = 2
    const area = 4 * p.PI * b.radius * b.radius // should use radius instead of mass
    const drag = DragCoefficient * speed * speed * area
    const dragMax = p.constrain(drag, -speed, speed)
    //console.log("drag:", drag, dragContrained)

    f.mult(dragMax)
    b.applyForce(f)
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

  p.keyPressed = () => {
    switch (p.keyCode) {
      case p.ESCAPE: p.noLoop(); break;
      case p.ENTER: p.loop(); break;
      case 32: p.redraw(); break;
    }
  }



  p.draw = () => {
    p.background(60)
    p.fill(80, 180, 200, 180)
    p.noStroke()
    p.rect(0,p.height * 0.66, p.width, p.height * 0.66)

    for(let b of balls) {
      gravity(b)
      //wind(b)
      if (b.pos.y < p.height * 0.66){
        wind(b)
      } else {
        drag(b)
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
    p.redraw()

  }
}


new p5(sketch)
