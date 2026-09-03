<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      wrap-class-name="full-modal-dw"
      :width="'100vw'"
      :title="title"
      destroyOnClose
      @cancel="close"
      :zIndex="5001"
    >
      <template #closeIcon> <CloseOutlined /></template>
      <div class="modal-body-d-dw">
        <div class="name" v-if="baseMap && baseMap.length > 0">{{ baseMap[currentActiveIdx].showName }}</div>
        <div v-if="baseMap.length > 1" class="arrow arrow-left" @click="prev"><DoubleLeftOutlined style="font-size: 56px; color: #fff" /></div>
        <div v-if="baseMap.length > 1" class="arrow arrow-right" @click="next"><DoubleRightOutlined style="font-size: 56px; color: #fff" /></div>
        <slot name="hint"></slot>
        <div
          :style="{
            position: 'relative',
            width: size[workType].w + 'px',
            height: size[workType].h + 'px',
          }"
        >
          <canvas class="myCanvas" :width="size[workType].w" :height="size[workType].h" ref="myCanvas"></canvas>
          <canvas class="myCanvas" :width="size[workType].w" :height="size[workType].h" ref="myCanvas2"></canvas>
        </div>

        <div class="mark-list" v-if="false">
          <div class="mark-item" v-for="(item, index) in ballArr" :key="index">
            <div class="mark-title">标记点{{ index + 1 }}:</div>
            <div class="mark-input">
              <div
                ><a-input
                  prefix="X:"
                  :disabled="type === 'view'"
                  v-model:value="item.x"
                  @change="handleMarkChange"
                  style="width: 100px; margin-bottom: 5px"
                />
                <a-input
                  prefix="Y:"
                  :disabled="type === 'view'"
                  v-model:value="item.y"
                  @change="handleMarkChange"
                  style="width: 100px; margin-bottom: 5px; margin-left: 10px"
                />
              </div>
              <div>
                <div>
                  <a-select
                    style="width: 136px; margin-bottom: 5px"
                    placeholder="请选择"
                    v-model:value="item.size"
                    :options="options"
                    :disabled="type === 'view'"
                    @change="handleMarkChange"
                  />
                </div>
                <a-button v-if="type !== 'view'" type="danger" ghost @click="deleteMark(index)"> 删除 </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul class="dot" v-if="baseMap.length > 1">
        <li v-for="(item, index) in baseMap" @click="handleClick(index)" :class="{ active: index == currentActiveIdx }" :key="index"></li>
      </ul>
      <template #footer>
        <div>
          <a-button @click="close">取消</a-button>
          <a-button v-if="type !== 'view'" type="primary" @click="handleSubmit">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="mark-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CloseOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue';
  import { ref, nextTick } from 'vue';
  import management from '/@/assets/images/controlScreen/vxzy.png'; // 安全管理一张图
  import yy from '/@/assets/images/controlScreen/fc.png'; // 益阳
  import high from '/@/assets/images/controlScreen/mark.png'; // 高风险
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const size = { 0: { w: 1680, h: 806 }, 1: { w: 1920, h: 1080 } };
  const workType = ref(1);
  const list = ref<any>([]);
  const emits = defineEmits(['callback-value']);
  const title = ref('请在图中点击，选择作业施工位置（右键取消选择）');
  const type = ref('add');
  const ctx: any = ref('');
  const ctx2: any = ref('');
  const ballArr: any = ref([]);
  const myCanvas = ref();
  const myCanvas2 = ref();
  const org = ref('');
  const options = ref([
    {
      value: '1',
      label: '正常',
    },
    {
      value: '2',
      label: '大',
    },
    {
      value: '3',
      label: '小',
    },
  ]);
  const maxLen = ref(1);
  const icon = ref();
  const baseMap = ref<any[]>([]);
  const iconImg = ref();
  const currentActiveIdx = ref(0);
  const prev = () => {
    currentActiveIdx.value--;
    if (currentActiveIdx.value < 0) currentActiveIdx.value = baseMap.value.length - 1;
    resetBall();
    drawMap();
  };

  const next = () => {
    currentActiveIdx.value++;
    if (currentActiveIdx.value > baseMap.value.length - 1) currentActiveIdx.value = 0;
    resetBall();
    drawMap();
  };

  const resetBall = () => {
    ballArr.value = [];
    rendCanvas(true);
    let cur = baseMap.value[currentActiveIdx.value];
    let ball = {};
    if (cur.x) {
      ball = { ...cur, size: 1, icon: iconImg.value };
      ballArr.value = [ball];
      renderBall(ball);
    }
  };

  const handleClick = (index) => {
    currentActiveIdx.value = index;
    drawMap();
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    workType.value = data.data.type;
    icon.value = high;
    iconImg.value = new Image();
    iconImg.value.src = icon.value;
    data.ballArr.map((item) => {
      if (data.baseMap && data.baseMap.length > 0) {
        data.baseMap.forEach((val, idx) => {
          if (val.sort == item.sort) {
            val.x = item.x;
            val.y = item.y;
            currentActiveIdx.value = idx;
          }
        });
      }
    });
    ballArr.value = JSON.parse(JSON.stringify(data.ballArr)).map((item) => {
      item.is = true;
      item.icon = iconImg.value;
      return item;
    });
    type.value = data.type;
    org.value = data.org;
    maxLen.value = data.maxLen;
    if (data.org) {
      await list({ pageNo: 1, pageSize: 10, org: data.org }).then((res) => {
        if (res.records.length > 0) {
          baseMap.value = getFileAccessHttpUrl(res.records[0].picture);
        }
      });
    } else {
      if (data.baseMap.length > 0) {
        baseMap.value = data.baseMap.map((val) => {
          val.picture = getFileAccessHttpUrl(val.picture);
          return val;
        });
      } else {
        let params: any = data.data.workOrgCode && data.data.workOrgCode.includes('A04C02') ? [{ picture: yy }] : [{ picture: management }];
        if (data.ballArr.length) {
          data.ballArr.map((item, idx) => {
            params[idx].x = item.x;
            params[idx].y = item.y;
            params[idx].sort = item.sort;
            currentActiveIdx.value = idx;
          });
        }
        baseMap.value = params;
      }
    }
    nextTick(() => {
      console.log(baseMap.value);

      iconImg.value.onload = () => {
        createCanvas(false);
      };
      createCanvas(false);
      drawMap();
      dragImage();
    });
  });
  const createCanvas = (cut) => {
    // 获取上下文
    ctx2.value = myCanvas2.value.getContext('2d');
    if (type.value !== 'view') {
      // canvas 设置监听右键
      myCanvas2.value.oncontextmenu = function (event) {
        deleteBall(event);
        return false;
      };
      // canvas设置鼠标监听 鼠标移动创建小球
      myCanvas2.value.addEventListener('click', function (event) {
        if (dragIdx.value > -1) {
          dragIdx.value = -1;
          return;
        }
        if (ballArr.value.length < maxLen.value) {
          ballArr.value.push({ x: event.offsetX, y: event.offsetY, size: '1', icon: iconImg.value });
          ballArr.value.forEach((item) => {
            // 判断是否已进行绘画
            if (!item.is) renderBall(item);
          });
        }
      });
    }
    rendCanvas(cut);
  };

  function drawMap() {
    // 获取上下文
    ctx.value = myCanvas.value.getContext('2d');
    // 创建画布背景
    const bgCanvas = new Image();
    bgCanvas.src = baseMap.value[currentActiveIdx.value].picture;
    bgCanvas.onload = () => {
      ctx.value.clearRect(0, 0, myCanvas2.value.width, myCanvas2.value.height);
      ctx.value.drawImage(bgCanvas, 0, 2, size[workType.value].w, size[workType.value].h);
    };
  }

  const rendCanvas = (cut) => {
    ctx2.value.clearRect(0, 0, myCanvas2.value.width, myCanvas2.value.height);
    // 生成坐标
    ballArr.value.forEach((item) => {
      renderBall(item, cut);
    });
  };

  // 点击生成坐标
  const renderBall = (item, cut = true) => {
    item.is = true;
    let w = 60;
    let h = 88;
    let x = item.x;
    let y = item.y;
    if (cut) {
      x = item.x - w / 2;
      y = item.y - h + 8;
    }
    if (item.picture) {
      x = item.x;
      y = item.y;
    }
    baseMap.value.forEach((val) => {
      if (val.x) {
        delete val.x;
        delete val.y;
      }
    });
    baseMap.value[currentActiveIdx.value].x = x;
    baseMap.value[currentActiveIdx.value].y = y;
    console.log(baseMap.value);
    ctx2.value.drawImage(item.icon, x, y, w, h);
  };
  // 右键删除坐标
  const deleteBall = (event) => {
    ballArr.value.forEach((item: any, index) => {
      if (event.offsetX >= item.x - 30 && event.offsetX <= item.x + 30) {
        if (event.offsetY >= item.y - 88 && event.offsetY <= item.y + 88) {
          ballArr.value.splice(index, 1);
          delete baseMap.value[currentActiveIdx.value].x;
          delete baseMap.value[currentActiveIdx.value].y;
          rendCanvas();
        }
      }
    });
  };
  // 标记点改变
  const handleMarkChange = () => {
    rendCanvas();
  };
  // 删除标记点
  const deleteMark = (index) => {
    ballArr.value.splice(index, 1);
    rendCanvas();
  };
  const handleSubmit = () => {
    emits(
      'callback-value',
      baseMap.value.find((item) => item.x)
    );
    closeModal();
  };
  const close = () => {
    ballArr.value = [];
    closeModal();
  };
  // 标记拖拽index
  const dragIdx = ref(-1);
  function dragImage() {
    if (type.value == 'view') return;
    let x, y;
    //添加鼠标按下事件
    myCanvas2.value.onmousedown = function (e) {
      ballArr.value.forEach((item, index) => {
        if (
          rayCasting(
            [e.offsetX + 30, e.offsetY + 88],
            [
              [item.x, item.y],
              [item.x + 60, item.y],
              [item.x + 60, item.y + 88],
              [item.x, item.y + 88],
            ]
          )
        ) {
          dragIdx.value = index;
        }
      });

      if (dragIdx.value == -1) {
        return false;
      }
      const w_x = e.offsetX - ballArr.value[dragIdx.value].x;
      const w_y = e.offsetY - ballArr.value[dragIdx.value].y;
      //按下后可移动
      myCanvas2.value.onmousemove = function (e) {
        x = e.offsetX;
        y = e.offsetY;
        if (x > myCanvas2.value.width - 60) x = myCanvas2.value.width - 60 / 2;
        if (x - 60 / 2 < 0) x = 60 / 2;
        if (y - 88 < 0) y = 88;
        if (y > myCanvas2.value.height - 88) y = myCanvas2.value.height - 88;
        ballArr.value[dragIdx.value].x = x - w_x;
        ballArr.value[dragIdx.value].y = y - w_y;
        rendCanvas();
      };

      //鼠标抬起清除绑定事件
      myCanvas2.value.onmouseup = function () {
        // dragIdx.value = -1;
        myCanvas2.value.onmousemove = null;
        myCanvas2.value.onmouseup = null;
      };
    };
  }

  // 判断点是否在多边形内
  function rayCasting(p, poly) {
    // px，py为p点的x和y坐标
    let px = p[0],
      py = p[1],
      flag = false;

    //这个for循环是为了遍历多边形的每一个线段
    for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
      let sx = poly[i][0], //线段起点x坐标
        sy = poly[i][1], //线段起点y坐标
        tx = poly[j][0], //线段终点x坐标
        ty = poly[j][1]; //线段终点y坐标

      // 点与多边形顶点重合
      if ((sx === px && sy === py) || (tx === px && ty === py)) {
        return true;
      }

      // 点的射线和多边形的一条边重合，并且点在边上
      if (sy === ty && sy === py && ((sx > px && tx < px) || (sx < px && tx > px))) {
        return true;
      }

      // 判断线段两端点是否在射线两侧
      if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
        // 求射线和线段的交点x坐标，交点y坐标当然是py
        let x = sx + ((py - sy) * (tx - sx)) / (ty - sy);

        // 点在多边形的边上
        if (x === px) {
          return true;
        }

        // x大于px来保证射线是朝右的，往一个方向射，假如射线穿过多边形的边界，flag取反一下
        if (x > px) {
          flag = !flag;
        }
      }
    }

    // 射线穿过多边形边界的次数为奇数时点在多边形内
    return flag ? true : false;
  }
