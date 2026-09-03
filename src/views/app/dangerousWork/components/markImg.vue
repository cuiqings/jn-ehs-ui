<template>
  <div class="markImg" ref="wrapRef">
    <div class="back">
      <div class="left">
        <van-button style="pointer-events: all;" type="default" size="small" @click="close">退出</van-button>
        <div class="hint">提示：双击添加点位 <span v-show="validShow">请双击厂区图片添加点位！</span></div>
      </div>
      <van-button :disabled="route.query && (route.query.pageType=='detail'||route.query.exam == 'true')" style="pointer-events: all;" type="primary" size="small" @click="confirm">确定</van-button>
    </div>
    <div v-if="baseMap.length > 1" class="arrowleft" @click="prev"><van-icon :size="30" name="arrow-left" /></div>
    <div v-if="baseMap.length > 1" class="arrowright" @click="next"><van-icon :size="30" name="arrow" /></div>
    <div class="tool">
      <div class="amplify"><van-icon :size="30" @click="amplify" name="plus" /></div>
      <div class="reduce"><van-icon :size="30" @click="reduce" name="minus" /></div>
    </div>
    <v-stage ref="stageRef" :config="configKonva">
      <v-layer @dbltap="dbltap" ref="layerRef" :config="configLyer" :draggable="true">
        <v-image ref="imgRef" :config="imgConfig" />
      </v-layer>
    </v-stage>
  </div>
</template>
<script lang="ts" setup>
  import high from '../../../../assets/images/controlScreen/mark.png';
  import { ref, nextTick } from 'vue';
  import konva from 'konva';
  import { useRoute } from 'vue-router'
  const props = defineProps({
    baseMap: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => {},
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });
  const route = useRoute();
  const emits = defineEmits(['close', 'confirm']);
  const wrapRef = ref<null | HTMLElement>(null);
  const stageRef = ref<null | HTMLElement>(null);
  const layerRef = ref<null | HTMLElement>(null);
  const configKonva = ref<any>({});
  const configLyer = ref<any>({});
  const imgConfig = ref<any>({});
  const screenW = ref<number | undefined>(0);
  const screenH = ref<number | undefined>(0);
  const imgW = ref<number | 0>(0);
  const imgH = ref<number | 0>(0);
  const scaleNum = ref(0.5);
  const currentIndex = ref(0);

  const baseMapNew = ref<any[]>(props.baseMap)
  nextTick(() => {
    screenW.value = wrapRef.value?.offsetWidth;
    screenH.value = wrapRef.value?.offsetHeight;

    // stage 配置
    configKonva.value = {
      width: screenW.value,
      height: screenH.value,
      rotation: 90, // 横屏
    };
    // layer 配置
    configLyer.value = {
      scale: {
        x: scaleNum.value,
        y: scaleNum.value,
      },
    };
    // 底图 配置
    imgConfig.value = { id: 'baseMap' };
    // 绘制背景图
    createImg(props.baseMap[currentIndex.value].picture, (image) => {
      imgW.value = image.width;
      imgH.value = image.height;
      imgConfig.value.image = image;
      imgConfig.value.width = imgW.value;
      imgConfig.value.height = imgH.value;
      let layerNode = layerRef.value?.getNode();
      let X = computedImgXY().x;
      let Y = computedImgXY().y;
      layerNode.x(X);
      layerNode.y(Y);
      console.log(X, Y);
      layerNode.on('dragmove', () => {
        let pos = layerNode.position();
        console.log(pos);
        console.log('position', layerNode.position());
        if(pos.x <= 0) {
          // layerNode.x(0)
        }
      })

    });
    if(props.value) {
      if(props.value.sort == 0 || !props.value.sort) {
        reviewPoint(props.value.x, props.value.y)
      }
      baseMapNew.value[props.value.sort] = Object.assign(baseMapNew.value[props.value.sort], props.value)
    }
  });

  const prev = () => {
    currentIndex.value--;
    if (currentIndex.value < 0) currentIndex.value = props.baseMap.length - 1;
    resetBall()
    if(baseMapNew.value[currentIndex.value].x) {
      reviewPoint(baseMapNew.value[currentIndex.value].x, baseMapNew.value[currentIndex.value].y)
    }
  };

  const next = () => {
    currentIndex.value++;
    if (currentIndex.value > props.baseMap.length - 1) currentIndex.value = 0;
    resetBall()
    if(baseMapNew.value[currentIndex.value].x) {
      reviewPoint(baseMapNew.value[currentIndex.value].x, baseMapNew.value[currentIndex.value].y)
    }
  };

  const resetBall = () => {
    createImg(props.baseMap[currentIndex.value].picture, (image) => {
      imgW.value = image.width;
      imgH.value = image.height;
      imgConfig.value.image = image;
      imgConfig.value.width = imgW.value;
      imgConfig.value.height = imgH.value;
      let layerNode = layerRef.value?.getNode();
      let X = computedImgXY().x;
      let Y = computedImgXY().y;
      layerNode.x(X);
      layerNode.y(Y);
      console.log(X, Y);
      layerNode.on('dragmove', () => {
        let pos = layerNode.position();
        console.log(pos);
        console.log('position', layerNode.position());
        if(pos.x <= 0) {
          // layerNode.x(0)
        }
      })

    });
    removePoint();
  }

  // 双击事件
  const dbltap = (e) => {
    if (props.readonly) return;
    let oldNode = layerRef.value?.getNode().find('#point-first');
    if (oldNode.length > 0) {
      oldNode[0].destroy();
    }
    // 标点size 计算
    let iw = Math.floor(60);
    let ih = Math.floor(88);
    let layerNodeXY = layerRef.value?.getNode().getRelativePointerPosition();
    baseMapNew.value[currentIndex.value].x = Math.floor(layerNodeXY.x - iw / 2);
    baseMapNew.value[currentIndex.value].y = Math.floor(layerNodeXY.y - ih);
    reviewPoint(baseMapNew.value[currentIndex.value].x, baseMapNew.value[currentIndex.value].y);
  };

  const removePoint = () => {
    let oldNode = layerRef.value?.getNode().find('#point-first');
    if(oldNode.length > 0) {
      oldNode[0].destroy();
    };
  }

  const reviewPoint = (x, y) => {
    if(layerRef.value?.getNode().find('#point-first').length > 0) return;
    // 标点size 计算
    let iw = Math.floor(60);
    let ih = Math.floor(88);
    console.log(iw);

    let image = {
      x: x,
      y: y,
      width: iw,
      height: ih,
      image: high,
      id: 'point-first',
      draggable: true,
      sort: currentIndex.value
    };
    console.log('x:' + image.x, 'y:' + image.y);

    // 绘制标点图
    createImg(high, (img) => {
      image.image = img;
      let c = new konva.Image(image);
      layerRef.value?.getNode().add(c);
    });
  };

  const imgRef = ref<null | HTMLElement>(null);

  // 放大
  const amplify = () => {
    if (scaleNum.value >= 1) return;

    scaleNum.value += 0.1;
    scaleNum.value = Math.round(scaleNum.value * 10) / 10;
    layerRef.value?.getNode().scale({
      x: scaleNum.value,
      y: scaleNum.value,
    });
    console.log(scaleNum.value, layerRef.value?.getNode().find('#baseMap'), layerRef.value?.getNode());

    layerRef.value?.getNode().x(computedImgXY().x);
    layerRef.value?.getNode().y(computedImgXY().y);
  };
  // 缩小
  const reduce = () => {
    if (scaleNum.value <= 0.3) return;
    scaleNum.value -= 0.1;
    scaleNum.value = Math.round(scaleNum.value * 10) / 10;
    layerRef.value?.getNode().scale({
      x: scaleNum.value,
      y: scaleNum.value,
    });
    layerRef.value?.getNode().x(computedImgXY().x);
    layerRef.value?.getNode().y(computedImgXY().y);
  };

  // 关闭
  const close = () => {
    emits('close');
  };
  // 提交
  const validShow = ref(false);
  const confirm = () => {
    if(props.readonly) {
      emits('close');
      return;
    }
    let nodes = layerRef.value?.getNode().find('#point-first');
    if (nodes.length == 0) {
      validShow.value = true;
      let timer: null | any = null;
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
        validShow.value = false;
      }, 2000);
      return;
    }
    
    emits('confirm', { sort: nodes[0].attrs.sort, x: nodes[0].attrs.x, y: nodes[0].attrs.y });
  };

  // 创建图片对象
  function createImg(url, cb) {
    const image = new window.Image();
    image.src = url;
    image.onload = () => {
      cb(image);
    };
  }
  // 计算layer 坐标
  function computedImgXY() {
    let map = { x: 0, y: 0 };
    let w = Math.floor((imgW.value * scaleNum.value - screenH.value) / 2);
    let h = Math.floor(imgH.value * scaleNum.value - (imgH.value * scaleNum.value - screenW.value) / 2);
    map.x = w > 0 ? -w : Math.abs(w);
    map.y = h > 0 ? -h : Math.abs(h);

    return map;
  }
