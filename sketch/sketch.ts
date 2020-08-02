class Matrix {
  //p: p5

  data: number[][]

  static from(data: number[][]): Matrix {
    let m = new Matrix()
    m.data = data
    return m

  }
  get rows(): number {
    return this.data.length
  }

  get cols(): number {
    return this.data[0].length
  }

  constructor(rows?: number, cols?: number, val?: number){
    if (rows == undefined || cols == undefined) {
      return
    }

    this.data = Array(rows)
    for (let r = 0; r< rows; r++){
      this.data[r] = Array(cols).fill(val || 0)
    }
  }


  at(row: number, col: number): number {
    return this.data[row][col]
  }

  set(r: number, c: number, val: number): Matrix {
    this.data[r][c] = val
    return this
  }

  map(fn: (r: number, c: number, d?: number) => number ){
    const {rows, cols, data} = this

    let m = new Matrix(rows, cols)

    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        m.data[r][c] = fn(r, c, data[r][c])
      }
    }
    return m

  }

  add(o: Matrix): Matrix {
    return this.map((r: number, c: number, d: number) => d + o.data[r][c])
  }

  scale(x: number): Matrix {
    return this.map((r: number, c: number, d: number) => d  * x)
  }

  mult(o: Matrix): Matrix {
    const {rows, cols, data} = this
    const rows2 = o.rows
    const cols2 = o.cols

    let m = new Matrix(rows, cols)

    const result = Array(rows)
    for (let r = 0; r < rows; r++){
      result[r] = Array(cols2)
      for (let c = 0; c < cols2; c++){
        result[r][c] = 0
        for (let x = 0; x < rows2; x++) {
          result[r][c] += data[r][x] * o.data[x][c]
        }
      }
    }

    return Matrix.from(result)
  }


  dump(){
    console.table(this.data)
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

  const testAdd = () => {
    const m = new Matrix(2, 2, 10)
    m.dump()
    m.set(1,1, 42)
    m.dump()

    const m1 = [
      [1, 2, 3],
      [4, 5, 6],
    ]

    const m2 = [
      [10, 11, 11],
      [11, 12, 13],
    ]

    const mA = Matrix.from(m1)
    mA.dump()

    const mB = Matrix.from(m2)
    mB.dump()

    const mC = mA.add(mB)
    mA.dump()
    mB.dump()
    mC.dump()
  }

  const testScale = () => {
    const d = [
      [10, 11, 11],
      [11, 12, 13],
    ]

    const m = Matrix.from(d)
    m.scale(2).dump()

  }

  const testMult = () => {
    const d = Matrix.from([
      [1, 2],
      [3, 4],
      [5, 6],
    ])

    const i = Matrix.from([
      [1, 0, 1],
      [0, 1, 2],
    ])

    const m = d.mult(i)
    m.dump()

  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(0)
    testMult()
  }

}

new p5(sketch)
