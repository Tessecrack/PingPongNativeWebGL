import ShaderLoader from "./Shaders/ShaderLoader.js"

class Runner {
    constructor(gl) {
        this.gl = gl
    }

    async run() {
        const shaderLoader = new ShaderLoader()

        const vertexShaderSource = await shaderLoader.loadShader('./Shaders/Sources/vertex-shader.glsl')
        const fragmentShaderSource = await shaderLoader.loadShader('./Shaders/Sources/fragment-shader.glsl')

        console.log(vertexShaderSource)
        console.log(fragmentShaderSource)
    }

    render() {

    }
}

export default Runner