import GLObject from "./GLObject.js"
import ShaderLoader from "./Shaders/ShaderLoader.js"
import Geometry from "./Geometry.js"

class Runner {
    constructor(gl) {
        this.gl = gl

        this.lastTimeMs = 0

        this.tickTime = 0

        this.platform = undefined
        this.ball = undefined

        this.mousePosition = {
            x: 0,
            y: 0
        }


        this.ballSpeedParams = {
            directionX: 1,
            directionY: 1,
            vx: this.getRandom(0.6, 0.7),
            vy: this.getRandom(0.6, 0.7)
        }

        this.glObjects = [];
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
        const uniformResolutionLocation = this.gl.getUniformLocation(program, 'u_resolution')
        const uniformTranslationLocation = this.gl.getUniformLocation(program, 'u_translation')

        const uniformColorLocation = this.gl.getUniformLocation(program, 'u_color')

        this.resizeCanvas()

        // platform
        const widthPlatform = 300
        const heightPlatform = 60

        const xPlatform = 0
        const yPlatform = this.gl.canvas.height - heightPlatform


        const rectArrayPoints = this.getRectPoints(xPlatform, yPlatform, widthPlatform, heightPlatform)
        const platformGeometry = new Geometry(xPlatform, 0, widthPlatform, heightPlatform, 6, rectArrayPoints)
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

        // ball
        const radius = 50

        const xBall = 0
        const yBall = 0

        const vertexCount = 18
        const circleArrayPoints = this.getCirclePoints(xBall, yBall, radius, vertexCount)
        const ballGeometry = new Geometry(xBall, yBall, radius, radius, vertexCount * 6, circleArrayPoints)
        const ballColor = [1.0, 1.0, 0.0, 1.0]
        const ballBuffer = this.gl.createBuffer()

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, ballBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, ballGeometry.points, this.gl.STATIC_DRAW)


        this.ball = new GLObject(program,
            attribPositionLocation,
            uniformResolutionLocation,
            uniformTranslationLocation,
            uniformColorLocation,
            ballBuffer,
            ballGeometry,
            ballColor
        )

        this.glObjects.push(this.platform)
        this.glObjects.push(this.ball)

        this.loop(0)
    }

    loop(currentTimeMs) {
        this.resizeCanvas()

        const deltaTimeMs = currentTimeMs - this.lastTimeMs
        this.lastTimeMs = currentTimeMs

        let tmp = Math.floor(currentTimeMs / 1000)
        if (tmp > 0 && tmp != this.tickTime && tmp % 10 == 0) {

            this.ballSpeedParams.vx += this.ballSpeedParams.vx / 10
            this.ballSpeedParams.vy += this.ballSpeedParams.vy / 10

            this.tickTime = tmp
        }

        this.update(deltaTimeMs)
        this.render()
        requestAnimationFrame(this.loop.bind(this))
    }

    updateMousePosition(event) {
        this.mousePosition.x = event.offsetX
        this.mousePosition.y = event.offsetY
    }

    update(deltaTime) {
        this.updateBallPosition(deltaTime)
        this.updatePlatformPosition(deltaTime)
    }

    updatePlatformPosition(deltaTime) {
        const platformCenter = this.platform.geometry.x + this.platform.geometry.width / 2
        const vx = (this.mousePosition.x - platformCenter) / 70
        this.platform.geometry.x += vx * deltaTime
        //this.platform.geometry.y = this.gl.canvas.height - this.platform.geometry.height
    }

    updateBallPosition(deltaTime) {
        if (this.ball.geometry.y - this.ball.geometry.height >= this.gl.canvas.height) {
            this.ball.geometry.x = this.getRandom(200, this.gl.canvas.width - 200)
            this.ball.geometry.y = this.ball.geometry.height

            this.ballSpeedParams.vx = this.getRandom(
                this.ballSpeedParams.vx - this.ballSpeedParams.vx / 10, 
                this.ballSpeedParams.vx + this.ballSpeedParams.vx / 10)

            this.ballSpeedParams.vy = this.getRandom(
                this.ballSpeedParams.vy - this.ballSpeedParams.vy / 10, 
                this.ballSpeedParams.vy + this.ballSpeedParams.vy / 10)

            this.ballSpeedParams.directionX = this.getRandom(1, 5) === 2 ? -1 : 1
        }

        if (this.ball.geometry.x + this.ball.geometry.width >= this.gl.canvas.width) {
            this.ballSpeedParams.directionX = -1
        } else if (this.ball.geometry.x - this.ball.geometry.width <= 0) {
            this.ballSpeedParams.directionX = 1
        }

        if (this.ball.geometry.y - this.ball.geometry.height <= 0) {
            this.ballSpeedParams.directionY = 1
        }

        if ((this.ball.geometry.x >= this.platform.geometry.x 
            || this.ball.geometry.x + this.ball.geometry.width >= this.platform.geometry.x)
            && (this.ball.geometry.x + this.ball.geometry.width <= this.platform.geometry.x + this.platform.geometry.width
            || this.ball.geometry.x - this.ball.geometry.width <= this.platform.geometry.x + this.platform.geometry.width)
            && this.ball.geometry.y + this.ball.geometry.height >= this.gl.canvas.height - this.platform.geometry.height
            && this.ball.geometry.y - this.ball.geometry.height < this.gl.canvas.height
    ) {

                this.ballSpeedParams.directionY = -1
        }


        this.ball.geometry.x = this.ball.geometry.x + this.ballSpeedParams.vx * this.ballSpeedParams.directionX * deltaTime
        this.ball.geometry.y = this.ball.geometry.y + this.ballSpeedParams.vy * this.ballSpeedParams.directionY * deltaTime
    }

    render() {
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

    // x, y - is center coords
    // width == height - is radius
    getCirclePoints(x, y, radius, vertexCount) {
        const vertices = new Float32Array(vertexCount * 3 * 2);
        const stepAngle = (Math.PI * 2) / vertexCount;

        for (let i = 0; i < vertexCount; i++) {
            const angle1 = i * stepAngle;
            const angle2 = (i + 1) * stepAngle;
            const offset = i * 6;

            vertices[offset] = x;
            vertices[offset + 1] = y;

            vertices[offset + 2] = x + Math.cos(angle1) * radius;
            vertices[offset + 3] = y + Math.sin(angle1) * radius;

            vertices[offset + 4] = x + Math.cos(angle2) * radius;
            vertices[offset + 5] = y + Math.sin(angle2) * radius;
        }

        return vertices;
    }

    resizeCanvas() {
        const displayWidth = this.gl.canvas.clientWidth
        const displayHeight = this.gl.canvas.clientHeight

        if (this.gl.canvas.width !== displayWidth || this.gl.canvas.height !== displayHeight) {
            this.gl.canvas.width = this.gl.canvas.clientWidth
            this.gl.canvas.height = this.gl.canvas.clientHeight
        }
    }

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export default Runner