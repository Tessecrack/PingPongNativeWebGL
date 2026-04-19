import GLObject from "./GLObject.js"
import ShaderLoader from "./Shaders/ShaderLoader.js"
import Geometry from "./Geometry.js"

class Runner {
    constructor(gl) {
        this.gl = gl

        this.lastTimeMs = 0


        this.platform = undefined
        this.ball = undefined

        this.mousePosition = {
            x: 0,
            y: 0
        }

        this.glObjects = [];
    }

    async run() {
        this.resizeCanvas()


        const shaderLoader = new ShaderLoader()

        const vertexShaderSource = await shaderLoader.loadShader('./Shaders/Sources/vertex-shader.glsl')
        const fragmentShaderSource = await shaderLoader.loadShader('./Shaders/Sources/fragment-shader.glsl')

        console.log(vertexShaderSource)
        console.log(fragmentShaderSource)

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

        const program = this.createProgram(vertexShader, fragmentShader)

        const attribPositionLocation = this.gl.getAttribLocation(program, 'a_position')
        const uniformResolutionLocation = this.gl.getUniformLocation(program, 'u_resolution')
        const uniformTranslationLocation = this.gl.getUniformLocation(program, 'u_translation')

        const uniformColorLocation = this.gl.getUniformLocation(program, 'u_color')
        

        // platform
        const widthPlatform = 250
        const heightPlatform = 60

        const xPlatform = 0
        const yPlatform = this.gl.canvas.height - heightPlatform


        const rectArrayPoints = this.getRectPoints(xPlatform, yPlatform, widthPlatform, heightPlatform)
        const platformGeometry = new Geometry(0, 0, 100, 100, 6, rectArrayPoints)
        const platformColor = [1.0, 0.0, 1.0, 1.0]

        const platformBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, platformBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, platformGeometry.points, this.gl.STATIC_DRAW)

        this.platform = new GLObject(program, 
            attribPositionLocation,
            uniformResolutionLocation,
            uniformTranslationLocation,
            uniformColorLocation,
            platformBuffer,
            platformGeometry,
            platformColor
        )

        this.gl.canvas.onmousemove = (event) => {
            this.updateMousePosition(event)
        }

        /*
        this.ball = new GLObject(program, 
            attribPositionLocation, 
            uniformColorLocation)
        */
        
        this.glObjects.push(this.platform)

        this.loop(0)
    }

    loop(currentTimeMs) {
        const deltaTimeMs = currentTimeMs - this.lastTimeMs
        this.lastTimeMs = currentTimeMs

        this.update(deltaTimeMs)
        this.render()
        requestAnimationFrame(this.loop.bind(this))
    }

    updateMousePosition(event) {
        this.mousePosition.x = event.offsetX
        this.mousePosition.y = event.offsetY
    }

    update(deltaTime) {
        this.updatePlatformPosition(deltaTime)
    }

    updatePlatformPosition(deltaTime) {
        const vx = (this.mousePosition.x - this.platform.geometry.x) / 100
        this.platform.geometry.x += vx * deltaTime
    }

    render() {
        this.resizeCanvas()

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        for (let glObject of this.glObjects) {

            const program = glObject.program

            this.gl.useProgram(program)

            this.gl.enableVertexAttribArray(glObject.attribPositionLocation)

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glObject.buffer)

            this.gl.vertexAttribPointer(glObject.attribPositionLocation, 2, this.gl.FLOAT, false, 0, 0)

            this.gl.uniform2f(glObject.uniformResolutionLocation, this.gl.canvas.width, this.gl.canvas.height)
            this.gl.uniform2f(glObject.uniformTranslationLocation, glObject.geometry.x, glObject.geometry.y)
            this.gl.uniform4fv(glObject.uniformColorLocation, glObject.color)
            
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, glObject.geometry.vertexCount)
        }
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

    resizeCanvas() {
        const displayWidth = this.gl.canvas.clientWidth
        const displayHeight = this.gl.canvas.clientHeight

        if (this.gl.canvas.width !== displayWidth || this.gl.canvas.height !== displayHeight) {
            this.gl.canvas.width = this.gl.canvas.clientWidth
            this.gl.canvas.height = this.gl.canvas.clientHeight
        }
    }
}

export default Runner