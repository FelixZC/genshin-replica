// https://ycw.github.io/three-shaderlib-skim/dist/#/latest/standard/fragment
/**
 * 将原本的RE_Direct转为自定义的RE_Direct_ToonPhysical，用于物理基础的卡通着色。
 * 该部分代码处理了来自不同光源（点光源、聚光灯、平行光）的直接光照计算，
 * 包括普通材质和特殊材质（如金属和清漆）的光照反射。
 */
// 初始化几何位置、法线和视图方向
vec3 geometryPosition=-vViewPosition;
vec3 geometryNormal=normal;
vec3 geometryViewDir=(isOrthographic)?vec3(0,0,1):normalize(vViewPosition);
vec3 geometryClearcoatNormal;
#ifdef USE_CLEARCOAT
geometryClearcoatNormal=clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
// 处理干涉色效果
float dotNVi=saturate(dot(normal,geometryViewDir));
if(material.iridescenceThickness==0.){
    material.iridescence=0.;
}else{
    material.iridescence=saturate(material.iridescence);
}
if(material.iridescence>0.){
    material.iridescenceFresnel=evalIridescence(1.,material.iridescenceIOR,dotNVi,material.iridescenceThickness,material.specularColor);
    material.iridescenceF0=Schlick_to_F0(material.iridescenceFresnel,1.,dotNVi);
}
#endif

// 直接光照计算开始
IncidentLight directLight;
#if(NUM_POINT_LIGHTS>0)&&defined(RE_Direct)
// 对每个点光源进行光照计算
PointLight pointLight;
#if defined(USE_SHADOWMAP)&&NUM_POINT_LIGHT_SHADOWS>0
PointLightShadow pointLightShadow;
#endif
#pragma unroll_loop_start
for(int i=0;i<NUM_POINT_LIGHTS;i++){
    pointLight=pointLights[i];
    getPointLightInfo(pointLight,geometryPosition,directLight);
    #if defined(USE_SHADOWMAP)&&(UNROLLED_LOOP_INDEX<NUM_POINT_LIGHT_SHADOWS)
    pointLightShadow=pointLightShadows[i];
    directLight.color*=(directLight.visible&&receiveShadow)?getPointShadow(pointShadowMap[i],pointLightShadow.shadowMapSize,pointLightShadow.shadowBias,pointLightShadow.shadowRadius,vPointShadowCoord[i],pointLightShadow.shadowCameraNear,pointLightShadow.shadowCameraFar):1.;
    #endif
    // 对当前点光源进行直接光照计算
    RE_Direct(directLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
}
#pragma unroll_loop_end
#endif
#if(NUM_SPOT_LIGHTS>0)&&defined(RE_Direct)
// 对每个聚光灯进行光照计算
SpotLight spotLight;
vec4 spotColor;
vec3 spotLightCoord;
bool inSpotLightMap;
#if defined(USE_SHADOWMAP)&&NUM_SPOT_LIGHT_SHADOWS>0
SpotLightShadow spotLightShadow;
#endif
#pragma unroll_loop_start
for(int i=0;i<NUM_SPOT_LIGHTS;i++){
    spotLight=spotLights[i];
    getSpotLightInfo(spotLight,geometryPosition,directLight);
    #if(UNROLLED_LOOP_INDEX<NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS)
    #define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
    #elif(UNROLLED_LOOP_INDEX<NUM_SPOT_LIGHT_SHADOWS)
    #define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
    #else
    #define SPOT_LIGHT_MAP_INDEX(UNROLLED_LOOP_INDEX-NUM_SPOT_LIGHT_SHADOWS+NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS)
    #endif
    #if(SPOT_LIGHT_MAP_INDEX<NUM_SPOT_LIGHT_MAPS)
    spotLightCoord=vSpotLightCoord[i].xyz/vSpotLightCoord[i].w;
    inSpotLightMap=all(lessThan(abs(spotLightCoord*2.-1.),vec3(1.)));
    spotColor=texture2D(spotLightMap[SPOT_LIGHT_MAP_INDEX],spotLightCoord.xy);
    directLight.color=inSpotLightMap?directLight.color*spotColor.rgb:directLight.color;
    #endif
    #undef SPOT_LIGHT_MAP_INDEX
    #if defined(USE_SHADOWMAP)&&(UNROLLED_LOOP_INDEX<NUM_SPOT_LIGHT_SHADOWS)
    spotLightShadow=spotLightShadows[i];
    directLight.color*=(directLight.visible&&receiveShadow)?getShadow(spotShadowMap[i],spotLightShadow.shadowMapSize,spotLightShadow.shadowBias,spotLightShadow.shadowRadius,vSpotLightCoord[i]):1.;
    #endif
    // 对当前聚光灯进行直接光照计算
    RE_Direct(directLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
}
#pragma unroll_loop_end
#endif
#if(NUM_DIR_LIGHTS>0)&&defined(RE_Direct)
// 对每个平行光进行光照计算
DirectionalLight directionalLight;
#if defined(USE_SHADOWMAP)&&NUM_DIR_LIGHT_SHADOWS>0
DirectionalLightShadow directionalLightShadow;
#endif
#pragma unroll_loop_start
for(int i=0;i<NUM_DIR_LIGHTS;i++){
    directionalLight=directionalLights[i];
    getDirectionalLightInfo(directionalLight,directLight);
    #if defined(USE_SHADOWMAP)&&(UNROLLED_LOOP_INDEX<NUM_DIR_LIGHT_SHADOWS)
    directionalLightShadow=directionalLightShadows[i];
    directLight.color*=(directLight.visible&&receiveShadow)?getShadow(directionalShadowMap[i],directionalLightShadow.shadowMapSize,directionalLightShadow.shadowBias,directionalLightShadow.shadowRadius,vDirectionalShadowCoord[i]):1.;
    #endif
    // 使用自定义的RE_Direct_ToonPhysical进行平行光的直接光照计算
    RE_Direct_ToonPhysical(directLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight,metalnessFactor);
}
#pragma unroll_loop_end
#endif
#if(NUM_RECT_AREA_LIGHTS>0)&&defined(RE_Direct_RectArea)
// 对每个矩形面积光进行光照计算
RectAreaLight rectAreaLight;
#pragma unroll_loop_start
for(int i=0;i<NUM_RECT_AREA_LIGHTS;i++){
    rectAreaLight=rectAreaLights[i];
    RE_Direct_RectArea(rectAreaLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
}
#pragma unroll_loop_end
#endif

// 如果定义了RE_IndirectDiffuse，进行间接漫反射光照计算
#if defined(RE_IndirectDiffuse)
vec3 iblIrradiance=vec3(0.);
vec3 irradiance=getAmbientLightIrradiance(ambientLightColor);
#if defined(USE_LIGHT_PROBES)
irradiance+=getLightProbeIrradiance(lightProbe,geometryNormal);
#endif
#if(NUM_HEMI_LIGHTS>0)
#pragma unroll_loop_start
for(int i=0;i<NUM_HEMI_LIGHTS;i++){
    irradiance+=getHemisphereLightIrradiance(hemisphereLights[i],geometryNormal);
}
#pragma unroll_loop_end
#endif
#endif

// 如果定义了RE_IndirectSpecular，进行间接镜面反射光照计算
#if defined(RE_IndirectSpecular)
vec3 radiance=vec3(0.);
vec3 clearcoatRadiance=vec3(0.);
#endif