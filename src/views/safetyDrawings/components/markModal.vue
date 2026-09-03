<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1841" :title="title" wrap-class-name="mark-modal" destroyOnClose @cancel="close">
      <template #closeIcon> <CloseOutlined /></template>
      <div class="modal-body">
        <slot name="hint"></slot>
        <div style="position: relative; height: 424px">
          <canvas class="myCanvas" :width="1813" :height="424" ref="myCanvas"></canvas>
          <canvas class="myCanvas" :width="1813" :height="424" ref="myCanvas2"></canvas>
        </div>
        <div class="mark-list" v-if="ballArr.length > 0">
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
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { ref, nextTick, onMounted } from 'vue';
  import management from '/@/assets/images/risk/management.png'; // 安全管理一张图
  import high from '/@/assets/images/risk/high_risk.png'; // 高风险
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { list } from '../safeBaseMap/url/index';
  const emits = defineEmits(['callback-value']);
  const title = ref('风险点标记');
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
  const baseMap = ref();
  const iconImg = ref();
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    icon.value = data.icon ? data.icon : high;
    iconImg.value = new Image();
    iconImg.value.src = icon.value;
    title.value = data.title;
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
    } else baseMap.value = data.baseMap ? await getFileAccessHttpUrl(data.baseMap) : management;

    nextTick(() => {
      iconImg.value.onload = () => {
        createCanvas();
      };
      createCanvas();
      drawMap();
      dragImage();
    });
  });
  const createCanvas = () => {
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
        console.log(dragIdx.value, 'click');
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
    rendCanvas();
  };

  function drawMap() {
    // 获取上下文
    ctx.value = myCanvas.value.getContext('2d');
    // 创建画布背景
    const bgCanvas = new Image();
    bgCanvas.src = baseMap.value;
    bgCanvas.onload = () => {
      ctx.value.clearRect(0, 0, myCanvas2.value.width, myCanvas2.value.height);
      ctx.value.drawImage(bgCanvas, 0, 2, 1813, 424);
    };
  }

  const rendCanvas = () => {
    ctx2.value.clearRect(0, 0, myCanvas2.value.width, myCanvas2.value.height);
    // 生成坐标
    ballArr.value.forEach((item) => {
      renderBall(item);
    });
  };

  // 点击生成坐标
  const renderBall = (item) => {
    item.is = true;

    let w = 25;
    let h = 25;
    if (item.size === '2') {
      w = 30;
      h = 35;
    } else if (item.size === '3') {
      w = 18;
      h = 16;
    }

    ctx2.value.drawImage(item.icon, item.x - w / 2, item.y - h / 2, w, h);
  };
  // 右键删除坐标
  const deleteBall = (event) => {
    ballArr.value.forEach((item: any, index) => {
      if (event.offsetX >= item.x - 15 && event.offsetX <= item.x + 15) {
        if (event.offsetY >= item.y - 15 && event.offsetY <= item.y + 15) {
          ballArr.value.splice(index, 1);
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
    emits('callback-value', ballArr.value);
    closeModal();
  };
  const close = () => {
    ballArr.value = [];
    closeModal();
  };
  // 标记拖拽index
  const dragIdx = ref(-1);
  function dragImage() {
    if(type.value == 'view') return;
    let x, y;
    //添加鼠标按下事件
    myCanvas2.value.onmousedown = function (e) {
      ballArr.value.forEach((item, index) => {
        if (
          rayCasting(
            [e.offsetX + 12.5, e.offsetY + 12.5],
            [
              [item.x, item.y],
              [item.x + 25, item.y],
              [item.x + 25, item.y + 25],
              [item.x, item.y + 25],
            ]
          )
        ) {
          dragIdx.value = index;
        }
      });
      console.log(dragIdx.value, 'dragIdx');
      
      if (dragIdx.value == -1) {
        return false;
      }
      //按下后可移动
      myCanvas2.value.onmousemove = function (e) {
        x = e.offsetX;
        y = e.offsetY;
        if (x > myCanvas2.value.width - 25) x = myCanvas2.value.width - 25 / 2;
        if (x - 25 / 2 < 0) x = 25 / 2;
        if (y - 25 / 2 < 0) y = 25 / 2;
        if (y > myCanvas2.value.height - 25) y = myCanvas2.value.height - 25 / 2;
        ballArr.value[dragIdx.value].x = x;
        ballArr.value[dragIdx.value].y = y;
        // throttle(rendCanvas, 100);
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
  function throttle(func, wait) {
    let timeout;
    return function () {
      if (!timeout) {
        timeout = setTimeout(function () {
          func();
          timeout = null;
        }, wait);
      }
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
<style lang="less" scoped>
  .modal-body {
    height: 673px;
    overflow-y: auto;
    .myCanvas {
      position: absolute;
      left: 0;
      top: 0;
    }
    .mark-list {
      display: flex;
      margin-top: 20px;
      .mark-item {
        display: flex;
        margin: 0 15px;
        .mark-title {
          margin-right: 15px;
        }
        .mark-input {
          & > div:nth-child(2) {
            display: flex;
            button {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .mark-modal {
    .scroll-container {
      .scrollbar__wrap {
        margin-bottom: 0 !important;
      }
    }
  }
</style>
