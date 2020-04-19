
class LSystem {
  p: p5
  axiom: string
  ruleset: {[id: string]: string}
  constructor(p: p5, axiom: string, ruleset: {[id: string]: string}) {
    this.p = p
    this.axiom = axiom
    this.ruleset = ruleset
  }

  compute() {
    const {axiom, ruleset} = this
    this.axiom = axiom.split("").map((x:string) => ruleset[x] || x).join("")
  }
}

class AxiomInterpreter {
  p: p5
  lsystem: LSystem
  len: number = 100
  gen: number = 0
  constructor(p: p5, lsystem: LSystem) {
    this.p = p
    this.lsystem = lsystem
    this.gen = 0
  }

  interpret() {
    const {p, lsystem, gen, len} = this
    const {axiom} = lsystem
    const angle = p.radians(25)

    const actions: {[id:string]: ()=>any } = {
      F: () => {p.line(0, 0, 0, -len); p.translate(0, -len)},
      '-': () => p.rotate(-angle),
      '+': () => p.rotate(angle),
      '[': () => p.push(),
      ']': () => p.pop(),
    }

    console.group()
    //console.log("axiom: ", axiom)
    p.strokeWeight(p.map(gen, 0, 5, 3, 1))
    p.stroke(255, p.map(gen, 0, 5, 100, 60))

    p.translate(p.width/2, p.height)
    p.push()
      for (let i = 0; i<axiom.length; i++) {
        const ch = axiom.charAt(i)
        const action = actions[ch]
        //console.log("ch:", ch)
        action && action()
      }
    p.pop()
    console.groupEnd()
    this.len *= 0.5
    this.gen++
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

  const lsys = new LSystem(p, "F", {
    F: "FF+[+F-F-F]-[-F+F+F]",
  })

  const interpreter = new AxiomInterpreter(p, lsys)

  p.setup = () => {
    p.noCanvas()
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(0)
    noLoop()


  }

  p.draw = () => {
    lsys.compute()
    interpreter.interpret()
  }
}

new p5(sketch)
