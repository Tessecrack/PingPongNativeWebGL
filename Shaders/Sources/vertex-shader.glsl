attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;

void main() {
    vec2 translatedPosition = a_position + u_translation;
    vec2 newPosition = translatedPosition / u_resolution * 2.0 - 1.0;
    gl_Position = vec4(newPosition * vec2(1, -1), 0, 1);
}