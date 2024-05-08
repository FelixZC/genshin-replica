#include "./aces.glsl"
/**
 * 计算直接光照对物理材质的影响。
 * 
 * @param directLight 直接光源信息，包含方向和颜色。
 * @param geometryPosition 几何位置，即表面点的位置。
 * @param geometryNormal 几何法线，即表面点的法线方向。
 * @param geometryViewDir 观察方向，即从表面点到相机的方向。
 * @param geometryClearcoatNormal 清漆法线，用于处理清漆层的额外反射。
 * @param material 物理材质参数，包含各种材质属性。
 * @param reflectedLight 反射光信息的输入输出参数，存储计算后的反射光信息。
 * 
 * 该函数不返回值，但会通过reflectedLight参数更新反射光信息。
 */
void RE_Direct_Physical(const in IncidentLight directLight,const in vec3 geometryPosition,const in vec3 geometryNormal,const in vec3 geometryViewDir,const in vec3 geometryClearcoatNormal,const in PhysicalMaterial material,inout ReflectedLight reflectedLight){
    // 计算入射光强度
    float dotNL=saturate(dot(geometryNormal,directLight.direction));
    vec3 irradiance=dotNL*directLight.color;

    // 如果启用了清漆层，则计算清漆层的反射
    #ifdef USE_CLEARCOAT
    float dotNLcc=saturate(dot(geometryClearcoatNormal,directLight.direction));
    vec3 ccIrradiance=dotNLcc*directLight.color;
    // 更新清漆层的镜面反射贡献
    clearcoatSpecular+=ccIrradiance*BRDF_GGX_Clearcoat(directLight.direction,geometryViewDir,geometryClearcoatNormal,material);
    #endif

    // 如果启用了sheen（一种非镜面高光效果），则计算sheen的反射贡献
    #ifdef USE_SHEEN
    sheenSpecular+=irradiance*BRDF_Sheen(directLight.direction,geometryViewDir,geometryNormal,material.sheenColor,material.sheenRoughness);
    #endif

    // 更新材质的镜面反射和漫反射贡献
    reflectedLight.directSpecular+=irradiance*BRDF_GGX(directLight.direction,geometryViewDir,geometryNormal,material);
    reflectedLight.directDiffuse+=irradiance*BRDF_Lambert(material.diffuseColor);
}