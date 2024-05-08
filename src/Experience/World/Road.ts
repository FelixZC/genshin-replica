import * as kokomi from "kokomi.js";
import * as THREE from "three";
import * as STDLIB from "three-stdlib";
import gsap from "gsap";

import type Experience from "../Experience";

import { getToonMaterialDoor, getToonMaterialRoad } from "../utils";
/**
 * Road类扩展自kokomi.Component，用于管理道路的渲染和动画。
 * @extends kokomi.Component
 */
export default class Road extends kokomi.Component {
  declare base: Experience;
  offset: THREE.Vector3;
  model: STDLIB.GLTF;
  zLength: number;
  roadCount: number;
  originPosList: THREE.Vector3[];
  isDoorCreateActive: boolean;
  isRunning: boolean;
  animations!: kokomi.AnimationManager;

  /**
   * Road类的构造函数，初始化道路模型和相关属性。
   * @param base {Experience} - 基础经验对象，提供场景和渲染器等。
   */
  constructor(base: Experience) {
    super(base);

    // 初始化道路模型
    const model = this.base.am.items["SM_Road"] as STDLIB.GLTF;
    this.model = model;

    // 遍历模型中的网格对象，设置接收阴影和材质
    // @ts-ignore
    model.scene.traverse((obj: THREE.Mesh) => {
      if (obj.isMesh) {
        obj.receiveShadow = true;
        const material = obj.material as THREE.MeshStandardMaterial;
        const toonMaterial = getToonMaterialRoad(material, this.base.renderer);
        obj.material = toonMaterial;
        obj.frustumCulled = false;
      }
    });

    // 设置初始偏移量
    this.offset = new THREE.Vector3(0, 34, 200);

    // 缩小并重新定位模型的每个子对象
    // @ts-ignore
    model.scene.children.forEach((obj: THREE.Mesh) => {
      obj.position.multiplyScalar(0.1);
      obj.scale.multiplyScalar(0.1);
      obj.position.sub(this.offset);
    });

    // 初始化道路长度和路块数量
    const zLength = 212.4027;
    const roadCount = model.scene.children.length;
    this.roadCount = roadCount;

    // 克隆路块并放置在后面
    for (let i = 0; i < roadCount; i++) {
      const cloned = model.scene.children[i].clone();
      cloned.position.add(new THREE.Vector3(0, 0, -zLength));
      model.scene.add(cloned);
    }

    // 记录原始路块位置，并计算总道路长度
    this.zLength = zLength;
    this.zLength *= 2;

    this.originPosList = [];
    this.model.scene.children.forEach((item) => {
      this.originPosList.push(item.position.clone());
    });

    // 初始化门的创建状态和动画运行状态
    this.isDoorCreateActive = false;
    this.isRunning = true;
  }

  /**
   * 将道路模型添加到容器中。
   */
  addExisting(): void {
    this.container.add(this.model.scene);
  }

  /**
   * 更新道路动画。如果相机经过路块，会将路块移动到后面并创建门。
   */
  update(): void {
    if (this.isRunning) {
      this.model.scene.children.forEach((item, i) => {
        // 判断相机是否刚好经过路块
        if (item.position.z > this.base.camera.position.z) {
          // 创建门时应停止路块动画
          if (i % this.roadCount === 0 && this.isDoorCreateActive) {
            this.isRunning = false;
            this.createDoor(item.position.z);
            this.emit("stop-camera");
          }
          // 把路块放到后面
          const zOffset = new THREE.Vector3(0, 0, this.zLength);
          item.position.sub(zOffset);
          this.originPosList[i].sub(zOffset);
          // 使用GSAP动画库将路块从下方升起
          const originPos = this.originPosList[i].clone();
          item.position.add(new THREE.Vector3(0, -70, 0));
          gsap.to(item.position, {
            x: originPos.x,
            y: originPos.y,
            z: originPos.z,
            duration: 2,
            ease: "back.out",
          });
        }
      });
    }
  }

  /**
   * 激活创建门的动作。
   */
  activateCreateDoor() {
    this.isDoorCreateActive = true;
  }

  /**
   * 在指定位置创建门。
   * @param z {number} - 门的z轴位置。
   */
  async createDoor(z: number) {
    const model = this.base.am.items["DOOR"] as STDLIB.GLTF;

    // 遍历门模型的网格对象，设置接收阴影、投射阴影和材质
    // @ts-ignore
    model.scene.traverse((obj: THREE.Mesh) => {
      if (obj.isMesh) {
        obj.receiveShadow = true;
        obj.castShadow = true;
        const material = obj.material as THREE.MeshStandardMaterial;
        const toonMaterial = getToonMaterialDoor(material);
        obj.material = toonMaterial;
        obj.frustumCulled = false;
      }
    });

    // 设置门的大小和位置
    model.scene.scale.set(0.1, 0.1, 0.04);
    this.offset.copy(
      new THREE.Vector3(0, -this.offset.y, z - this.zLength - 14)
    );
    model.scene.position.copy(this.offset);

    this.container.add(model.scene);

    this.emit("door-comeout");

    // 初始化并播放门的动画
    const animations = new kokomi.AnimationManager(
      this.base,
      model.animations,
      model.scene
    );
    this.animations = animations;
    for (const action of Object.values(this.animations.actions)) {
      action.setLoop(THREE.LoopOnce, 1);
      action.play();
    }
    await kokomi.sleep(1458);
    for (const action of Object.values(this.animations.actions)) {
      action.paused = true;
    }
    this.emit("door-created");
    this.createWhitePlane();
  }

  /**
   * 打开门。
   */
  async openDoor() {
    for (const action of Object.values(this.animations.actions)) {
      action.paused = false;
    }
    await kokomi.sleep(300);
    for (const action of Object.values(this.animations.actions)) {
      action.paused = true;
    }
  }

  /**
   * 创建白色平面，用作门缝里的白光。
   */
  createWhitePlane() {
    const model = this.base.am.items["WHITE_PLANE"] as STDLIB.GLTF;
    model.scene.scale.setScalar(0.1);
    model.scene.position.copy(this.offset);
    
    // 遍历白色平面的网格对象，设置材质颜色
    // @ts-ignore
    model.scene.traverse((obj: THREE.Mesh) => {
      if (obj.isMesh) {
        const material = obj.material as THREE.MeshStandardMaterial;
        material.color = new THREE.Color("#ffffff").multiplyScalar(3);
        obj.frustumCulled = false;
      }
    });

    this.container.add(model.scene);
  }
}