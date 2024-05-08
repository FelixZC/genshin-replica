uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

uniform sampler2D uTexture;

varying vec3 vWorldPosition;
// 主渲染函数
// 输入：
//   iTime: 时间统一变量，用于动画和动态效果的时间控制。
//   iResolution: 屏幕分辨率统一变量，用于根据屏幕大小进行效果调整。
//   iMouse: 鼠标位置统一变量，可用于交互式效果的控制。
//   vUv: 纹理坐标变量，用于从纹理贴图中采样。
//   uTexture: 一个纹理采样器，用于从纹理中读取数据。
//   vWorldPosition: 物体在世界空间中的位置，用于实现基于距离的效果。
// 输出：
//   gl_FragColor: 函数最终输出的颜色，即片段的颜色。
void main(){
    vec2 uv=vUv;
    
    // 根据时间偏移和纹理采样计算掩码值
    float mask=1.5*texture(uTexture,uv+vec2(iTime*.015,0.)).r;
    mask+=texture(uTexture,uv*vec2(.4,1.)+vec2(iTime*-.0075,0.)).r;
    
    vec3 col=vec3(1.8);
    
    // 计算最终的透明度
    float alpha=mask;
    
    // 根据UV坐标应用虚化效果
    float mask1=1.;
    mask1*=smoothstep(0.,.5,uv.y);
    mask1*=smoothstep(0.,.1,uv.x);
    mask1*=smoothstep(1.,.9,uv.x);
    alpha*=mask1;
    
    // 根据物体与相机的距离调整透明度，越近越透明
    float distanceToCamera=distance(cameraPosition,vWorldPosition);
    alpha*=smoothstep(200.,1000.,distanceToCamera);
    
    // 设置最终的颜色输出
    gl_FragColor=vec4(col,alpha);
}