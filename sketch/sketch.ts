const Config = {
  Population: 50,
  MutationRate: 0.115,
  LifeSpan: 500,
  MaxForce: 0.8,

};

interface Gene {
  apply: () => void
}

class DNA {
  p: p5

  len: number
  genes: any[]
  newFn: () => any

  constructor(p: p5, len: number, newFn: ()=>any) {
    this.p = p
    this.len = len
    this.newFn = newFn

    this.genes = Array.from({length: len}, newFn);
  }

  at(n: number) {
    return this.genes[n]
  }

  crossover(other: DNA) {
    const {p, genes} = this

    let x = 0
    const selection = () => {
      const gene = x < genes.length/2 ? genes[x] : other.genes[x]
      x++
      return gene
    }

    const child = new DNA(p, genes.length, selection)
    child.mutate(this.newFn)
    return child
  }

  mutate(mutation: () => any) {
    this.genes = this.genes.map( g => this.p.random(1) < Config.MutationRate ? mutation() : g )
  }

  sequence() {
    return this.genes
  }

}

interface Movable {
  dna: DNA
  fitness: number
  reached: boolean

  update: () => void
  draw: () => void
  evalFitness: () => void
  crossover: (other: Movable) => Movable
  checkCrashed: (o: Obstacle) => void
}




class Rocket implements Movable {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector
  current: number
  fitness: number
  dna: DNA
  reached: boolean = false
  crashed: boolean = false

  target: p5.Vector

  constructor(p: p5, target: p5.Vector,  dna: DNA) {
    this.p = p
    this.target = target
    this.dna = dna

    this.pos = p.createVector(p.width/2, p.height - 20)
    this.v = p.createVector()
    this.a = p.createVector()

    this.current = 0
  }

  applyForce(f: p5.Vector) {
    this.a.add(f)
  }

  update() {
    if (this.reached || this.crashed) {
      return
    }

    const {pos, dna, target} = this
    if (pos.dist(target) < 14) {
      this.reached = true
      this.pos = target.copy()
      return
    }

    const f = dna.at(this.current++)
    this.applyForce(f)

    this.v.add(this.a)
    this.pos.add(this.v)
    this.a.mult(0)
  }

  checkCrashed(obstacle: Obstacle) {
    if (this.crashed) {
      return
    }

    const {pos} = this
    const {x, y} = pos
    this.crashed = obstacle.contains(pos)

  }

  draw() {
    const {p, pos, v} = this
    p.strokeWeight(4)
    if (this.crashed) {
      p.stroke(200, 120, 120, 100)
    } else if (this.reached){
      p.stroke(0, 220, 120, 230)
    } else {
      p.stroke(0, 200, 200, 200)
    }


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

  evalFitness()  {
    if (this.crashed) {
      this.fitness = 0.00001
      return
    }

    if (this.reached) {
      this.fitness = 2
      return
    }

    this.fitness = 1/ this.target.dist(this.pos)
  }

  crossover(other: Rocket) {
    const {p, dna, target} = this

    const newDNA = dna.crossover(other.dna)
    return new Rocket(this.p, target, newDNA)
  }
}

class Obstacle {
  p: p5
  x: number
  y: number
  w: number
  h: number

  constructor(p: p5, x: number,y: number, w: number, h: number) {
    this.p = p
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  left() {
    return this.x
  }
  right() {
    return this.x + this.w
  }
  top() {
    return this.y
  }

  bottom() {
    return this.y + this.h
  }

  contains(pos: p5.Vector) {
    const {x, y} = pos
    const crashed =   x > this.left() && x < this.right() && y > this.top() && y < this.bottom()
    if (crashed){
      console.log(crashed, "     x:", x, ", y:", y, " IN ? ", this.left(), "-", this.right(), " | ", this.top(), ",", this.bottom())
    }

    return crashed
  }


  draw() {
    const {p, x, y, w, h} = this
    p.fill(180, 120)
    p.rect(x, y, w, h)
  }
}

class Population {
  p: p5
  ppl: Movable[]
  generation = 0;
  matingPool: Movable[];
  obstacles: Obstacle[];
  reached: boolean

  constructor(p: p5, len: number,  newFn: (dna?: DNA) => Movable, obs: Obstacle[]) {
    this.p = p
    this.generation = 0;
    this.ppl = Array.from({length: len}, newFn)
    this.obstacles = obs
  }

  run() {
    this.generation++
    for (const x of this.ppl) {
      x.update()
      x.draw()
      for (const o of this.obstacles) {
        x.checkCrashed(o)
      }
      if (x.reached){
        this.reached = true
      }
    }
  }

  generateMatingPool() {
    if (this.generation < Config.LifeSpan) {
      return
    }

    let maxFit = -1
    for (const x of this.ppl) {
      x.evalFitness()
      if (x.fitness > maxFit) {
        maxFit = x.fitness
      }
    }

    this.matingPool = []

    const {p} = this
  console.log("MaxFit:", maxFit)
    for (const x of this.ppl) {
      const num = p.ceil(x.fitness/maxFit * 100)
      console.log("   fitness:", x.fitness, " num:", num)
      const dups = Array(num).fill(x)
      this.matingPool.push(...dups)
    }

    console.log("MaxFit:", maxFit, "pool:", this.matingPool.length)
  }

  selection() {
    if (this.generation < Config.LifeSpan) {
      return
    }

    const {p, matingPool} = this
    console.log( "pool:", this.matingPool.length)

    const l = matingPool.length
    this.ppl = this.ppl.map(() => {
      const rA = p.floor(p.random(l))
      const a = matingPool[rA]

      const rB = p.floor(p.random(l))
      const b = matingPool[rB]

      const child = a.crossover(b)
      return child
    })
    this.generation = 0
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


  let target: p5.Vector
  let obstacles: Obstacle[]
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()


    target = p.createVector(p.width/2, 20)
    const newRocket = (dna?: DNA) => {
      dna = dna || new DNA(p, Config.LifeSpan, randDir(Config.MaxForce))
      return new Rocket(p, target, dna)
    }

    obstacles = [
      new Obstacle(p, p.width * 0.1, p.height - 300, p.width * 0.12, 20),
      new Obstacle(p, p.width * 0.7, p.height - 300, p.width * 0.12, 20),
      new Obstacle(p, p.width * 0.4, p.height - 400, p.width * 0.2, 20),
      new Obstacle(p, p.width * 0.2, p.height - 500, p.width * 0.12, 20),
      new Obstacle(p, p.width * 0.8, p.height - 500, p.width * 0.12, 20),
      new Obstacle(p, p.width * 0.6, p.height - 600, p.width * 0.12, 20),
      new Obstacle(p, p.width * 0.3, p.height - 600, p.width * 0.12, 20),
    ]
    population = new Population(p, Config.Population, newRocket, obstacles)
  }

  let current = 0

  p.draw = () => {
    p.background(20)
    p.noStroke()
    p.fill(200, 0, 200)
    p.ellipse(target.x, target.y, 20, 20)

    for (const o of obstacles) {
      o.draw()
    }

    population.run()
    if (population.reached){
      noLoop()
    }
    population.generateMatingPool()
    population.selection()
  }
}

new p5(sketch)
