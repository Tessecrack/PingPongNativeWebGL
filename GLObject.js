class GLObject {
    constructor(program,
        attribPositionLocation,
        uniformMatrixLocation,
        uniformColorLocation,
        geometry
    ) {
        this.program = program
        this.attribPositionLocation = attribPositionLocation
        this.uniformColorLocation = uniformColorLocation
        this.geometry = geometry
    }
}

export default GLObject