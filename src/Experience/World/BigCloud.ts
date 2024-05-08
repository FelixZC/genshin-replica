/**
 * `BigCloud`类扩展自kokomi.Component，用于加载和管理一个大型云的3D模型。
 * 该模型通过两种不同的着色器材料进行渲染，以实现云的前后两层效果。
 */
import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";

import type Experience from "../Experience";

import bigCloudVertexShader from "../Shaders/BigCloud/vert.glsl";
import bigCloudFragmentShader from "../Shaders/BigCloud/frag.glsl";
import bigCloudBgFragmentShader from "../Shaders/BigCloud/frag-bg.glsl";

export default class BigCloud extends kokomi.Component {
  declare base: Experience; // 声明基础经验类型，用于类型检查
  model: STDLIB.GLTF; // 定义GLTF模型类型

  /**
   * 构造函数初始化大云模型及其着色器材料。
   * @param base - 经验对象，提供模型所需资源和环境。
   */
  constructor(base: Experience) {
    super(base);

    // 创建云的前层材质，使用定制的顶点和片段着色器
    const material1 = new THREE.ShaderMaterial({
      vertexShader: bigCloudVertexShader,
      fragmentShader: bigCloudFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTexture: {
          value: this.base.am.items["Tex_0063"],
        },
      },
    });

    // 创建云的后层材质，使用不同的片段着色器
    const material2 = new THREE.ShaderMaterial({
      vertexShader: bigCloudVertexShader,
      fragmentShader: bigCloudBgFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTexture: {
          value: this.base.am.items["Tex_0067b"],
        },
      },
    });

    // 加载并设置GLTF模型
    const model = this.base.am.items["SM_BigCloud"] as STDLIB.GLTF;
    this.model = model;

    // 遍历模型场景中的对象，调整它们的属性并应用材质
    // @ts-ignore
    model.scene.traverse((obj: THREE.Mesh) => {
      if (obj.isMesh) {
        obj.position.multiplyScalar(0.1);
        obj.scale.multiplyScalar(0.1);
        obj.renderOrder = -1;
        obj.frustumCulled = false;
        if (obj.name === "Plane011") {
          obj.material = material1; // 应用于前层的材质
        } else {
          obj.material = material2; // 应用于后层的材质
        }
      }
    });
  }

  /**
   * 将模型场景添加到容器中。
   * 该方法目前为空实现，可能用于未来添加额外的逻辑。
   */
  addExisting(): void {
    this.container.add(this.model.scene);
  }

  /**
   * 更新模型位置，使其与相机位置保持一致。
   * 每次渲染循环调用，以确保云与玩家视角同步。
   */
  update(): void {
    this.model.scene.position.copy(this.base.camera.position);
  }
}