uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

// 主函数：负责处理片段着色
// iTime: 传递的时间统一变量，用于动画或时间依赖的着色效果
// iResolution: 屏幕分辨率的统一变量，可用于基于分辨率的着色计算
// iMouse: 鼠标状态的统一变量，可用来控制交互式着色效果
// vUv: 传递给片段着色器的UV坐标，通常用于纹理映射或其他UV相关的着色操作
// 返回值：gl_FragColor，片段的颜色
void main(){
    // 将传入的UV坐标直接赋值给uv变量
    vec2 uv=vUv;
    // 设置片段颜色为UV坐标，透明度为1.0
    gl_FragColor=vec4(uv,0.,1.);
}