const stat = {
  down: 0,
  up: 0,
  left: 0,
  right: 0,
}
type mover = (x :number, y: number) =>  [number, number]

const down: mover = (x:number, y:number) => {stat.down++; return [x, y + 5] }
const up: mover = (x:number, y:number) =>  { stat.up++; return [x, y - 5] }
const left: mover = (x:number, y:number) => { stat.left++; return [x - 5, y] }
const right: mover = (x:number, y:number) => { stat.right++; return [x + 5, y] }

class Walker {
  p : p5
  x : number
  y : number

 tendency = [down, down, right, right, left, up]

  constructor(p: p5) {
    this.p = p

    this.x = p.width/2
    this.y = p.height/2
  }

  step() {
    const {x, y, p, tendency } = this;
    const r = Math.floor(p.random(tendency.length));

    [this.x, this.y]  = tendency[r](x, y)
    console.log("stat", stat)

    this.wrap()
  }

  wrap() {
    const {width, height} = this.p

    if (this.x < 0) {
      this.x = width
    } else if (this.x > width) {
      this.x = 0
    }

    if (this.y < 0) {
      this.y = height
    } else if (this.y > height) {
      this.y = 0
    }

  }

  draw() {
    const {p, x, y} = this
    //console.log("at: ", x, y)
    p.stroke(200, 180)
    p.strokeWeight(6)
    p.point(x, y)
  }
}

class PerlinNoiseWalker {
  p : p5
  x : number
  y : number
  t : number


  constructor(p: p5) {
    this.p = p

    this.x = p.width/2
    this.y = p.height/2
    this.t = 0.0
  }

  step() {
    const {x, y, p, t } = this;
    const r = p.noise(t)

    let move : mover
    if (r < 0.25) {
      move = down
    }else if (r < 0.5) {
      move = left
    }else if (r < 0.75) {
      move = right
    } else {
      move = up
    }
    [this.x, this.y]  = move(x, y)
    console.log("stat", r, stat)

    this.wrap()
    this.t += 0.1
  }

  wrap() {
    const {width, height} = this.p

    if (this.x < 0) {
      this.x = width
    } else if (this.x > width) {
      this.x = 0
    }

    if (this.y < 0) {
      this.y = height
    } else if (this.y > height) {
      this.y = 0
    }

  }

  draw() {
    const {p, x, y} = this
    //console.log("at: ", x, y)
    p.stroke(200, 180)
    p.strokeWeight(6)
    p.point(x, y)
  }
}

const sketch = (p : p5) =>  {
  let w : PerlinNoiseWalker
  p.windowResized = () => { p.resizeCanvas(p.windowWidth, p.windowHeight) }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(0)
    w  = new PerlinNoiseWalker(p)
  }


  p.draw = () => {
    w.step()
    w.draw()
  }
}


new p5(sketch)
