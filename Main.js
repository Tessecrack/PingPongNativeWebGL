import Runner from './Runner.js'

function main() {
    const canvas = document.getElementById('canvas')
    const gl = canvas.getContext('webgl')

    const runner = new Runner(gl)
    runner.run()
}

main()