</script>
<style lang="less" scoped>
  .markImg {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #ffffff;
    z-index: 9999;
    .arrowleft, .arrowright {
      width: 40px;
      height: 40px;
      position: absolute;
      bottom: calc(100% - 50px);
      left: 50%;
    }
    .arrowright{
      bottom: 0px;
    }
    .back {
      height: 50px;
      padding: 8px 16px;
      z-index: 99999;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }
  }
  .tool {
    height: 80px;
    position: absolute;
    left: 35px;
    bottom: 0px;
    z-index: 1000;
    -webkit-transform: rotate(90deg);
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .left {
    display: flex;
    align-items: center;
  }
  .hint {
    font-size: 12px;
    color: #ee0a24;
    padding-left: 16px;
    span {
      padding-left: 10px;
      color: #cfcfcf;
    }
  }
  @media screen and (orientation: portrait) {
    .back {
      position: absolute;
      width: 100vh;
      height: 100vw;
      top: 0;
      left: 100vw;
      -webkit-transform: rotate(90deg);
      -moz-transform: rotate(90deg);
      -ms-transform: rotate(90deg);
      transform: rotate(90deg);
      transform-origin: 0% 0%;
    }
    .arrowleft, .arrowright{
      z-index: 999;
      -webkit-transform: rotate(90deg);
      -moz-transform: rotate(90deg);
      -ms-transform: rotate(90deg);
      transform: rotate(90deg);
      transform-origin: 0% 0%;
    }
  }

  @media screen and (orientation: landscape) {
    .back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
  }
</style>
