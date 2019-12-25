class Particle {
  p: p5

  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector
  m: number

  clr: p5.Color
  radius: number

  reset: ()=>void


  constructor(p: p5, pos: p5.Vector, v: p5.Vector, c: p5.Color) {
    this.p = p
    this.clr = c


    this.reset = () => {
      this.pos = pos.copy()
      this.v = v.copy()
      this.radius = p.random(1,4)
      this.m = p.map(this.radius, 1,4,  0.5, 8)
      this.a = p.createVector()
    }

    this.reset()
  }

  applyForce(f: p5.Vector) {
    this.a.add(f.copy().div(this.m))
  }

  update() {
    this.v.add(this.a)
    this.pos.add(this.v)
    this.a.mult(0)
  }

  draw() {
    if (this.isDead()) {
      return
    }

    const {p,pos, clr, radius} = this

    clr.setAlpha(p.map(pos.y, 0, p.height, 255, 0))
    p.stroke(clr)
    p.fill(clr)
    p.strokeWeight(2)
    p.ellipse(pos.x, pos.y, radius, radius)
  }

  isDead() {
    const {pos, p, radius} = this
    const {x ,y}= pos
    const {width, height} = p

    return x+radius < 0 || x-radius > width ||
           y+radius < 0 || y-radius > height
  }
}

type ForceFn = (p: Particle) => p5.Vector

class ParticleSystem {
  p: p5
  n: number
  particles: Particle[] = []
  pos: p5.Vector
  batch: number

  forces: ForceFn[] = []
  _init: boolean = false

  constructor(p: p5, n: number, pos: p5.Vector, batch?: number) {
    this.p = p
    this.n = n
    this.pos = pos
    this.batch = batch || p.max(n/5, 1)
  }

  applyForce(f:(pt: Particle) => p5.Vector) {
    this.forces.push(f)
  }

  init() {
    if (this._init) {
      return
    }
    this._init = true
    const {p, pos, particles, batch, n} = this

    const v = (x: number, y: number) => p.createVector(x, y)
    const x = (x: number) => p.createVector(x, 0)
    const y = (y: number) => p.createVector(0, y)


    const addParticles = (n: number) => {
      for (let i = 0; i<n; i++){
        const pos = v( this.pos.x + p.random(-4, 4), this.pos.y + p.random(4))

        const vx = p.random(-2, 2)
        const vy = p.random(-3, 1)

        const c = p.color(p.random(220, 255), 152, 82)

        const pt = new Particle(p, pos, v(vx, vy), c)
        particles.push(pt)
      }
    }

    addParticles(this.batch)

    for (let i = 0; i< (n-batch)/batch; i++) {
      setTimeout(() => addParticles(batch), i * 250)
    }
  }

  run(){
    this.init()

    const {particles} = this

    for(let pt of particles){
      pt.draw()
      if (pt.isDead()){
        pt.reset()
        continue
      }

      for (const f of this.forces) {
        pt.applyForce(f(pt))
      }
      pt.update()
    }
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



  const v = (x: number, y: number) => p.createVector(x, y)
  const x = (x: number) => p.createVector(x, 0)
  const y = (y: number) => p.createVector(0, y)

  let ps: ParticleSystem[] = []

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)


    //noLoop()
    //setTimeout(toggleLoop, 1000)
    const ps1 = new ParticleSystem(p, 150, v(p.width/2, 150), 15)
    ps1.applyForce(gravity)
    ps1.applyForce(wind)

    const ps2 = new ParticleSystem(p, 50, v(p.width/2, 155), 5)
    ps2.applyForce(gravity)

    ps.push(ps1)
    ps.push(ps2)
  }


  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }



  const gravity = (obj: Particle) => y(0.0995).mult(obj.m)
  const wind = () => x((0.5 - p.noise(p.frameCount)) * 1.939)

  const move = v(1, 0)

  p.draw = () => {
    p.background(0)
    for (const x of ps) {
      x.run()
    }
  }

}

new p5(sketch)
