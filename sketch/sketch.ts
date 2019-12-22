const sketch = (p : p5) =>  {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(0)
    p.noLoop()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }


  let angle : number = 0
  let len : number = 1
  p.draw = () => {
    p.translate(p.width/2, p.height/2)


    p.fill(200)
    p.stroke(255)
    p.strokeWeight(5)

    const rad = angle * 2 * p.PI / 360
    const x = len * p.cos(angle)
    const y = len * p.sin(angle)
    p.point(x, y)

    const fr = p.max(15, p.frameRate())
    angle += 1.0/ fr
    len += 2.0/ fr
  }

  p.keyPressed = () => {
    switch(p.keyCode) {
      case p.ESCAPE: p.noLoop()
      case p.RETURN: p.loop()
      case 32: p.redraw()
    }
  }
}

new p5(sketch)
