import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";

import type Experience from "../Experience";

import polarLightVertexShader from "../Shaders/PolarLight/vert.glsl";
import polarLightFragmentShader from "../Shaders/PolarLight/frag.glsl";

import { meshList } from "../Data/polarLight";
import config from "../config";
/**
 * PolarLight类扩展自kokomi.Component，用于创建和管理一个基于极光效果的三维场景元素。
 * 它利用了THREE.js的InstancedMesh特性来高效地渲染多个实例，并通过自定义着色器给予它们独特的外观。
 */
export default class PolarLight extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的基类
  meshInfos: MeshInfo[]; // 存储网格信息的数组
  uj: kokomi.UniformInjector; // 用于向着色器注入uniforms的对象
  material: THREE.ShaderMaterial; // 自定义着色器材质
  instancedMesh: THREE.InstancedMesh; // 实例化网格对象

  /**
   * 构造函数初始化PolarLight实例。
   * @param base - Experience类型，代表当前的体验或场景。
   */
  constructor(base: Experience) {
    super(base);

    // 准备网格信息，包括位置、旋转和缩放，并按z位置排序
    this.meshInfos = meshList.map((item) => {
      return {
        object: item.object,
        position: new THREE.Vector3(
          item.position[0],
          item.position[2],
          -item.position[1]
        ).multiplyScalar(0.1),
        rotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(item.rotation[0], -item.rotation[1], item.rotation[2])
        ),
        scale: new THREE.Vector3(0.1, 0.1, 0.1),
      };
    });
    this.meshInfos.sort((a, b) => {
      return a.position.z - b.position.z;
    });

    // 加载模型和材质，并配置纹理
    const model = this.base.am.items["SM_Light"] as STDLIB.GLTF;
    const mesh = model.scene.children[0] as THREE.Mesh;
    const geometry = mesh.geometry;
    const tex = this.base.am.items["Tex_0071"] as THREE.Texture;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    // 创建自定义着色器材质，并配置uniforms
    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;
    const material = new THREE.ShaderMaterial({
      vertexShader: polarLightVertexShader,
      fragmentShader: polarLightFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        ...uj.shadertoyUniforms,
        uTexture: {
          value: tex,
        },
      },
    });
    this.material = material;

    // 创建并配置实例化网格
    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.meshInfos.length
    );
    this.instancedMesh = instancedMesh;
    this.instancedMesh.frustumCulled = false;
  }

  /**
   * 将实例化网格添加到场景容器中。
   */
  addExisting(): void {
    this.container.add(this.instancedMesh);
    this.updateInstance();
  }

  /**
   * 每帧更新函数，主要用于注入动态uniforms和实现无限延伸效果。
   */
  update(): void {
    this.uj.injectShadertoyUniforms(this.material.uniforms);
    this.keepInfinite();
  }

  /**
   * 更新所有实例的位置、旋转和缩放信息到网格实例矩阵中。
   */
  updateInstance() {
    this.meshInfos.forEach((item, i) => {
      const mat = new THREE.Matrix4();
      mat.compose(item.position, item.rotation, item.scale);
      this.instancedMesh.setMatrixAt(i, mat);
    });
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * 通过不断移动网格实例来实现视觉上的无限延伸效果。
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