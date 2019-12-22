class Pendulum {
  constructor(length: number, angle: number) {

  }
}
const sketch = (p : p5) =>  {
  let origin : p5.Vector

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    origin = p.createVector(p.width/2, 0)

    p.noLoop()
    setTimeout(() => p.loop(), 4000)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }


  let angle = p.PI/4
  let length = 225

  let aVel = 0
  let aAcc = 0


  p.draw = () => {
    p.background(0)


    const x = origin.x +  length * p.sin(angle)
    const y = origin.y +  length * p.cos(angle)

    p.stroke(180, 80, 20)
    p.strokeWeight(3)
    p.line(origin.x, origin.y, x, y)

    p.fill(200)
    p.strokeWeight(5)
    p.ellipse(x, y, 28, 28)

    // check tab for calc of Fpendulum
    aAcc = -0.01 * p.sin(angle)

    aVel += aAcc
    aVel *= 0.9953
    angle += aVel
  }



  p.keyPressed = () => {
    switch(p.keyCode) {
      case p.ESCAPE: p.noLoop(); return;
      case p.RETURN: p.loop(); return;
      case 32: p.redraw(); return
    }
  }
}

new p5(sketch)
