class GLObject {
    constructor(program,
        attribPositionLocation,
        uniformMatrixLocation,
        uniformColorLocation,
        geometry
    ) {
        this.program = program
        this.attribPositionLocation = attribPositionLocation
        this.uniformMatrixLocation = uniformMatrixLocation
        this.uniformColorLocation = uniformColorLocation
        this.geometry = geometry
    }
}

export default GLObject