precision highp float;
precision highp sampler3D;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 vOrigin;
in vec3 vDirection;

out vec4 color;

uniform sampler3D map;

uniform float threshold;
uniform float steps;

vec2 hitBox(vec3 orig, vec3 dir) {
    const vec3 box_min = vec3(-0.5);
    const vec3 box_max = vec3(0.5);
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = (box_min - orig) * inv_dir;
    vec3 tmax_tmp = (box_max - orig) * inv_dir;
    vec3 tmin = min(tmin_tmp, tmax_tmp);
    vec3 tmax = max(tmin_tmp, tmax_tmp);
    float t0 = max(tmin.x, max(tmin.y, tmin.z));
    float t1 = min(tmax.x, min(tmax.y, tmax.z));
    return vec2(t0, t1);
}

float sample1(vec3 p) {
    return texture(map, p).r;
}

vec4 sample2(vec3 p) {
    return texture(map, p);
}

        #define epsilon .0001

vec3 normal(vec3 coord) {
    if(coord.x < epsilon)
        return vec3(1.0, 0.0, 0.0);
    if(coord.y < epsilon)
        return vec3(0.0, 1.0, 0.0);
    if(coord.z < epsilon)
        return vec3(0.0, 0.0, 1.0);
    if(coord.x > 1.0 - epsilon)
        return vec3(-1.0, 0.0, 0.0);
    if(coord.y > 1.0 - epsilon)
        return vec3(0.0, -1.0, 0.0);
    if(coord.z > 1.0 - epsilon)
        return vec3(0.0, 0.0, -1.0);

    float step = 0.01;
    float x = sample1(coord + vec3(-step, 0.0, 0.0)) - sample1(coord + vec3(step, 0.0, 0.0));
    float y = sample1(coord + vec3(0.0, -step, 0.0)) - sample1(coord + vec3(0.0, step, 0.0));
    float z = sample1(coord + vec3(0.0, 0.0, -step)) - sample1(coord + vec3(0.0, 0.0, step));

    return normalize(vec3(x, y, z));
}

vec4 BlendUnder(vec4 color, vec4 newColor) {
    color.rgb += (1.0 - color.a) * newColor.a * newColor.rgb;
    color.a += (1.0 - color.a) * newColor.a;
    return color;
}

void main() {

    vec3 rayDir = normalize(vDirection);
    vec2 bounds = hitBox(vOrigin, rayDir);

    if(bounds.x > bounds.y)
        discard;

    bounds.x = max(bounds.x, 0.0);

    vec3 p = vOrigin + bounds.x * rayDir;
    vec3 inc = 1.0 / abs(rayDir);
    float delta = min(inc.x, min(inc.y, inc.z));
    delta /= steps;

    for(float t = bounds.x; t < bounds.y; t += delta) {

        vec4 samplerColor = sample2(p + 0.5);
        samplerColor.a *= .02;
                //samplerColor.a *= .4;
        color = BlendUnder(color, samplerColor);

        p += rayDir * delta;

    }

    if(color.a == 0.0)
        discard;
    color.r /= color.a;
    color.g /= color.a;
    color.b /= color.a;
    color.a = 1.0;
}