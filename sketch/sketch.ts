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

class ParticleSystem {
  constructor(n: number, origin: p5.Vector) {

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



  const N = 80
  const particles: Particle[] = []



  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)


    noLoop()
    setTimeout(toggleLoop, 1000)

    addParticles(50)
    const batch = 15
    for (let i = 0; i<N/batch; i++) {
      setTimeout(() => addParticles(batch), 1000 + i * 150)
    }


  }

  const v = (x: number, y: number) => p.createVector(x, y)
  const x = (x: number) => p.createVector(x, 0)
  const y = (y: number) => p.createVector(0, y)

  const addParticles = (n: number) => {
    for (let i = 0; i<n; i++){
      const pos = v( p.width/2 + p.random(-8, 8), 180+ p.random(8))

      const vx = p.random(-2, 2)
      const vy = p.random(-3, 1)

      //const c = p.color(250, 12, p.random(190, 255))
      const c = p.color(p.random(210, 255), 192, 12)

      const pt = new Particle(p, pos, v(vx, vy), c)
      particles.push(pt)
    }

  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }


  const gravity = (obj: Particle) => y(0.0985).mult(obj.m)
  const wind = (t: number) => x((0.5 - p.noise(t)) * 0.839)

  p.draw = () => {
    p.background(0)

    for(let pt of particles){
      pt.draw()
      if (pt.isDead()){
        pt.reset()
        continue
      }

      pt.applyForce(gravity(pt))
      pt.applyForce(wind(p.frameCount))
      pt.update()
    }
  }

}

new p5(sketch)
