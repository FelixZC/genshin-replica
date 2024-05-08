import * as kokomi from "kokomi.js";
import * as THREE from "three";
import { Howl } from "howler";
import gsap from "gsap";
import { CSSRulePlugin } from "gsap/all";

import type Experience from "../Experience";

import TestObject from "./TestObject";
import AmbientLightComponent from "./AmbientLightComponent";
import DirectionalLightComponent from "./DirectionalLightComponent";
import PolarLight from "./PolarLight";
import StarParticle from "./StarParticle";
import Column from "./Column";
import GradientBackground from "./GradientBackground";
import BigCloud from "./BigCloud";
import Cloud from "./Cloud";
import HashFog from "./HashFog";
import Road from "./Road";
import ForwardCamera from "./ForwardCamera";
/**
 * World类扩展自kokomi.Component，用于初始化和管理一个游戏世界的场景与音效。
 */
export default class World extends kokomi.Component {
  declare base: Experience; // 声明一个Experience类型的base属性，用于访问基类经验。
  testObject: TestObject | null; // 用于测试的对象。
  alc!: AmbientLightComponent | null; // 环境光组件。
  dlc!: DirectionalLightComponent | null; // 方向光组件。
  pl!: PolarLight | null; // 极光组件。
  sp!: StarParticle | null; // 星粒子组件。
  co!: Column | null; // 柱组件。
  gb!: GradientBackground | null; // 渐变背景组件。
  bc!: BigCloud | null; // 大云组件。
  cl!: Cloud | null; // 云组件。
  hf!: HashFog | null; // 雾组件。
  ro!: Road | null; // 路组件。
  fc!: ForwardCamera | null; // 前进相机组件。
  bgm!: Howl; // 背景音乐音效。

  /**
   * World类的构造函数，初始化场景、音效和事件监听。
   * @param base 一个Experience类型的实例，提供基本的游戏经验。
   */
  constructor(base: Experience) {
    super(base);

    this.testObject = null;

    // 在场景准备就绪时执行的一系列初始化操作，包括添加各种场景组件和音效。
    this.base.am.on("ready", async () => {
      // 初始化场景雾效、背景和各种光源组件。
      this.base.scene.fog = new THREE.Fog(0x389af2, 5000, 10000);
      this.gb = new GradientBackground(this.base);
      this.gb.addExisting();
      this.alc = new AmbientLightComponent(this.base);
      this.alc.addExisting();
      this.dlc = new DirectionalLightComponent(this.base);
      this.dlc.addExisting();
      
      // 初始化各种视觉特效组件。
      this.co = new Column(this.base);
      this.co.addExisting();
      this.bc = new BigCloud(this.base);
      this.bc.addExisting();
      this.cl = new Cloud(this.base);
      this.cl.addExisting();
      this.pl = new PolarLight(this.base);
      this.pl.addExisting();
      this.sp = new StarParticle(this.base);
      this.sp.addExisting();
      this.hf = new HashFog(this.base);
      this.hf.addExisting();
      this.ro = new Road(this.base);
      this.ro.addExisting();
      this.fc = new ForwardCamera(this.base);
      this.fc.addExisting();

      // 播放背景音乐并显示菜单。
      await kokomi.sleep(1000);
      document.querySelector(".loader-screen")?.classList.add("hollow");
      const bgm = new Howl({
        src: "Genshin/BGM.mp3",
        loop: true,
      });
      this.bgm = bgm;
      bgm.play();
      await kokomi.sleep(1000);
      document.querySelector(".menu")?.classList.remove("hidden");

      // 添加点击事件来创建门。
      document.querySelector(".btn-click-me")?.addEventListener("click", () => {
        const clickSound = new Howl({
          src: "Genshin/Genshin Impact [Duang].mp3",
        });
        clickSound.play();
        this.createDoor();
      });
    });
  }

  /**
   * 更新函数，用于每帧更新加载进度条。
   */
  update(): void {
    const progressbar = document.querySelector(
      ".loader-progress"
    )! as HTMLProgressElement;
    progressbar.value = this.base.am.loadProgress * 100;
  }

  /**
   * 创建门的函数，包括相关的UI交互和音效播放。
   */
  createDoor() {
    // 禁用菜单交互，准备创建门。
    document.querySelector(".menu")?.classList.add("pointer-events-none");
    document.querySelector(".menu-content")?.classList.add("hollow");
    this.ro?.activateCreateDoor();
    
    // 设置门创建过程中的事件监听。
    this.ro?.on("stop-camera", () => {
      this.fc?.stop();
    });
    this.ro?.on("door-comeout", () => {
      const doorComeoutSound = new Howl({
        src: "Genshin/Genshin Impact [DoorComeout].mp3",
      });
      doorComeoutSound.play();
    });
    this.ro?.on("door-created", () => {
      const enterEl = document.querySelector(".enter");
      enterEl?.classList.remove("hidden");
      enterEl?.addEventListener("click", () => {
        const enterSound = new Howl({
          src: "Genshin/Genshin Impact [DoorThrough].mp3",
        });
        enterSound.play();
        this.enter();
      });
      this.emit("blur-behind");
    });
  }

  /**
   * 进入游戏的函数，包括门的打开、相机的潜入和背景音乐的淡出。
   */
  async enter() {
    // 与进入游戏相关的UI交互和动画。
    const enterEl = document.querySelector(".enter");
    enterEl?.classList.add("hollow");
    this.ro?.openDoor();
    this.fc?.diveIn();
    this.emit("bloom-in");

    // 背景音乐淡出。
    this.bgm.fade(1, 0, 2000);

    await kokomi.sleep(2000);

    // 开始游戏的实际逻辑。
    this.startGame();
  }

  /**
   * 开始游戏的函数，执行一些初始化游戏逻辑。
   */
  async startGame() {
    console.log("原神，启动！");
    
    // UI元素的动画和逻辑。
    document.querySelector(".loading-element")?.classList.remove("hollow");
    gsap.registerPlugin(CSSRulePlugin);
    const rule = CSSRulePlugin.getRule(
      ".loading-element .loading-element-wrapper:before"
    );
    gsap.to(rule, {
      width: "94.4%",
      duration: 5,
    });

    // 等待一段时间模拟游戏加载。
    await kokomi.sleep(10000);

    // 显示加载完成信息。
    alert("没错，你卡了");
  }
}