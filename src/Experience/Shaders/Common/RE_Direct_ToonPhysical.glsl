#include "./aces.glsl"
/**
 * 计算直接光源对物体的卡通化物理渲染效果。
 * 
 * @param directLight 直接光源信息，包含方向和颜色。
 * @param geometryPosition 物体几何位置。
 * @param geometryNormal 物体表面法线。
 * @param geometryViewDir 观察者到物体表面的视线。
 * @param geometryClearcoatNormal 清漆层的表面法线。
 * @param material 物体的物理材质参数。
 * @param reflectedLight 反射光信息，输入和输出。
 * @param metalnessFactor 金属度因素，影响粗糙度的计算。
 * 
 * 该函数不返回值，但通过reflectedLight参数影响后续光照计算。
 */
void RE_Direct_ToonPhysical(const in IncidentLight directLight,const in vec3 geometryPosition,const in vec3 geometryNormal,const in vec3 geometryViewDir,const in vec3 geometryClearcoatNormal,const in PhysicalMaterial material,inout ReflectedLight reflectedLight,const in float metalnessFactor){
    // 计算光线如何在表面反射，不饱和
    float dotNL_noSaturate=dot(geometryNormal,directLight.direction);
    // 阶梯化处理光线强度，用于卡通化效果
    float dotNL=saturate(dotNL_noSaturate);
    // toon光照的普遍算法：将原光照的值阶梯化
    float dotNL_toon=smoothstep(.25,.27,dotNL);
    vec3 irradiance=dotNL_toon*directLight.color;
    
    #ifdef USE_CLEARCOAT
    // 处理清漆层的反射
    float dotNLcc=saturate(dot(geometryClearcoatNormal,directLight.direction));
    vec3 ccIrradiance=dotNLcc*directLight.color;
    clearcoatSpecular+=ccIrradiance*BRDF_GGX_Clearcoat(directLight.direction,geometryViewDir,geometryClearcoatNormal,material);
    #endif
    
    #ifdef USE_SHEEN
    // 处理sheen材质的反射
    sheenSpecular+=irradiance*BRDF_Sheen(directLight.direction,geometryViewDir,geometryNormal,material.sheenColor,material.sheenRoughness);
    #endif
    
    // 根据金属度优化粗糙度值
    float new_roughness=(1.-step(.01,metalnessFactor))*pow(material.roughness,.4);
    new_roughness+=step(.01,metalnessFactor)*pow(material.roughness,1.4);
    PhysicalMaterial new_material=material;
    new_material.roughness=new_roughness;
    
    // 计算漫反射和镜面反射光
    reflectedLight.directSpecular+=irradiance*BRDF_GGX(directLight.direction,geometryViewDir,geometryNormal,new_material);
    reflectedLight.directDiffuse+=irradiance*BRDF_Lambert(new_material.diffuseColor);
    
    // 近似计算菲涅尔反射效果（用于外发光）
    float dotNL_reflect_faker=1.-smoothstep(0.,.3,dotNL_noSaturate);
    float fresnelTerm=dot(geometryViewDir,geometryNormal);
    fresnelTerm=saturate(1.-fresnelTerm)*dotNL_reflect_faker;
    vec3 fresnelCol=vec3(.333,.902,3.418);
    reflectedLight.directDiffuse+=fresnelCol*pow(fresnelTerm,4.5)*.8;
}