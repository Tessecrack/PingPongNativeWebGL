class GLObject {
    constructor(program,
        attribPositionLocation,
        uniformResolutionLocation,
        uniformTranslationLocation,
        uniformColorLocation,
        buffer,
        geometry,
        color
    ) {
        this.program = program
        this.attribPositionLocation = attribPositionLocation
        this.uniformResolutionLocation = uniformResolutionLocation
        this.uniformTranslationLocation = uniformTranslationLocation
        this.uniformColorLocation = uniformColorLocation
        this.buffer = buffer
        this.geometry = geometry
        this.color = color
    }
}

export default GLObject