// https://discourse.threejs.org/t/who-can-tell-me-how-to-render-data3dtexture-rgb-in-three-js/63941

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

let renderer, scene, camera;
let mesh, data, texture;
let size = 220;
const corners = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0.5, 1, 0.5), // top
    new THREE.Vector3(0.5, 0, 1)
];

let nextPoint = corners[0].clone();



async function fetchData(path) {
    try {
        const response = await fetch(path);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// We don't use this yet, we could move to it later.
let vertexShaderSource = await fetchData('vertex.glsl');
let fragmentShaderSource = await fetchData('fragment.glsl');

//console.log(vertexShaderSource);

init();
//animate();

function init() {

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(1, 1, 2);

    new OrbitControls(camera, renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
    // Texture



    let i = 0;
    //			const data = new Float32Array( 4*size * size * size );
    data = new Uint8Array(size * size * size);
    let inverseResolution = 1.0 / (size - 1.0);

    initGrid(false);


    texture = new THREE.Data3DTexture(data, size, size, size);
    //texture.format = THREE.RGBAFormat;
    texture.format = THREE.RedFormat;
    // texture.type = THREE.FloatType;
    texture.type = THREE.UnsignedByteType;

    //texture.minFilter = THREE.LinearFilter;
    //texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 4;
    texture.needsUpdate = true;

    // Material

    const vertexShader = /* glsl */`
        in vec3 position;

        uniform mat4 modelMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec3 cameraPos;

        out vec3 vOrigin;
        out vec3 vDirection;

        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

            vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
            vDirection = position - vOrigin;

            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = /* glsl */`
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

        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        // Returns a start and end point of intersection of a ray and a box.
        vec2 hitBox( vec3 orig, vec3 dir ) {
            const vec3 box_min = vec3( - 0.5 );
            const vec3 box_max = vec3( 0.5 );
            vec3 inv_dir = 1.0 / dir;
            // These do all three axes at once.
            vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
            vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
            // Swap to make max and min work.
            vec3 tmin = min( tmin_tmp, tmax_tmp );
            vec3 tmax = max( tmin_tmp, tmax_tmp );
            // now do the largest and smallest separately.
            float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
            float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
            return vec2( t0, t1 );
        }

        float sample1( vec3 p ) {
            return texture( map, p ).r;
        }

        
        vec4 sample2( vec3 p ) {
            return texture( map, p );
        }

        #define epsilon .0001

        vec3 normal( vec3 coord ) {
            if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
            if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
            if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
            if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
            if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
            if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );

            float step = 0.01;
            float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
            float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
            float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );

            return normalize( vec3( x, y, z ) );
        }

        vec4 BlendUnder(vec4 color, vec4 newColor)
        {
            color.rgb += (1.0 - color.a) * newColor.a * newColor.rgb;
            color.a += (1.0 - color.a) * newColor.a;
            return color;
        }


        void main(){

            vec3 rayDir = normalize( vDirection );
            vec2 bounds = hitBox( vOrigin, rayDir );

            if ( bounds.x > bounds.y ) discard;

            bounds.x = max( bounds.x, 0.0 );

            vec3 p = vOrigin + bounds.x * rayDir;
            vec3 inc = 1.0 / abs( rayDir );
            float delta = min( inc.x, min( inc.y, inc.z ) );
            delta /= steps;

            float cval = 0.0;
            float cval_step = 1.0/steps;
            for ( float t = bounds.x; t < bounds.y; t += delta, cval += cval_step ) {

                vec4 samplerColor = sample2( p + 0.5 );
                //samplerColor.a *= .02;
                //samplerColor.a *= .4;
                if ( samplerColor.r > 0.01 ) {
                    color = vec4(hsv2rgb(vec3(cval,1,1) ),1.0);
                    break;
                }
                //color = BlendUnder(color, samplerColor);

                p += rayDir * delta;
                color.b = 1.0;

            }
            

            if ( color.a == 0.0 ) discard;
        }
    `;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            map: { value: texture },
            cameraPos: { value: new THREE.Vector3() },
            threshold: { value: 0. },
            steps: { value: 1200 }
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    //

    const parameters = { threshold: 0., steps: 100, dotGrid: false };

    function update() {

        material.uniforms.threshold.value = parameters.threshold;
        material.uniforms.steps.value = parameters.steps;

    }

    const gui = new GUI();
    gui.add(parameters, 'steps', 0, 1500, 1).onChange(update);
    gui.add(parameters, 'dotGrid').onChange(function() {initGrid(parameters.dotGrid); texture.needsUpdate = true;});

    window.addEventListener('resize', onWindowResize);

}

function initGrid(grid) {
    for (let z = 0; z < size; z++) {
        let zOffset = z * size * size;
        for (let y = 0; y < size; y++) {
            let yOffset = y * size;
            for (let x = 0; x < size; x++) {
                const index = x + yOffset + zOffset;
                data[index] = (((x | y | z) & 15) == 0) ? (grid?255:0) : 0;
                //data[index] = ( ((x | y | z) & 1) == 0) ? 255 : 0;
                //data[index] = ( (x * y * z) % 2 == 0) ? 0 : 255;
                //data[index] = 0;
                //						data[4*index] = x * inverseResolution;
                //						data[4*index+1] = y * inverseResolution;
                //						data[4*index+2] = z * inverseResolution;    
                //						data[4*index+3] = 1;    
                //						data[index] = 1;    
            }
        }
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function getPositionFromMatrix(matrix) {
    return new THREE.Vector3(matrix.elements[12], matrix.elements[13], matrix.elements[14]);
  }

renderer.setAnimationLoop(function () {
    // function animate() {

    //     requestAnimationFrame(animate);
    // mesh.material.uniforms.cameraPos.value.copy(camera.position);

    // if (renderer.xr.isPresenting) {
    //     console.log('in anim loop. xr.isPresenting=' + renderer.xr.isPresenting);
    // }

    mesh.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
        // if (true){//renderer.xr.isPresenting) {
        //     //console.log('in onBeforeRender');
        //     // get the camera's position from it's .matrix property.

        //     //console.log(camera.position);
        //     console.log();
        // }
        // We pull the eye position from the camera matrix because the camera position is not updated.
        mesh.material.uniforms.cameraPos.value.copy(getPositionFromMatrix(camera.matrix));
        mesh.material.uniformsNeedUpdate = true;
    }

    renderer.render(scene, camera);

    for (let i = 0; i < 50; i++) {
        nextPoint.lerp(corners[Math.floor(Math.random() * 4)], 0.5);
        let scaledPoint = nextPoint.clone().multiplyScalar(size - 1).floor();

        data[scaledPoint.x + size * scaledPoint.y + size * size * scaledPoint.z] = 255;
    }
    texture.needsUpdate = true;

    //}
});
