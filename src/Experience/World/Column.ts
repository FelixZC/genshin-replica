import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";
import ky from "kyouka";

import type Experience from "../Experience";

import { meshList } from "../Data/column";
import { getToonMaterialColumn } from "../utils";
import config from "../config";

/**
 * 表示一个柱状物体的组件类，继承自kokomi.Component。
 * 用于创建和管理一系列柱状物体的实例和它们的3D网格表示。
 */
export default class Column extends kokomi.Component {
  declare base: Experience; // 声明Experience类型的基类
  meshInfos: MeshInfo[]; // 存储网格信息的数组
  instanceInfos: InstanceInfo[]; // 存储实例信息的数组
  uj: kokomi.UniformInjector; // 存储UniformInjector实例，用于注入统一变量

  /**
   * 构造函数，初始化Column组件。
   * @param base - Experience类型的基类实例，提供必要的场景和相机等信息。
   */
  constructor(base: Experience) {
    super(base);

    // 初始化meshInfos数组，转换meshList中每个物体的属性格式
    const meshInfos = meshList.map((item) => {
      return {
        object: item.object,
        position: new THREE.Vector3(
          item.position[0],
          item.position[2],
          -item.position[1]
        ).multiplyScalar(0.1),
        rotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(item.rotation[0], item.rotation[2], item.rotation[1])
        ),
        scale: new THREE.Vector3(
          item.scale[0],
          item.scale[2],
          item.scale[1]
        ).multiplyScalar(0.1),
      };
    });
    this.meshInfos = meshInfos;

    // 根据object属性将柱状物体制成组
    const meshGroup = ky.groupBy(
      meshInfos,
      (item: MeshInfo) => item.object
    ) as Record<string, MeshInfo[]>;
    this.instanceInfos = Object.entries(meshGroup).map(([k, v]) => ({
      object: k,
      instanceList: v,
      meshList: [],
    }));

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;

    // 为每个实例创建对应的Three.js InstancedMesh，并设置相应的材质和属性
    this.instanceInfos.forEach((item) => {
      const model = this.base.am.items[item.object] as STDLIB.GLTF;
      // @ts-ignore
      model.scene.traverse((obj: THREE.Mesh) => {
        if (obj.isMesh) {
          const material = obj.material as THREE.MeshStandardMaterial;
          const toonMaterial = getToonMaterialColumn(material);
          const im = new THREE.InstancedMesh(
            obj.geometry,
            toonMaterial,
            item.instanceList.length
          );
          im.castShadow = true;
          im.frustumCulled = false;
          item.meshList.push(im);
        }
      });
    });
  }

  /**
   * 将所有实例的网格添加到场景容器中。
   */
  addExisting(): void {
    this.instanceInfos.forEach((item) => {
      item.meshList.forEach((e) => {
        this.container.add(e);
      });
    });
  }

  /**
   * 更新所有实例的位置和属性。
   */
  update(): void {
    this.keepInfinite();
    this.updateInstance();
  }

  /**
   * 同步实例信息到对应的网格实例上，更新其位置、旋转和缩放。
   */
  updateInstance() {
    this.instanceInfos.forEach((item) => {
      item.meshList.forEach((mesh) => {
        item.instanceList.forEach((e, i) => {
          const mat = new THREE.Matrix4();
          mat.compose(e.position, e.rotation, e.scale);
          mesh.setMatrixAt(i, mat);
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
    });
  }

  /**
   * 实现柱状物体的无限延伸效果，通过周期性移动物体的位置来模拟。
   */
  keepInfinite() {
    this.instanceInfos.forEach((item) => {
      item.meshList.forEach(() => {
        item.instanceList.forEach((e) => {
          if (e.position.z > this.base.camera.position.z + 2000) {
            e.position.z -= config.totalZ * 0.1;
          }
        });
      });
    });
  }
}