const sketch = (p : p5) =>  {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.draw = () => {
    p.background(0)

    p.fill(200)
    p.stroke(255)
    p.strokeWeight(5)
    p.rect(100, 100, p.width-200, p.height-200)
  }
}

new p5(sketch)
