// Elementor compatibility
if (typeof elementorFrontend !== 'undefined') {
    elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope) {
        // Initialize fluid animation for Elementor elements
        var canvas = document.querySelector('.blocksy-fluid-canvas');
        if (canvas && typeof fluid_init === 'function') {
            fluid_init();
        }
    });
}

// Check for Elementor canvas template
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('elementor-template-canvas')) {
        var canvas = document.querySelector('.blocksy-fluid-canvas');
        if (canvas) {
            canvas.style.position = 'fixed';
            canvas.style.zIndex = '0';
        }
    }
});


'use strict';

if (window.ajax_flag) {
        fluid_init();
} else {
        window.onload = function () {
                fluid_init();
        }
}

function fluid_init() {
        // Simulation section

        const canvas = document.getElementsByTagName('canvas')[0];
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let fluid_bg = canvas.getAttribute('data-fluid-bg') && canvas.getAttribute('data-fluid-bg')!="transparent" ? canvas.getAttribute('data-fluid-bg') : "#02030F",
                sim_resol = canvas.getAttribute('data-sim-resol') ? canvas.getAttribute('data-sim-resol') : 128,
                quality = canvas.getAttribute('data-quality') ? canvas.getAttribute('data-quality') : 512,
                density_disp = canvas.getAttribute('data-density') ? canvas.getAttribute('data-density') : 0.97,
                curv_vorticity = canvas.getAttribute('data-vorticity') ? canvas.getAttribute('data-vorticity') : 30,
                splat_radius = canvas.getAttribute('data-splat-radius') ? canvas.getAttribute('data-splat-radius') : 0.5,
                backgroundColor = hexToRGB(fluid_bg),
                transparent = canvas.getAttribute('data-transparent') ? JSON.parse(canvas.getAttribute('data-transparent')) : false;
        let config = {
                SIM_RESOLUTION: sim_resol,
                DYE_RESOLUTION: quality,
                DENSITY_DISSIPATION: density_disp,
                VELOCITY_DISSIPATION: 0.98,
                PRESSURE_DISSIPATION: 0.8,
                PRESSURE_ITERATIONS: 20,
                COLOR_UPDATE_SPEED: 10,
                CURL: curv_vorticity,
                SPLAT_RADIUS: splat_radius,
                SHADING: false,
                PAUSED: false,
                BACK_COLOR: {
                        r: backgroundColor.r,
                        g: backgroundColor.g,
                        b: backgroundColor.b
                },
                TRANSPARENT: transparent,
                BLOOM: true,
                BLOOM_ITERATIONS: 8,
                BLOOM_RESOLUTION: 256,
                BLOOM_INTENSITY: 0.8,
                BLOOM_THRESHOLD: 0.6,
                BLOOM_SOFT_KNEE: 0.7
        }

        function hexToRGB(h) {
                let r = 0,
                        g = 0,
                        b = 0;

                // 3 digits
                if (h.length == 4) {
                        r = "0x" + h[1] + h[1];
                        g = "0x" + h[2] + h[2];
                        b = "0x" + h[3] + h[3];

                        // 6 digits
                } else if (h.length == 7) {
                        r = "0x" + h[1] + h[2];
                        g = "0x" + h[3] + h[4];
                        b = "0x" + h[5] + h[6];
                }

                return {
                        r,
                        g,
                        b
                };
        }

        function pointerPrototype() {
                this.id = -1;
                this.x = 0;
                this.y = 0;
                this.dx = 0;
                this.dy = 0;
                this.down = false;
                this.moved = false;
                this.color = [30, 0, 300];
        }

        let pointers = [];
        let splatStack = [];
        let bloomFramebuffers = [];
        pointers.push(new pointerPrototype());

        const {
                gl,
                ext
        } = getWebGLContext(canvas);

        if (isMobile())
                config.SHADING = false;
        if (!ext.supportLinearFiltering) {
                config.SHADING = false;
                config.BLOOM = false;
        }

        function getWebGLContext(canvas) {
                const params = {
                        alpha: true,
                        depth: false,
                        stencil: false,
                        antialias: false,
                        preserveDrawingBuffer: false
                };

                let gl = canvas.getContext('webgl2', params);
                const isWebGL2 = !!gl;
                if (!isWebGL2)
                        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

                let halfFloat;
                let supportLinearFiltering;
                if (isWebGL2) {
                        gl.getExtension('EXT_color_buffer_float');
                        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
                } else {
                        halfFloat = gl.getExtension('OES_texture_half_float');
                        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
                }

                gl.clearColor(0.0, 0.0, 0.0, 1.0);

                const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
                let formatRGBA;
                let formatRG;
                let formatR;

                if (isWebGL2) {
                        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
                        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
                        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
                } else {
                        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                }


                return {
                        gl,
                        ext: {
                                formatRGBA,
                                formatRG,
                                formatR,
                                halfFloatTexType,
                                supportLinearFiltering
                        }
                };
        }

        function getSupportedFormat(gl, internalFormat, format, type) {
                if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
                        switch (internalFormat) {
                                case gl.R16F:
                                        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                                case gl.RG16F:
                                        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                                default:
                                        return null;
                        }
                }

                return {
                        internalFormat,
                        format
                }
        }

        function supportRenderTextureFormat(gl, internalFormat, format, type) {
                let texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

                let fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

                const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (status != gl.FRAMEBUFFER_COMPLETE)
                        return false;
                return true;
        }

        function isMobile() {
                return /Mobi|Android/i.test(navigator.userAgent);
        }

        class GLProgram {
                constructor(vertexShader, fragmentShader) {
                        this.uniforms = {};
                        this.program = gl.createProgram();

                        gl.attachShader(this.program, vertexShader);
                        gl.attachShader(this.program, fragmentShader);
                        gl.linkProgram(this.program);

                        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
                                throw gl.getProgramInfoLog(this.program);

                        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
                        for (let i = 0; i < uniformCount; i++) {
                                const uniformName = gl.getActiveUniform(this.program, i).name;
                                this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
                        }
                }

                bind() {
                        gl.useProgram(this.program);
                }
        }

        function compileShader(type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                        throw gl.getShaderInfoLog(shader);

                return shader;
        };

        const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;

        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `);

        const clearShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
    `);

        const colorShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;

        uniform vec4 color;

        void main () {
            gl_FragColor = color;
        }
    `);

        const backgroundShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float aspectRatio;

        #define SCALE 25.0

        void main () {
            vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
            float v = mod(uv.x + uv.y, 2.0);
            v = v * 0.1 + 0.8;
            gl_FragColor = vec4(vec3(v), 1.0);
        }
    `);

        const displayShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            vec3 C = texture2D(uTexture, vUv).rgb;
            float a = max(C.r, max(C.g, C.b));
            gl_FragColor = vec4(C, a);
        }
    `);

        const displayBloomShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform sampler2D uBloom;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;

        void main () {
            vec3 C = texture2D(uTexture, vUv).rgb;
            vec3 bloom = texture2D(uBloom, vUv).rgb;
            vec3 noise = texture2D(uDithering, vUv * ditherScale).rgb;
            noise = noise * 2.0 - 1.0;
            bloom += noise / 800.0;
            bloom = pow(bloom.rgb, vec3(1.0 / 2.2));
            C += bloom;
            float a = max(C.r, max(C.g, C.b));
            gl_FragColor = vec4(C, a);
        }
    `);

        const displayShadingShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform vec2 texelSize;

        void main () {
            vec3 L = texture2D(uTexture, vL).rgb;
            vec3 R = texture2D(uTexture, vR).rgb;
            vec3 T = texture2D(uTexture, vT).rgb;
            vec3 B = texture2D(uTexture, vB).rgb;
            vec3 C = texture2D(uTexture, vUv).rgb;

            float dx = length(R) - length(L);
            float dy = length(T) - length(B);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            C.rgb *= diffuse;

            float a = max(C.r, max(C.g, C.b));
            gl_FragColor = vec4(C, a);
        }
    `);

        const displayBloomShadingShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform sampler2D uBloom;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;
        uniform vec2 texelSize;

        void main () {
            vec3 L = texture2D(uTexture, vL).rgb;
            vec3 R = texture2D(uTexture, vR).rgb;
            vec3 T = texture2D(uTexture, vT).rgb;
            vec3 B = texture2D(uTexture, vB).rgb;
            vec3 C = texture2D(uTexture, vUv).rgb;

            float dx = length(R) - length(L);
            float dy = length(T) - length(B);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            C *= diffuse;

            vec3 bloom = texture2D(uBloom, vUv).rgb;
            vec3 noise = texture2D(uDithering, vUv * ditherScale).rgb;
            noise = noise * 2.0 - 1.0;
            bloom += noise / 800.0;
            bloom = pow(bloom.rgb, vec3(1.0 / 2.2));
            C += bloom;

            float a = max(C.r, max(C.g, C.b));
            gl_FragColor = vec4(C, a);
        }
    `);

        const bloomPrefilterShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec3 curve;
        uniform float threshold;

        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;
            float br = max(c.r, max(c.g, c.b));
            float rq = clamp(br - curve.x, 0.0, curve.y);
            rq = curve.z * rq * rq;
            c *= max(rq, br - threshold) / max(br, 0.0001);
            gl_FragColor = vec4(c, 0.0);
        }
    `);

        const bloomBlurShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;

        void main () {
            vec4 sum = vec4(0.0);
            sum += texture2D(uTexture, vL);
            sum += texture2D(uTexture, vR);
            sum += texture2D(uTexture, vT);
            sum += texture2D(uTexture, vB);
            sum *= 0.25;
            gl_FragColor = sum;
        }
    `);

        const bloomFinalShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform float intensity;

        void main () {
            vec4 sum = vec4(0.0);
            sum += texture2D(uTexture, vL);
            sum += texture2D(uTexture, vR);
            sum += texture2D(uTexture, vT);
            sum += texture2D(uTexture, vB);
            sum *= 0.25;
            gl_FragColor = sum * intensity;
        }
    `);

        const splatShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `);

        const advectionManualFilteringShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;

            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
            gl_FragColor.a = 1.0;
        }
    `);

        const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform float dt;
        uniform float dissipation;

        void main () {
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            gl_FragColor = dissipation * texture2D(uSource, coord);
            gl_FragColor.a = 1.0;
        }
    `);

        const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
    `);

        const curlShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
    `);

        const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 vel = texture2D(uVelocity, vUv).xy;
            gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
        }
    `);

        const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        vec2 boundary (vec2 uv) {
            return uv;
            // uncomment if you use wrap or repeat texture mode
            // uv = min(max(uv, 0.0), 1.0);
            // return uv;
        }

        void main () {
            float L = texture2D(uPressure, boundary(vL)).x;
            float R = texture2D(uPressure, boundary(vR)).x;
            float T = texture2D(uPressure, boundary(vT)).x;
            float B = texture2D(uPressure, boundary(vB)).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
    `);

        const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        vec2 boundary (vec2 uv) {
            return uv;
            // uv = min(max(uv, 0.0), 1.0);
            // return uv;
        }

        void main () {
            float L = texture2D(uPressure, boundary(vL)).x;
            float R = texture2D(uPressure, boundary(vR)).x;
            float T = texture2D(uPressure, boundary(vT)).x;
            float B = texture2D(uPressure, boundary(vB)).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
    `);

        const blit = (() => {
                gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
                gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(0);

                return (destination) => {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
                        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
        })();

        let simWidth;
        let simHeight;
        let dyeWidth;
        let dyeHeight;
        let density;
        let velocity;
        let divergence;
        let curl;
        let pressure;
        let bloom;

        let ditheringTexture = createTextureAsync();

        const clearProgram = new GLProgram(baseVertexShader, clearShader);
        const colorProgram = new GLProgram(baseVertexShader, colorShader);
        const backgroundProgram = new GLProgram(baseVertexShader, backgroundShader);
        const displayProgram = new GLProgram(baseVertexShader, displayShader);
        const displayBloomProgram = new GLProgram(baseVertexShader, displayBloomShader);
        const displayShadingProgram = new GLProgram(baseVertexShader, displayShadingShader);
        const displayBloomShadingProgram = new GLProgram(baseVertexShader, displayBloomShadingShader);
        const bloomPrefilterProgram = new GLProgram(baseVertexShader, bloomPrefilterShader);
        const bloomBlurProgram = new GLProgram(baseVertexShader, bloomBlurShader);
        const bloomFinalProgram = new GLProgram(baseVertexShader, bloomFinalShader);
        const splatProgram = new GLProgram(baseVertexShader, splatShader);
        const advectionProgram = new GLProgram(baseVertexShader, ext.supportLinearFiltering ? advectionShader : advectionManualFilteringShader);
        const divergenceProgram = new GLProgram(baseVertexShader, divergenceShader);
        const curlProgram = new GLProgram(baseVertexShader, curlShader);
        const vorticityProgram = new GLProgram(baseVertexShader, vorticityShader);
        const pressureProgram = new GLProgram(baseVertexShader, pressureShader);
        const gradientSubtractProgram = new GLProgram(baseVertexShader, gradientSubtractShader);

        function initFramebuffers() {
                let simRes = getResolution(config.SIM_RESOLUTION);
                let dyeRes = getResolution(config.DYE_RESOLUTION);

                simWidth = simRes.width;
                simHeight = simRes.height;
                dyeWidth = dyeRes.width;
                dyeHeight = dyeRes.height;

                const texType = ext.halfFloatTexType;
                const rgba = ext.formatRGBA;
                const rg = ext.formatRG;
                const r = ext.formatR;
                const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

                if (density == null)
                        density = createDoubleFBO(dyeWidth, dyeHeight, rgba.internalFormat, rgba.format, texType, filtering);
                else
                        density = resizeDoubleFBO(density, dyeWidth, dyeHeight, rgba.internalFormat, rgba.format, texType, filtering);

                if (velocity == null)
                        velocity = createDoubleFBO(simWidth, simHeight, rg.internalFormat, rg.format, texType, filtering);
                else
                        velocity = resizeDoubleFBO(velocity, simWidth, simHeight, rg.internalFormat, rg.format, texType, filtering);

                divergence = createFBO(simWidth, simHeight, r.internalFormat, r.format, texType, gl.NEAREST);
                curl = createFBO(simWidth, simHeight, r.internalFormat, r.format, texType, gl.NEAREST);
                pressure = createDoubleFBO(simWidth, simHeight, r.internalFormat, r.format, texType, gl.NEAREST);

                initBloomFramebuffers();
        }

        function initBloomFramebuffers() {
                let res = getResolution(config.BLOOM_RESOLUTION);

                const texType = ext.halfFloatTexType;
                const rgba = ext.formatRGBA;
                const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

                bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);

                bloomFramebuffers.length = 0;
                for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
                        let width = res.width >> (i + 1);
                        let height = res.height >> (i + 1);

                        if (width < 2 || height < 2) break;

                        let fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
                        bloomFramebuffers.push(fbo);
                }
        }

        function createFBO(w, h, internalFormat, format, type, param) {
                gl.activeTexture(gl.TEXTURE0);
                let texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

                let fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.viewport(0, 0, w, h);
                gl.clear(gl.COLOR_BUFFER_BIT);

                return {
                        texture,
                        fbo,
                        width: w,
                        height: h,
                        attach(id) {
                                gl.activeTexture(gl.TEXTURE0 + id);
                                gl.bindTexture(gl.TEXTURE_2D, texture);
                                return id;
                        }
                };
        }

        function createDoubleFBO(w, h, internalFormat, format, type, param) {
                let fbo1 = createFBO(w, h, internalFormat, format, type, param);
                let fbo2 = createFBO(w, h, internalFormat, format, type, param);

                return {
                        get read() {
                                return fbo1;
                        },
                        set read(value) {
                                fbo1 = value;
                        },
                        get write() {
                                return fbo2;
                        },
                        set write(value) {
                                fbo2 = value;
                        },
                        swap() {
                                let temp = fbo1;
                                fbo1 = fbo2;
                                fbo2 = temp;
                        }
                }
        }

        function resizeFBO(target, w, h, internalFormat, format, type, param) {
                let newFBO = createFBO(w, h, internalFormat, format, type, param);
                clearProgram.bind();
                gl.uniform1i(clearProgram.uniforms.uTexture, target.attach(0));
                gl.uniform1f(clearProgram.uniforms.value, 1);
                blit(newFBO.fbo);
                return newFBO;
        }

        function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
                target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
                target.write = createFBO(w, h, internalFormat, format, type, param);
                return target;
        }

        function createTextureAsync() {
                let texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

                let obj = {
                        texture,
                        width: 1,
                        height: 1,
                        attach(id) {
                                gl.activeTexture(gl.TEXTURE0 + id);
                                gl.bindTexture(gl.TEXTURE_2D, texture);
                                return id;
                        }
                };

                return obj;
        }

        initFramebuffers();
        multipleSplats(parseInt(Math.random() * 20) + 5);
        update();

        function update() {
                resizeCanvas();
                input();
                if (!config.PAUSED)
                        step(0.016);
                render(null);
                requestAnimationFrame(update);
        }

        function input() {
                if (splatStack.length > 0)
                        multipleSplats(splatStack.pop());

                for (let i = 0; i < pointers.length; i++) {
                        const p = pointers[i];
                        if (p.moved) {
                                splat(p.x, p.y, p.dx, p.dy, p.color);
                                p.moved = false;
                        }
                }

                return;
        }

        function step(dt) {
                gl.disable(gl.BLEND);
                gl.viewport(0, 0, simWidth, simHeight);

                curlProgram.bind();
                gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(curl.fbo);

                vorticityProgram.bind();
                gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
                gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
                gl.uniform1f(vorticityProgram.uniforms.dt, dt);
                blit(velocity.write.fbo);
                velocity.swap();

                divergenceProgram.bind();
                gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(divergence.fbo);

                clearProgram.bind();
                gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
                gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE_DISSIPATION);
                blit(pressure.write.fbo);
                pressure.swap();

                pressureProgram.bind();
                gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
                for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                        blit(pressure.write.fbo);
                        pressure.swap();
                }

                gradientSubtractProgram.bind();
                gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
                gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
                blit(velocity.write.fbo);
                velocity.swap();

                advectionProgram.bind();
                gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight);
                if (!ext.supportLinearFiltering)
                        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1.0 / simWidth, 1.0 / simHeight);
                let velocityId = velocity.read.attach(0);
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
                gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
                gl.uniform1f(advectionProgram.uniforms.dt, dt);
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
                blit(velocity.write.fbo);
                velocity.swap();

                gl.viewport(0, 0, dyeWidth, dyeHeight);

                if (!ext.supportLinearFiltering)
                        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1.0 / dyeWidth, 1.0 / dyeHeight);
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
                blit(density.write.fbo);
                density.swap();
        }

        function render(target) {
                if (config.BLOOM)
                        applyBloom(density.read, bloom);

                if (target == null || !config.TRANSPARENT) {
                        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                        gl.enable(gl.BLEND);
                } else {
                        gl.disable(gl.BLEND);
                }

                let width = target == null ? gl.drawingBufferWidth : dyeWidth;
                let height = target == null ? gl.drawingBufferHeight : dyeHeight;

                gl.viewport(0, 0, width, height);

                if (!config.TRANSPARENT) {
                        colorProgram.bind();
                        let bc = config.BACK_COLOR;
                        gl.uniform4f(colorProgram.uniforms.color, bc.r / 255, bc.g / 255, bc.b / 255, 1);
                        blit(target);
                }

                if (target == null && config.TRANSPARENT) {
                        backgroundProgram.bind();
                        gl.uniform1f(backgroundProgram.uniforms.aspectRatio, canvas.width / canvas.height);
                        blit(null);
                }

                if (config.SHADING) {
                        let program = config.BLOOM ? displayBloomShadingProgram : displayShadingProgram;
                        program.bind();
                        gl.uniform2f(program.uniforms.texelSize, 1.0 / width, 1.0 / height);
                        gl.uniform1i(program.uniforms.uTexture, density.read.attach(0));
                        if (config.BLOOM) {
                                gl.uniform1i(program.uniforms.uBloom, bloom.attach(1));
                                gl.uniform1i(program.uniforms.uDithering, ditheringTexture.attach(2));
                                let scale = getTextureScale(ditheringTexture, width, height);
                                gl.uniform2f(program.uniforms.ditherScale, scale.x, scale.y);
                        }
                } else {
                        let program = config.BLOOM ? displayBloomProgram : displayProgram;
                        program.bind();
                        gl.uniform1i(program.uniforms.uTexture, density.read.attach(0));
                        if (config.BLOOM) {
                                gl.uniform1i(program.uniforms.uBloom, bloom.attach(1));
                                gl.uniform1i(program.uniforms.uDithering, ditheringTexture.attach(2));
                                let scale = getTextureScale(ditheringTexture, width, height);
                                gl.uniform2f(program.uniforms.ditherScale, scale.x, scale.y);
                        }
                }

                blit(target);
        }

        function applyBloom(source, destination) {
                if (bloomFramebuffers.length < 2)
                        return;

                let last = destination;

                gl.disable(gl.BLEND);
                bloomPrefilterProgram.bind();
                let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
                let curve0 = config.BLOOM_THRESHOLD - knee;
                let curve1 = knee * 2;
                let curve2 = 0.25 / knee;
                gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
                gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
                gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
                gl.viewport(0, 0, last.width, last.height);
                blit(last.fbo);

                bloomBlurProgram.bind();
                for (let i = 0; i < bloomFramebuffers.length; i++) {
                        let dest = bloomFramebuffers[i];
                        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, 1.0 / last.width, 1.0 / last.height);
                        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
                        gl.viewport(0, 0, dest.width, dest.height);
                        blit(dest.fbo);
                        last = dest;
                }

                gl.blendFunc(gl.ONE, gl.ONE);
                gl.enable(gl.BLEND);

                for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
                        let baseTex = bloomFramebuffers[i];
                        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, 1.0 / last.width, 1.0 / last.height);
                        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
                        gl.viewport(0, 0, baseTex.width, baseTex.height);
                        blit(baseTex.fbo);
                        last = baseTex;
                }

                gl.disable(gl.BLEND);
                bloomFinalProgram.bind();
                gl.uniform2f(bloomFinalProgram.uniforms.texelSize, 1.0 / last.width, 1.0 / last.height);
                gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
                gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
                gl.viewport(0, 0, destination.width, destination.height);
                blit(destination.fbo);
        }

        function splat(x, y, dx, dy, color) {
                gl.viewport(0, 0, simWidth, simHeight);
                splatProgram.bind();
                gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
                gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
                gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
                gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0);
                gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS / 100.0);
                blit(velocity.write.fbo);
                velocity.swap();

                gl.viewport(0, 0, dyeWidth, dyeHeight);
                gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0));
                gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
                blit(density.write.fbo);
                density.swap();
        }

        function multipleSplats(amount) {
                for (let i = 0; i < amount; i++) {
                        const color = generateColor();
                        color.r *= 10.0;
                        color.g *= 10.0;
                        color.b *= 10.0;
                        const x = canvas.width * Math.random();
                        const y = canvas.height * Math.random();
                        const dx = 1000 * (Math.random() - 0.5);
                        const dy = 1000 * (Math.random() - 0.5);
                        splat(x, y, dx, dy, color);
                }
        }

        function resizeCanvas() {
                if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
                        canvas.width = canvas.clientWidth;
                        canvas.height = canvas.clientHeight;
                        initFramebuffers();
                }
        }

        // Global mouse tracking for non-interactive canvas
        document.addEventListener('mousemove', e => {
                pointers[0].down = true;
                pointers[0].color = generateColor();
                pointers[0].moved = pointers[0].down;
                pointers[0].dx = (e.clientX - pointers[0].x) * 8.0;
                pointers[0].dy = (e.clientY - pointers[0].y) * 8.0;
                pointers[0].x = e.clientX;
                pointers[0].y = e.clientY;
        });

        // Touch events for mobile
        document.addEventListener('touchmove', e => {
                e.preventDefault();
                const touch = e.touches[0];
                pointers[0].down = true;
                pointers[0].color = generateColor();
                pointers[0].moved = pointers[0].down;
                pointers[0].dx = (touch.clientX - pointers[0].x) * 8.0;
                pointers[0].dy = (touch.clientY - pointers[0].y) * 8.0;
                pointers[0].x = touch.clientX;
                pointers[0].y = touch.clientY;
        });

        // Mouse enter document
        document.addEventListener('mouseenter', e => {
                pointers[0].down = true;
        });

        // Mouse leave document
        document.addEventListener('mouseleave', e => {
                pointers[0].down = false;
        });

        function generateColor() {
                let c = HSVtoRGB(Math.random(), 1.0, 1.0);
                c.r *= 0.15;
                c.g *= 0.15;
                c.b *= 0.15;
                return c;
        }

        function HSVtoRGB(h, s, v) {
                let r, g, b, i, f, p, q, t;
                i = Math.floor(h * 6);
                f = h * 6 - i;
                p = v * (1 - s);
                q = v * (1 - f * s);
                t = v * (1 - (1 - f) * s);

                switch (i % 6) {
                        case 0:
                                r = v, g = t, b = p;
                                break;
                        case 1:
                                r = q, g = v, b = p;
                                break;
                        case 2:
                                r = p, g = v, b = t;
                                break;
                        case 3:
                                r = p, g = q, b = v;
                                break;
                        case 4:
                                r = t, g = p, b = v;
                                break;
                        case 5:
                                r = v, g = p, b = q;
                                break;
                }

                return {
                        r,
                        g,
                        b
                };
        }

        function getResolution(resolution) {
                let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
                if (aspectRatio < 1)
                        aspectRatio = 1.0 / aspectRatio;

                let max = Math.round(resolution * aspectRatio);
                let min = Math.round(resolution);

                if (gl.drawingBufferWidth > gl.drawingBufferHeight)
                        return {
                                width: max,
                                height: min
                        };
                else
                        return {
                                width: min,
                                height: max
                        };
        }

        function getTextureScale(texture, width, height) {
                return {
                        x: width / texture.width,
                        y: height / texture.height
                };
        }
        var boom = document.querySelector(".blocksy-boom");
        if (boom !== null) {
                boom.addEventListener("click", function (e) {
                        multipleSplats(parseInt(Math.random() * 20) + 5);
                });
        }

// Mouse tracking variables
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

// Initialize canvas on page load
document.addEventListener('DOMContentLoaded', function() {
    fluid_init();
    setupMouseTracking();
});

// Setup mouse tracking for fluid interaction
function setupMouseTracking() {
    const canvas = document.querySelector('.blocksy-fluid-canvas');
    if (!canvas) return;

    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Trigger fluid interaction
        if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
            window.addFluidSplat(mouseX, mouseY);
        }
    });

    // Track mouse clicks
    document.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Create explosion effect on click
        if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
            window.addFluidSplat(mouseX, mouseY, true);
        }
    });

    document.addEventListener('mouseup', function() {
        isMouseDown = false;
    });

    // Touch support for mobile
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;

            if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
                window.addFluidSplat(mouseX, mouseY);
            }
        }
    });

    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;

            if (window.addFluidSplat && typeof window.addFluidSplat === 'function') {
                window.addFluidSplat(mouseX, mouseY, true);
            }
        }
    });
}


}