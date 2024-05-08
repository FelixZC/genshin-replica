/**
 * HashFog 类扩展自 kokomi.Component，用于创建并管理一个基于着色器的雾化效果。
 * 该效果通过将自定义的顶点和片段着色器应用于 THREE.Mesh 对象来实现。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import hashFogVertexShader from "../Shaders/HashFog/vert.glsl";
import hashFogFragmentShader from "../Shaders/HashFog/frag.glsl";

export default class HashFog extends kokomi.Component {
  declare base: Experience; // 定义基于 Experience 类型的基础体验对象
  uj: kokomi.UniformInjector; // 用于注入统一变量的工具
  material: THREE.ShaderMaterial; // 使用自定义着色器的材质
  mesh: THREE.Mesh; // 包含雾化效果的网格对象

  /**
   * 构造函数初始化 HashFog 组件。
   * @param base - Experience 实例，表示该雾化效果的基础体验对象。
   */
  constructor(base: Experience) {
    super(base);

    // 创建一个平面几何体作为雾化的视觉表现
    const geometry = new THREE.PlaneGeometry(1000, 1000);

    // 初始化UniformInjector用于在着色器中注入统一变量
    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    // 创建使用自定义着色器的材质
    const material = new THREE.ShaderMaterial({
      vertexShader: hashFogVertexShader,
      fragmentShader: hashFogFragmentShader,
      transparent: true, // 设置材质为透明
      depthWrite: false, // 禁止深度写入，允许雾化效果覆盖其他对象
      uniforms: {
        ...uj.shadertoyUniforms, // 注入由 UniformInjector 管理的统一变量
      },
    });
    this.material = material;

    // 创建并配置网格对象
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;
    this.mesh.position.z = -400; // 设置初始位置
    this.mesh.frustumCulled = false; // 禁用视锥体剪裁，保证雾化效果始终可见
  }

  /**
   * 将雾化效果的网格对象添加到场景容器中。
   */
  addExisting(): void {
    this.container.add(this.mesh);
  }

  /**
   * 每帧更新函数，用于维护雾化效果。
   */
  update(): void {
    // 注入动态变化的着色器统一变量
    this.uj.injectShadertoyUniforms(this.material.uniforms);

    // 将雾化效果对象的位置设置为与相机位置保持一定距离
    this.mesh.position.copy(
      new THREE.Vector3(0, 0, this.base.camera.position.z - 400)
    );
  }
}