class Body {
  p: p5

  pos : p5.Vector
  v : p5.Vector
  a : p5.Vector
  m : number

  forces: p5.Vector[] = []
  path: p5.Vector[] = []
  color: p5.Color

  radius: number

  constructor(p: p5, m: number, r: number, v: p5.Vector, clr: p5.Color,  pos?: p5.Vector) {
    this.p = p
    this.m = m
    this.radius = r
    this.v = v
    this.color = clr

    this.pos =  pos || p.createVector(p.random(r, p.width - r), p.random(r, p.height -r))
    this.a = p.createVector()
  }

  applyForce(f: p5.Vector) {
    this.forces.push(f)

    const x = p5.Vector.div(f, this.m)
    this.a.add(x)
  }

  attract(o: Body){
    const G = 2
    const g = p5.Vector.sub(o.pos, this.pos)
    const distSq = g.magSq()

    const mag = G * this.m * o.m / distSq

    g.normalize()
    g.mult(mag)

    this.applyForce(g)
  }

  update() {
    const {pos, a, p, radius, v, path} = this

    v.add(a)
    pos.add(v)

    if (path.length > 840) {
      path.splice(0, 80)
    }
    path.push(pos.copy())



    if (pos.x - radius  > p.width ) {
      pos.x = -radius
    } else if (pos.x + radius < 0 ) {
      pos.x = p.width  + radius
    }

    if (pos.y - radius  > p.height ) {
      pos.y = -radius
    } else if (pos.y + radius < 0 ) {
      pos.y = p.height  + radius
    }

    a.mult(0)
  }
  draw() {
    const {p, pos, path, v, radius, forces, color} = this


    const pathColor = p.color(p.red(color), p.green(color), p.blue(color), 30)

    p.stroke(pathColor)
    p.noFill()
    p.strokeWeight(2)
    p.beginShape()
    for (let pt of path) {
      p.vertex(pt.x, pt.y)
    }
    p.endShape()

    p.noStroke()

    p.fill(this.color)
    p.ellipse(pos.x, pos.y, radius*2, radius*2)
    p.strokeWeight(1)

    const forceScale = p.min(12000/this.m, 20000000)
    for (let i = 0, len = forces.length; i < len; i++) {
      p.stroke(100, 220 + i * 30, 200, 220)
      const f = forces[i]
      p.line(pos.x, pos.y, pos.x+ f.x * forceScale, pos.y + f.y * forceScale)
      //console.log(pos.x, pos.y, pos.x+ f.x * forceScale, pos.y + f.y * forceScale)
    }
    this.forces = []

    p.strokeWeight(3)
    p.stroke(200,120,100)
    p.line(pos.x, pos.y, pos.x+v.x, pos.y+v.y)
  }

}

const sketch = (p : p5) =>  {

  const N = 8;
  let bodies: Body[] = [];

  const G = p.createVector(0, 2.8)

  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  // forces

  const v = (x: number, y ?: number) => p.createVector(x, y || 0)

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.frameRate(30)

    const blue = p.color(10, 180, 255, 180)
    const red = p.color(230, 205, 180, 180)
    const yellow = p.color(200, 205, 120, 180)
    const cheeze = p.color(200, 205, 220, 190)


    const midX = p.width/2
    const x = midX
    //const earth = new Body(p, 1, 20, v(8), blue, v(p.width/2, p.height/2 - 140) )
    const earth = new Body(p, 2.672, 10, v(1.28), blue, v(x, p.height/2 - 280) )
    bodies.push(earth)

    const moon = new Body(p, earth.m * 0.0000632, 4, v(1.668), cheeze, v(x, p.height/2 - 310) )
    bodies.push(moon)

    //const mars = new Body(p, earth.m * 0.8, 14, v(8.38), yellow, v(p.width/2, p.height/2 - 175) )
    //const mars = new Body(p, earth.m * 0.8, 14, v(7.38), yellow, v(p.width/2, p.height/2 - 215) )
    //const sun = new Body(p, earth.m * 140, 50,  v(0), red,  v(midX, p.height/2) )
    //bodies.push(sun)
    //const sun = new Body(p, earth.m * 10000, 80,  v(0), green,  v(p.width/2, p.height/2) )
    //bodies.push(sun, earth, mars)
    //p.noLoop()
  }

  p.keyPressed = () => {
    switch (p.keyCode) {
      case p.ESCAPE: p.noLoop(); break;
      case p.ENTER: p.loop(); break;
      case 32: p.redraw(); break;
    }
  }



  p.draw = () => {
    p.background(30)
    p.fill(80, 180, 200, 180)
    p.noStroke()

    const others = [...bodies]
    for(let b of bodies) {
      for (let o of others) {
        if (o === b){
          continue
        }
        o.attract(b)
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
    //const b = new Body(p, 1, 8, v(1), v(e.clientX, e.clientY))
    //bodies.push(b)
    p.redraw()

  }
}


new p5(sketch)
