uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

varying vec3 vWorldPosition;
// 主渲染函数
// 参数:
// - iTime: 编号为0的全局统一变量，代表时间，用于动画和动态效果。
// - iResolution: 编号为1的全局统一变量，代表渲染目标的分辨率，用于根据分辨率调整效果。
// - iMouse: 编号为2的全局统一变量，代表鼠标位置，可用于交互式效果。
// - vUv: 传递到片段着色器的UV坐标，用于纹理映射等。
// - vWorldPosition: 传递到片段着色器的世界空间位置，用于实现基于位置的效果。
void main(){
    vec3 p = position; // 初始化顶点位置
    
    // 使用实例化变形
    #ifdef USE_INSTANCING
    p = vec3(instanceMatrix * vec4(p, 1.)); // 应用实例化矩阵变换
    #endif
    
    // 计算最终的屏幕空间位置
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    
    // 计算并反转UV的Y轴，常见于纹理映射中以适应图形的上下翻转
    vUv = uv;
    vUv.y = 1. - uv.y;
    
    // 计算顶点在世界空间的位置，可用于实现基于位置的效果
    vWorldPosition = vec3(modelMatrix * vec4(p, 1));
}