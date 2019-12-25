class Pendulum {

  p: p5

  origin: p5.Vector
  length: number
  angle: number

  clr: p5.Color

  aVel = 0
  aAcc = 0


  constructor(p: p5, origin: p5.Vector, length: number, angle: number, c: p5.Color) {
    this.p = p
    this.origin = origin
    this.length = length
    this.angle = angle
    this.clr = c

  }

  update() {
    // check tab for calc of Fpendulum
    const {p, angle} = this

    this.aAcc = -0.01 * p.sin(angle)

    this.aVel += this.aAcc
    this.aVel *= 0.9993
    this.angle += this.aVel
  }

  draw() {
    const {p, origin, length, angle, clr} = this

    const x = origin.x +  length * p.sin(angle)
    const y = origin.y +  length * p.cos(angle)

    p.stroke(clr)
    p.strokeWeight(3)
    p.line(origin.x, origin.y, x, y)

    p.fill(200)
    p.strokeWeight(5)
    p.ellipse(x, y, 28, 28)

  }
}

const sketch = (p : p5) =>  {
  let origin : p5.Vector


  let isLooping = false
  const toggleLoop = () => {
    isLooping = !isLooping
    if (isLooping) {
      p.loop()
    } else {
      p.noLoop()
    }
  }
  const noLoop = () => {isLooping = false; p.noLoop()}


  const pendulums: Pendulum[] = []

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    const origin = p.createVector(p.width/2, 0)

    pendulums.push(
      new Pendulum(p, origin, 225, p.PI/3, p.color(18, 180, 20, 180)),
      new Pendulum(p, origin, 225, p.PI/4, p.color(180, 80, 20, 180)),
      new Pendulum(p, origin, 225, p.PI/5, p.color(18, 80, 180, 180)),
      new Pendulum(p, origin, 225, p.PI/6, p.color(180, 80, 120, 180)),
      new Pendulum(p, origin, 225, p.PI/7, p.color(180, 180, 20, 180)),
      new Pendulum(p, origin, 225, p.PI/8, p.color(180, 80, 220, 180)),
    )
    noLoop()
    setTimeout(toggleLoop, 4000)

  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }


  //let angle = p.PI/4
  //let length = 225

  //let aVel = 0
  //let aAcc = 0


  p.draw = () => {
    p.background(0)

    for(let p of pendulums){
      p.draw()
      p.update()
    }


    //const x = origin.x +  length * p.sin(angle)
    //const y = origin.y +  length * p.cos(angle)

    //p.stroke(180, 80, 20)
    //p.strokeWeight(3)
    //p.line(origin.x, origin.y, x, y)

    //p.fill(200)
    //p.strokeWeight(5)
    //p.ellipse(x, y, 28, 28)

  }



  p.keyPressed = () => {
    switch(p.keyCode) {
      case p.ESCAPE: toggleLoop(); return;
      case 32: p.redraw(); return
    }
  }
}

new p5(sketch)
