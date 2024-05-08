import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import starParticleVertexShader from "../Shaders/StarParticle/vert.glsl";
import starParticleFragmentShader from "../Shaders/StarParticle/frag.glsl";

/**
 * StarParticle类，继承自kokomi.Component，用于创建和管理一个星粒子效果。
 * @extends kokomi.Component
 */
export default class StarParticle extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的base属性
  uj: kokomi.UniformInjector; // UniformInjector实例，用于注入着色器统一变量
  material: THREE.ShaderMaterial; // THREE.ShaderMaterial材质，用于星粒子效果
  points: THREE.Points; // THREE.Points对象，表示粒子系统

  /**
   * 构造函数，初始化星粒子效果。
   * @param {Experience} base - 父级经验对象，提供必要的场景和渲染器等。
   */
  constructor(base: Experience) {
    super(base);

    // 创建粒子几何体，包含4000个粒子，随机分布在一个立方体内部
    const geometry = new THREE.BufferGeometry();
    const count = 4000;
    let positions = Float32Array.from(
      Array.from({ length: count }, () =>
        [2500, 2500, 1000].map(THREE.MathUtils.randFloatSpread)
      ).flat()
    );
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    // 为每个粒子分配一个随机值，用于着色器中的随机效果
    const randoms = Float32Array.from(
      Array.from({ length: count }, () => [1, 1, 1].map(Math.random)).flat()
    );
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));

    // 初始化UniformInjector，用于在着色器中注入统一变量
    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    // 创建粒子材质，使用自定义的顶点和片段着色器
    const material = new THREE.ShaderMaterial({
      vertexShader: starParticleVertexShader,
      fragmentShader: starParticleFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        ...uj.shadertoyUniforms,
        uPointSize: {
          value: 10000,
        },
        uPixelRatio: {
          value: this.base.renderer.getPixelRatio(),
        },
        uTexture: {
          value: this.base.am.items["Tex_0075"],
        },
      },
    });
    this.material = material;

    // 创建粒子系统，并设置其初始位置和是否参与视锥体裁剪
    const points = new THREE.Points(geometry, material);
    this.points = points;
    this.points.position.set(0, 0, -1000);
    this.points.frustumCulled = false;
  }

  /**
   * 将粒子系统添加到场景容器中。
   */
  addExisting(): void {
    this.container.add(this.points);
  }

  /**
   * 每帧更新函数，用于更新粒子的位置和着色器中的统一变量。
   */
  update(): void {
    // 注入着色器统一变量
    this.uj.injectShadertoyUniforms(this.material.uniforms);

    // 跟随相机移动粒子系统，保持其在相机前方一定距离
    this.points.position.copy(
      new THREE.Vector3(
        this.base.camera.position.x,
        this.base.camera.position.y,
        this.base.camera.position.z - 200
      )
    );
  }
}