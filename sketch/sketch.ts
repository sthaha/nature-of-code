const Config = {
  Population: 15,
  MutationRate: 0.09,
  LifeSpan: 400,
  MaxForce: 0.5,

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

  update: () => void
  draw: () => void
  evalFitness: () => void
  crossover: (other: Movable) => Movable
}




class Rocket implements Movable {
  p: p5
  pos: p5.Vector
  v: p5.Vector
  a: p5.Vector
  current: number
  fitness: number
  dna: DNA
  completed: boolean = false

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
    if (this.completed) {
      return
    }

    const {pos, dna, target} = this
    if (pos.dist(target) < 16) {
      this.completed = true
      this.pos = target.copy()
      return
    }

    const f = dna.at(this.current++)
    this.applyForce(f)

    this.v.add(this.a)
    this.pos.add(this.v)
    this.a.mult(0)
  }

  draw() {
    const {p, pos, v} = this
    p.strokeWeight(4)
    p.stroke(0, 220, 220, 200)

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
    if (this.completed) {
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

class Population {
  p: p5
  ppl: Movable[]
  generation = 0;
  matingPool: Movable[];


  constructor(p: p5, len: number,  newFn: (dna?: DNA) => Movable) {
    this.p = p
    this.generation = 0;
    this.ppl = Array.from({length: len}, newFn)
  }

  run() {
    this.generation++
    for (const x of this.ppl) {
      x.update()
      x.draw()
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

  const newRocket = (dna?: DNA) => {
    dna = dna || new DNA(p, Config.LifeSpan, randDir(Config.MaxForce))
    return new Rocket(p, target, dna)
  }

  let target: p5.Vector
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    noLoop()

    target = p.createVector(p.width/2, 20)
    population = new Population(p, Config.Population, newRocket)
  }

  let current = 0

  p.draw = () => {
    p.background(20)
    p.noStroke()
    p.fill(200, 0, 200)
    p.ellipse(target.x, target.y, 20, 20)

    population.run()
    population.generateMatingPool()
    population.selection()

    //if (population.generation >= Config.LifeSpan) {
      //population = new Population(p, Config.Population, newRocket)
    //}
    //rocket.update()
    //rocket.draw()
  }
}

new p5(sketch)
