/**
 * 云朵组件类，继承自kokomi.Component，用于创建和管理云朵的三维渲染效果。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";

import type Experience from "../Experience";

import cloudVertexShader from "../Shaders/Cloud/vert.glsl";
import cloudFragmentShader from "../Shaders/Cloud/frag.glsl";

import { meshList } from "../Data/cloud";
import config from "../config";

export default class Cloud extends kokomi.Component {
  declare base: Experience; // 基础经验对象，用于访问经验相关的属性和方法
  params; // 用于存储云朵的参数，如颜色等
  meshInfos: MeshInfo[]; // 存储云朵网格信息的数组
  uj: kokomi.UniformInjector; // 用于向着色器注入统一变量的工具类
  material: THREE.ShaderMaterial; // 云朵的着色器材质
  instancedMesh: THREE.InstancedMesh; // 实例化网格，用于高效渲染多个云朵实例

  /**
   * Cloud类的构造函数，初始化云朵组件。
   * @param base - 经验对象，作为云朵组件的基础。
   */
  constructor(base: Experience) {
    super(base);

    this.params = {
      color1: "#00a2f0", // 主颜色
      color2: "#f0f0f5", // 次颜色
    };

    // 准备云朵实例的属性
    const meshInfos = meshList.map((item) => {
      return {
        object: item.object,
        position: new THREE.Vector3(
          item.position[0],
          item.position[2],
          -item.position[1]
        ).multiplyScalar(0.1),
        rotation: new THREE.Quaternion(),
        scale: new THREE.Vector3(1, 1, 1),
      };
    });
    meshInfos.sort((a, b) => {
      return a.position.z - b.position.z;
    });
    this.meshInfos = meshInfos;

    const geometry = new THREE.PlaneGeometry(3000, 1500); // 云朵的几何形状

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    // 配置云朵的着色器材质
    const material = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        ...uj.shadertoyUniforms,
        uTexture: {
          value: this.base.am.items["Tex_0062"],
        },
        uColor1: {
          value: new THREE.Color(this.params.color1),
        },
        uColor2: {
          value: new THREE.Color(this.params.color2),
        },
      },
    });
    this.material = material;

    // 创建云朵的实例化网格并配置相关属性
    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      meshInfos.length
    );
    this.instancedMesh = instancedMesh;
    this.instancedMesh.frustumCulled = false; // 禁用视锥体剪裁

    this.createDebug(); // 创建调试界面
  }

  /**
   * 将云朵网格添加到场景容器中，并初始化实例属性。
   */
  addExisting(): void {
    this.container.add(this.instancedMesh);
    this.updateInstance();
  }

  /**
   * 每帧更新函数，用于更新云朵的着色器变量和处理无限延伸效果。
   */
  update(): void {
    this.uj.injectShadertoyUniforms(this.material.uniforms); // 注入着色器统一变量

    this.keepInfinite(); // 保持云朵的无限延伸效果
  }

  /**
   * 更新云朵实例的位置、旋转和缩放属性。
   */
  updateInstance() {
    this.meshInfos.forEach((item, i) => {
      const mat = new THREE.Matrix4();
      mat.compose(item.position, item.rotation, item.scale);
      this.instancedMesh.setMatrixAt(i, mat);
    });
    this.instancedMesh.instanceMatrix.needsUpdate = true; // 标记实例矩阵需要更新
  }

  /**
   * 创建调试界面，允许用户交互式调整云朵颜色。
   */
  createDebug() {
    const debug = this.base.debug;
    const params = this.params;
    const material = this.material;

    if (debug.active) {
      const debugFolder = debug.ui!.addFolder("cloud");
      debugFolder.addColor(params, "color1").onChange((val: number) => {
        material.uniforms.uColor1.value = new THREE.Color(val);
      });
      debugFolder.addColor(params, "color2").onChange((val: number) => {
        material.uniforms.uColor2.value = new THREE.Color(val);
      });
    }
  }

  /**
   * 保持云朵的无限延伸效果，通过循环使用云朵实例实现。
   */
  keepInfinite() {
    if (this.instancedMesh) {
      if (
        this.meshInfos[this.meshInfos.length - 1].position.z >
        this.base.camera.position.z
      ) {
        const firstElement = this.meshInfos.pop();
        if (firstElement) {
          firstElement.position.z -= config.totalZ * 0.1;
          this.meshInfos.unshift(firstElement);
          this.updateInstance();
        }
      }
    }
  }
}