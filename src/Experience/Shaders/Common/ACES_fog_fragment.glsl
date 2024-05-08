// https://ycw.github.io/three-shaderlib-skim/dist/#/latest/basic/fragment
// 该代码块是一个GLSL片段着色器的一部分，用于处理雾效(Fog effect)。
// 它根据场景中物体的距离从相机来调整其颜色，以模拟雾的效果。
// 支持两种雾效模式：指数雾(FOG_EXP2)和线性雾。
// 使用了ACES颜色校正和反转来改善最终的雾化效果。

#ifdef USE_FOG
    // 如果定义了USE_FOG，将根据FOG_EXP2的定义来计算雾化因子。
    #ifdef FOG_EXP2
        // 计算指数雾的雾化因子。
        float fogFactor=1.-exp(-fogDensity*fogDensity*vFogDepth*vFogDepth);
    #else
        // 计算线性雾的雾化因子。
        float fogFactor=smoothstep(fogNear,fogFar,vFogDepth);
    #endif
    
    // 使用线性颜色进行ACES颜色校正。
    vec3 linearFragCol=aces_fitted(gl_FragColor.rgb);
    // 根据雾化因子，混合原始颜色和雾颜色。
    gl_FragColor.rgb=mix(linearFragCol,fogColor,fogFactor);
    // 对混合后的颜色进行ACES反向校正，以得到最终的颜色。
    gl_FragColor.rgb=ACES_Inv(gl_FragColor.rgb);
#endif