const kochPoints = (p: p5, start: p5.Vector, end: p5.Vector) => {
  const v = p5.Vector.sub(end, start)
  v.div(3)

  const seg1 = p5.Vector.add(start, v)
  const seg2 = p5.Vector.add(seg1, v)

  // compute peak
  v.rotate(-p.PI/3)
  const mid = p5.Vector.add(seg1, v)
  return [seg1, mid, seg2]
}

class Koch {
  p: p5
  segments: p5.Vector[]
  constructor(p: p5, start: p5.Vector, end: p5.Vector ) {
    this.p = p
    this.segments = [start, end]
  }

  recurse() {

    const {p, segments} = this
    const res = [segments[0].copy()]

    for (let i = 0; i < segments.length-1; i++) {
      const start = segments[i]
      const end = segments[i+1]

      const kp = kochPoints(p, start, end)
      // ignore start since the end is the next start
      res.push(...kp, end)
    }
    this.segments = res
    console.log(res.length)
  }
  draw() {
    const {p, segments} = this

    p.noFill()
    p.beginShape()
    for (let i = 0; i< segments.length; i++){
      const pt = segments[i]
      p.vertex(pt.x, pt.y)
      //p.ellipse(pt.x,pt.y, 3, 3)
    }
    p.endShape()
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

  const pt = (x: number, y: number) => p.createVector(x, y)

  let koch: Koch
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    const {width, height} = p

    koch = new Koch(p, pt(20, height*0.7), pt(width-20, height * 0.7))
    p.strokeWeight(3)
    p.stroke(120, 25, 170)
    noLoop()
  }

  p.draw = () => {
    p.background(0)
    koch.recurse();
    koch.draw()
  }

}

new p5(sketch)
