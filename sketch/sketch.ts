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

  constructor(rows?: number, cols?: number, val?: () => number){
    if (rows == undefined || cols == undefined) {
      return
    }

    this.data = Array(rows)
    val = val || (() => 0)
    for (let r = 0; r< rows; r++){
      this.data[r] = Array(cols).fill(0).map(val)
    }
  }


  at(row: number, col: number): number {
    return this.data[row][col]
  }

  set(r: number, c: number, val: number): Matrix {
    this.data[r][c] = val
    return this
  }

  map(fn: (d: number, r: number, c: number ) => number ): Matrix{
    const {rows, cols, data} = this

    let m = new Matrix(rows, cols)

    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        m.data[r][c] = fn(data[r][c], r, c )
      }
    }
    return m

  }

  add(o: Matrix): Matrix {
    return this.map((d: number, r: number, c: number) => d + o.data[r][c])
  }

  scale(x: number): Matrix {
    return this.map((d: number) => d  * x)
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
    console.log(`${this.rows} x ${this.cols}`)
    console.table(this.data)
  }

}

class NeuralNet {

  p :p5

  weights: Matrix[]
  bias: Matrix[]

  constructor(p: p5, ...layers: number[]){
    this.p = p
    this.weights = []
    this.bias = []

    //const rand = () => Math.random() * 2 -1

    let idx = 0
    const rand = () => ++idx

    console.log("Creating a NN: ", ...layers)
    for (let i =0; i < layers.length-1; i++){
      const nodes = layers[i]
      const nextLayer = layers[i+1]

      console.log(`create weight matrix for layer [${i}]: ${nodes} x ${nextLayer}`);
      // s -> D : we want D rows and s columns so that we can multiply Input [s * 1]
      const weights = new Matrix(nextLayer, nodes, rand )
      weights.dump()
      idx=0

      const bias = new Matrix(nextLayer, 1, () => 0)
      bias.dump()

      this.weights.push(weights)
      this.bias.push(bias)
    }
  }

  feedForward(inputs: number[]) {
    const {weights} = this
    const sigmoid = (x: number) => 1/(1+ Math.exp(x))

    let input = Matrix.from([...inputs.map(x => [x])])

    console.log("Feed forward ----------------------------------")
    console.log("I:")
    input.dump()

    for (let i = 0; i < weights.length; i++){
      const w = this.weights[i]
      const b = this.bias[i]
      console.log(" >>>>>>>>>>>>>>>>>>>>>>>>>>>  ")
      w.dump()

      const prod = w.mult(input)
      input = prod.add(b)
      input.map(sigmoid)

      console.log(" vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ")
      input.dump()
      console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ")
    }

    return input.at(0, 0)

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


  const testNN = () => {
    const nn =  new NeuralNet(p, 2, 2, 1)
    // o---o
    //  \ / \
    //   X   ,`o
    //  / \ /
    // o---o
    const output = nn.feedForward([0, 1])
    console.log("............ output: ", output)
  }

  const testAdd = () => {
    const m = new Matrix(2, 2, () => 10)
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
    testNN()
  }

}

new p5(sketch)
