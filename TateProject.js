//import regl
var regl = require('regl')()

//this function is used for mapping numbers in on range to a different range of numbers
function map(value, start, end, newStart, newEnd) {
  var percent = (value - start) / (end - start)
    
      if (percent < 0) {
        percent = 0
      }
      if (percent > 1) {
        percent = 1
      }
      var newValue = newStart + (newEnd - newStart) * percent
      return newValue
    }

//create a clear function to clear the background
var clear = () => {
  regl.clear({
    color: [1, 1, 1, 1,] //white
  })
}
var aspectRatio = window.innerWidth / window.innerHeight;

//create texture
let texture
let imageLoaded = false

//create image
var img = new Image()

img.onload = function (){
  console.log('Image loaded', this)
  texture = regl.texture(this)
  imageLoaded = true
}

console.log('set the source of the image, this will load the image')
img.src = './assets/normal2.jpg'
//define the size of the square
var r = 0.5
var num = 50
var start = num / 2
//define the points position


// color palette

var color1 = [0.647, 0.627, 0.317] //hiwacha - light green
var color2 = [0.317, 0.431, 0.254] //aoni - dark green
var color3 = [1, 0.694, 0.105] //yamabuki - mustard yellow
var color4 = [0.741, 0.752, 0.729] //shironezumi (grey green) alternative: umezome - light yellow (0.913, 0.639, 0.407)
var color5 = [0.921, 0.478, 0.466] //jinzamomi - pink 
var color6 = [0.941, 0.368, 0.109] // akabeni (red orange) (0.796, 0.250, 0.258 )alternative: ohni - orange ()
var color7 = [0.545, 0.505, 0.764] //fuji - blue purple
var color8 = [0.658, 0.286, 0.478] //umemurasaki - purple pink

//create 8 triangles to form the square
var points = [
  [-r, r, 0],
  [0, r, 0],
  [0, 0, 0],

  [0, r, 0],
  [r, r, 0],
  [0, 0, 0],

  [r, r, 0],
  [r, 0, 0],
  [0, 0, 0],

  [r, 0, 0],
  [r, -r, 0],
  [0, 0, 0],

  [r, -r, 0],
  [0, -r, 0],
  [0, 0, 0],

  [0, -r, 0],
  [-r, -r, 0],
  [0, 0, 0],

  [-r, -r, 0],
  [-r, 0, 0],
  [0, 0, 0],

  [-r, 0, 0],
  [-r, r, 0],
  [0, 0, 0],
]

//defines colour of triangles
var triangleColours = [
  color1,
  color1,
  color1,

  color2,
  color2,
  color2,

  color3,
  color3,
  color3,

  color4,
  color4,
  color4,

  color5,
  color5,
  color5,

  color6,
  color6,
  color6,

  color7,
  color7,
  color7,

  color8,
  color8,
  color8
]

var fragmentShader = `
precision mediump float;
varying vec3 vColor;
varying vec3 vNoise;
varying vec2 vUV;

uniform sampler2D texture;

//adding a diffuse light
float diffuse(vec3 N, vec3 L) {
  float d = dot(normalize(N), normalize(L));
  return max(d, 0.0);
}

float map(float value, float start, float end, float newStart, float newEnd) {
  float percent = (value - start) / (end - start);
  if (percent < 0.0) {
    percent = 0.0;
  }
  if (percent > 1.0) {
    percent = 1.0;
  }
  float newValue = newStart + (newEnd - newStart) * percent;
  return newValue;
} 

//sets texture, noise and the diffuse light
void main(){

  vec4 normal = texture2D(texture, vUV * 0.1);
  vec3 light = vec3(0.2, 0.4, 1.0);

  vec3 finalNormal = vNoise;
  finalNormal += normal.xyz * 1.0;

  float diff = diffuse(finalNormal, light);  // 0 ~ 1
  
  float newDiff = map(diff, 0.0, 1.0, 0.5, 1.0);

  gl_FragColor = vec4(vColor * newDiff, 1.0);

}
`

var vertexShader = `
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aColor;

varying vec3 vColor;
varying vec2 vUV;

uniform float uTime;
uniform vec3 uTranslate;
uniform float uAspectRatio;

varying vec3 vNoise;
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
  vec3 pos = aPosition;
  
  //generates the 'movement' of the textile
  float noiseScale = 0.3;
  float noise = cnoise( (pos + uTranslate) * noiseScale + uTime * 0.5);
  float noiseY = cnoise( (pos.zyx + uTranslate.zyx) * noiseScale + uTime * 1.0);
  float noiseZ = cnoise( (pos.yxz + uTranslate.yxz) * noiseScale + uTime * 2.0);
  noise = noise * .5 + .5; // map the noise from -1 ~ 1 to 0 ~ 1
  noiseY = noiseY * .5 + .5; // map the noise from -1 ~ 1 to 0 ~ 1
  pos.x += noise * 0.8;
  pos.y += noiseY * 0.9;
  pos.z += noiseZ;
  
  // assign the noise to the varying
  vNoise = vec3(noise, noiseY, noiseZ);

  // add the translate to the position of the individual vertex
  pos += uTranslate;
  pos *= vec3(0.1, 0.1 * uAspectRatio, 0);

  gl_Position = vec4(pos, 1.0);
  vColor = aColor;
  // vColor = vec3(scale);
  vUV = aPosition.xy + 0.5;
}
`
var currTime = 0.01

var drawTriangles = regl({
  frag: fragmentShader,
  vert: vertexShader,
  attributes: {
    aPosition: regl.buffer(points),
    aColor: regl.buffer(triangleColours),
  },
  uniforms:{
    uTranslate: regl.prop('translate'),
    uAspectRatio: regl.prop('ratio'),
    uTime: regl.prop('time'),
    texture: regl.prop('texture') 
  },
  count: 24
})

//this renders the following function everytime the frame is reloaded
//the window will adjust to resizing
//found on github: https://github.com/regl-project/regl

regl.frame(({time}) => {
  regl.clear({
    color: [1, 1, 1, 1]
  })

  currTime += 0.01;

  // console.log('time', currTime)

  //drawing the grid out
  for (var i = 0; i < num; i++) {
    for (var j = 0; j < num; j++) {
      var obj = {
        translate: [-start + i, -start + j, 0],
        ratio: aspectRatio,
        time: currTime,
        texture: texture,
      }
      if(imageLoaded) {
        drawTriangles(obj)
      }
    }
  }
}) 