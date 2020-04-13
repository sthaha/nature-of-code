class Tree {
  p: p5
  pos: p5.Vector
  len: number
  angle: number
  scale: number
  levels: number

  constructor(p: p5, pos: p5.Vector, len: number, angle: number, scale: number, levels: number) {
    this.p = p
    this.pos = pos
    this.len = len
    this.angle = angle
    this.scale = scale
    this.levels = levels
  }

  draw() {
    const {p} = this
    p.stroke(200, 180)
    //p.strokeWeight(3);

    this.drawTree(this.pos, this.len, 0, this.levels)
  }

  drawTree(base:  p5.Vector, len: number, angle: number, level: number) {
    const {p} = this
    if (level <= 0) {
      return
    }
    p.strokeWeight(level*1.3);


    p.push()
    p.translate(base.x, base.y)
    p.rotate(angle) // + p.random(-p.PI/16, p.PI/16))
    const top = p.createVector(0, -len)
    p.line(0, 0, top.x, top.y)

    this.drawTree(top, len * this.scale + p.random(0.14), this.angle, level -1)
    this.drawTree(top, len * this.scale + p.random(0.14), -this.angle, level -1)
    p.pop()
  }

}


const sketch = (p : p5) =>  {

  let isLooping = true
  const noLoop = () => {isLooping = false; p.noLoop()}
  const loop = () => {isLooping = true; p.loop()}
  const toggleLoop = () => isLooping ? noLoop() :  loop()


  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

  p.keyPressed = () => {
    switch(p.keyCode) {
      case p.ESCAPE: toggleLoop(); return;
      case 32: p.redraw(); return
    }

    switch(p.key) {
      //case 'j': tree.generate()
    }

  }

  let trees :Tree[]
  const pt = (x: number, y:number) => p.createVector(x, y)

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    const {width, height} = p


    trees = [
      new Tree(p, pt(width * 0.7, height - 20), height* 0.3, p.PI/8.5, 0.6, 6),
      new Tree(p, pt(width * 0.5, height - 80), height* 0.12, p.PI/9, 0.75, 6),
      new Tree(p, pt(width * 0.35, height - 20), height* 0.3, p.PI/8, 0.7, 8),
    ]
    noLoop()

  }


  p.draw = () => {
    p.background(0)
    for (let tree of trees) {
      tree.draw()
    }
  }
}

new p5(sketch)
