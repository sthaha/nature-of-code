const sketch = (p : p5) =>  {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.noLoop()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }


  const amplitude = 150
  const period = 90

  p.draw = () => {
    p.translate(p.width/2, p.height/2)

    p.background(0)


    p.fill(200)
    p.stroke(180, 80, 20)
    p.strokeWeight(5)

    // check tab a whole period = 2_pi
    const angle = p.frameCount * p.TWO_PI/period % p.TWO_PI
    console.log("fc:", p.frameCount, "angle: ", angle)

    const y = amplitude * p.sin(angle)
    p.line(0,0, 0, y)
    p.ellipse(0, y, 8, 8)

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
