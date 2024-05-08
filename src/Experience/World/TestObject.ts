/**
 * TestObject类继承自kokomi.Component，用于创建和管理一个使用自定义着色器的Three.js对象。
 * 它主要负责初始化材质和网格，并提供了将网格添加到场景中以及更新材质统一变量的方法。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import testObjectVertexShader from "../Shaders/TestObject/vert.glsl";
import testObjectFragmentShader from "../Shaders/TestObject/frag.glsl";

export default class TestObject extends kokomi.Component {
  declare base: Experience; // 声明一个Experience类型的base属性，用于继承自kokomi.Component的类中。
  material: THREE.ShaderMaterial; // 定义一个ShaderMaterial类型的material属性，用于存储自定义着色器材质。
  mesh: THREE.Mesh; // 定义一个Mesh类型的mesh属性，用于存储Three.js的网格对象。
  uj: kokomi.UniformInjector; // 定义一个UniformInjector类型的uj属性，用于注入着色器中的统一变量。

  /**
   * TestObject类的构造函数。
   * @param base 一个Experience类型的对象，作为TestObject的基础对象，用于访问经验相关的属性和方法。
   */
  constructor(base: Experience) {
    super(base);

    const params = {
      uDistort: {
        value: 1,
      },
    };

    const geometry = new THREE.SphereGeometry(2, 64, 64);
    // 创建一个球体几何体，用于展示着色器效果。
    const material = new THREE.ShaderMaterial({
      vertexShader: testObjectVertexShader,
      fragmentShader: testObjectFragmentShader,
    });
    this.material = material;
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;
    // 合并材质的统一变量，包括来自UniformInjector的shadertoyUniforms和自定义参数。
    material.uniforms = {
      ...material.uniforms,
      ...uj.shadertoyUniforms,
      ...params,
    };

    // 如果处于调试模式，通过GUI控制台调整参数。
    const debug = this.base.debug;
    if (debug.active) {
      const debugFolder = debug.ui?.addFolder("testObject");
      debugFolder
        ?.add(params.uDistort, "value")
        .min(0)
        .max(2)
        .step(0.01)
        .name("distort");
    }
  }

  /**
   * 将网格对象添加到场景中。
   */
  addExisting() {
    this.container.add(this.mesh);
  }

  /**
   * 更新材质中的统一变量。
   */
  update() {
    this.uj.injectShadertoyUniforms(this.material.uniforms);
  }
}