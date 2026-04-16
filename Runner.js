import GLObject from "./GLObject.js"
import ShaderLoader from "./Shaders/ShaderLoader.js"
import Geometry from "./Geometry.js"

class Runner {
    constructor(gl) {
        this.gl = gl

        this.platform = undefined
        this.ball = undefined
    }

    async run() {
        const shaderLoader = new ShaderLoader()

        const vertexShaderSource = await shaderLoader.loadShader('./Shaders/Sources/vertex-shader.glsl')
        const fragmentShaderSource = await shaderLoader.loadShader('./Shaders/Sources/fragment-shader.glsl')

        console.log(vertexShaderSource)
        console.log(fragmentShaderSource)

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

        const program = this.createProgram(vertexShader, fragmentShader)

        const attribPositionLocation = this.gl.getAttribLocation(program, 'a_position')
        const uniformMatrixLocation = this.gl.getUniformLocation(program, 'u_matrix')
        const uniformColorLocation = this.gl.getUniformLocation(program, 'u_color')
        
        // platform
        const xPlatform = 0
        const yPlatform = 0
        const widthPlatform = 100
        const heightPlatform = 100

        const rectArrayPoints = this.getRectPoints(xPlatform, yPlatform, widthPlatform, heightPlatform)
        const platformGeometry = new Geometry(0, 0, 100, 100, rectArrayPoints)

        this.platform = new GLObject(program, 
            attribPositionLocation,
            uniformMatrixLocation,
            uniformColorLocation,
            platformGeometry)

        /*
        this.ball = new GLObject(program, 
            attribPositionLocation, 
            uniformMatrixLocation, 
            uniformColorLocation)
        */
        
        this.loop(0)
    }

    loop(tick) {
        this.render(tick)
        //requestAnimationFrame(this.loop.bind(this))
    }

    render(tick) {

        

    }

    drawPlatform() {
        this.gl.useProgram(this.platform)

        this.gl.enableVertexAttribArray(this.platform.attribPositionLocation)

        
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram()

        this.gl.attachShader(program, vertexShader)
        this.gl.attachShader(program, fragmentShader)

        this.gl.linkProgram(program)

        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)
        if (success) {
            return program
        }

        console.error(this.gl.getProgramInfoLog(program))
        this.gl.deleteShader(program)
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type)

        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)
        if (success) {
            return shader
        }

        console.error(this.gl.getShaderInfoLog(shader))
        this.gl.deleteShader(shader)
    }

    getRectPoints(x, y, width, height) {
        const x1 = x
        const y1 = y

        const x2 = x1 + width
        const y2 = y1 + height

        return new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,

            x1, y2,
            x2, y1,
            x2, y2

        ])
    }

    getCirclePoints(geometry) {

    }
}

export default Runner