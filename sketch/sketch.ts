
const sketch = (p : p5) =>  {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.angleMode(p.RADIANS)
  }

  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  let angle = 0
  let v = 0

  p.draw = () => {
    p.background(0)

    const a = p.map(p.mouseX, 0, p.width, -p.PI/128, p.PI/128)
    v += a
    angle += v

    const w = 100
    const h = 50
    p.rectMode(p.CENTER)
    p.translate(p.width/2, p.height/2)
    p.rotate(angle)
    p.rect(0, 0, w, h)
  }
}

new p5(sketch)