</script>
<style lang="less">
  .modal-body-d-dw {
    display: flex;
    justify-content: space-around;
    height: calc(100vh - 164px) !important;
    overflow: auto;
    .name {
      font-size: 18px;
      font-weight: 600;
      position: absolute;
      left: 16px;
      top: 0;
    }
    .myCanvas {
      position: absolute;
      left: 0;
      top: 0;
    }
    .ant-modal {
      max-width: 100%;
      top: 0;
      padding-bottom: 0;
      margin: 0;
    }
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
    }
    .ant-modal-body {
      flex: 1;
    }
    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 999999;
      cursor: pointer;
      width: 68px;
      height: 68px;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
    }
    .arrow-left {
      left: 30px;
      opacity: 0.3;
    }
    .arrow-right {
      right: 30px;
      opacity: 0.3;
    }
  }
  .full-modal-dw {
    .ant-modal {
      max-width: 100%;
      top: 0;
      padding-bottom: 0;
      margin: 0;
    }
    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
    }
    .ant-modal-body {
      flex: 1;
    }
  }
  .dot {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 5px;
    display: flex;
    align-items: center;
    li {
      width: 18px;
      height: 5px;
      border-radius: 2px;
      background-color: #bebebe;
      margin: 0 2px;
      cursor: pointer;
    }
    .active {
      background-color: #0099ff;
    }
  }
</style>
