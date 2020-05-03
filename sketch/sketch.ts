const Config = {
  Population: 10,
  MutationRate: 0.1,
  LifeSpan: 200,
  MaxForce: 0.4,

};

interface Gene {
  apply: () => void
}

class DNA {
  p: p5

  len: number
  genes: any[]

  constructor(p: p5, len: number, newFn: ()=>any) {
    this.p = p
    this.len = len
    this.genes = Array.from({length: len}, newFn);
  }

  at(n: number) {
    return this.genes[n]
  }

  mutate() {

  }

  sequence() {
    return this.genes
  }

}

interface Movable {
  update: () => void
  draw: () => void
}

class Rocket implements Movable{
  p: p5
  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector
  dna: DNA
  current: number

  constructor(p: p5, pos: p5.Vector, dna: DNA) {
    this.p = p
    this.pos = pos
    this.v = p5.Vector.random2D()
    this.a = p.createVector()
    this.dna = dna
    this.current = 0
  }
  applyForce(f: p5.Vector) {
    this.a.add(f)
  }

  update() {
    const {dna} = this
    const f = dna.at(this.current++)
    this.applyForce(f)

    this.v.add(this.a)
    this.pos.add(this.v)
    this.a.mult(0)
  }
  //run(n: number) {
    //const dbgV = (t: any, v: p5.Vector) => `${t}: ${v.x}, ${v.y}`
    //console.log("Running:",  n, dbgV("v", this.v), dbgV("pos", this.pos))
    //const x = this.dna.at(n)
    //this.v.add(x)
    //this.pos.add(this.v)
    //this.draw()
  //}

  draw() {
    const {p, pos, v} = this
    p.strokeWeight(3)
    p.stroke(0, 220, 220, 220)

    p.push()
      p.translate(pos)
      p.rotate(v.heading() + p.HALF_PI)


      const w = 7
      const h = 10
      p.point(0, 0)
      // base
      p.line(-w, h, w, h)
      // /
      p.line(-w, h, 0, -h)
      // \
      p.line(w, h, 0, -h)
    p.pop()
  }
}

class Population {
  p: p5
  ppl: Movable[]
  generation = 0;

  constructor(p: p5, len: number, newFn: () => Movable) {
    this.p = p
    this.generation = 0;
    this.ppl = Array.from({length: len}, newFn)
  }

  run() {
    for (const x of this.ppl) {
      x.update()
      x.draw()
    }
  }

}
class ForceGene implements Gene {
  obj: Movable
  p: p5
  constructor(p: p5, o: Movable) {
    this.p = p
    this.obj= o
  }
  apply() {
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


  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  const v = (x: number, y: number) => p.createVector(x,y)

  const randDir = (max: number) => () => {
    const angle = p.random(p.TWO_PI)
    const vec = p5.Vector.fromAngle(angle)
    vec.mult(p.random(max))
    return vec
  }


  let population: Population
  //let rocket: Rocket
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()
    const newRocket = () => {
      const dna = new DNA(p, Config.LifeSpan, randDir(Config.MaxForce))
      return new Rocket(p, v(p.width/2, p.height - 20), dna)
    }

    population = new Population(p, Config.Population, newRocket)
    //rocket = new Rocket(p, v(p.width/2, p.height - 20))
  }

  let current = 0

  p.draw = () => {
    p.background(0)
    population.run()
    //rocket.update()
    //rocket.draw()
  }
}

new p5(sketch)
