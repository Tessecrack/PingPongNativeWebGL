class ShaderLoader {
    constructor() {

    }

    async loadShader(path) {
        const response = await fetch(path, { 'cache' : 'no-store' })
        if (response.ok) {
            return await response.text()
        }

        throw new Error(`Cannot upload shader source by path ${path}`)
    }
}

export default ShaderLoader