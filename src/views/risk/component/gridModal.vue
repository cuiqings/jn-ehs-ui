<template>
  <div>
    <basic-modal
      v-bind="$attrs"
      @register="registerModal"
      :width="width + 28"
      :title="title"
      wrap-class-name="mark-modal"
      destroyOnClose
      @cancel="close"
    >
      <template #closeIcon> <CloseOutlined /></template>
      <div class="modal-body">
        <div v-if="img.length > 1" class="arrow arrow-left" @click="prev"><DoubleLeftOutlined style="font-size: 56px; color: #fff" /></div>
        <div v-if="img.length > 1" class="arrow arrow-right" @click="next"><DoubleRightOutlined style="font-size: 56px; color: #fff" /></div>
        <div
          class="myCanvas"
          ref="canvasable"
          :style="{
            background: `url(${img[currentActiveIdx] && img[currentActiveIdx].picture})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            width: width + 'px',
            height: height + 'px',
          }"
          @dblclick="addGrid"
        >
          <img
            :style="{ width: width + 'px', height: height + 'px' }"
            class="content-img"
            v-if="img.length > 0"
            :src="img[currentActiveIdx].picture"
            alt=""
          />
          <vue3-draggable-resizable
            v-if="img[currentActiveIdx] && img[currentActiveIdx].ballArr.length > 0"
            v-for="item in img[currentActiveIdx].ballArr"
            :key="item.id"
            classNameActive="active"
            :data-id="item.id"
            :initW="item.w"
            :initH="item.h"
            v-model:x="item.x"
            v-model:y="item.y"
            v-model:w="item.w"
            v-model:h="item.h"
            :min-w="10"
            :min-h="10"
            parent
            :active="item.active"
            :draggable="item.draggable"
            :resizable="item.resizable"
            :handles="['tl', 'tr', 'bl', 'br']"
            @resizing="resize"
            @dragging="drag"
            @click="handleCheck(item)"
          />
        </div>
        <ul class="dot" v-if="img.length > 1">
          <li v-for="(item, index) in img" @click="handleClick(index)" :class="{ active: index == currentActiveIdx }" :key="index"></li>
        </ul>
        <div class="mark-list" v-if="img.length > 0 && img[currentActiveIdx].ballArr.length > 0">
          <div class="mark-item" v-for="(item, index) in img[currentActiveIdx].ballArr" :key="index">
            <div class="mark-title">标记点{{ index + 1 }}:</div>
            <div class="mark-input">
              <div>
                <a-input prefix="X:" v-model:value="item.x" :disabled="type === 'view'" style="width: 100px; margin-bottom: 5px" />
                <a-input prefix="Y:" v-model:value="item.y" :disabled="type === 'view'" style="width: 100px; margin-bottom: 5px; margin-left: 10px" />
              </div>
              <div>
                <div>
                  <a-input prefix="宽:" v-model:value="item.w" :disabled="type === 'view'" style="width: 100px; margin-bottom: 5px" />
                  <a-input
                    prefix="高:"
                    v-model:value="item.h"
                    :disabled="type === 'view'"
                    style="width: 100px; margin-bottom: 5px; margin-left: 10px"
                  />
                </div>
                <a-button v-if="type !== 'view'" type="danger" ghost @click="deleteMark(index)"> 删除 </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <a-tag color="warning" style="font-size: 14px">请双击选择位置</a-tag>
          <div>
            <a-button @click="close">取消</a-button>
            <a-button v-if="type !== 'view'" type="primary" @click="handleSubmit">提交</a-button>
          </div>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="grid-modal" setup>
  import Vue3DraggableResizable from 'vue3-draggable-resizable';
  import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';
  import { ref, nextTick } from 'vue';
  import { CloseOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  const title = ref('网格区域标记');
  const ballArr: any = ref([]);
  const dataId = ref('');
  const type = ref('add');
  const img = ref<any[]>([]);
  const width = ref(0);
  const height = ref(0);
  const { createMessage } = useMessage();
  const emits = defineEmits(['callback-value']);
  const [registerModal, { closeModal }] = useModalInner((data) => {
    title.value = data.title;
    type.value = data.type;
    img.value = data.imgUrl.map((val) => {
      val.picture = getFileAccessHttpUrl(val.picture);
      val.ballArr = [];
      return val;
    });
    nextTick(() => {
      // width.value = 1680 * 0.8;
      // height.value = 806 * 0.8;
      width.value = 1680;
      height.value = 806;
      img.value.forEach((val) => {
        JSON.parse(JSON.stringify(data.ballArr)).map((item) => {
          item.active = false;
          item.draggable = false;
          item.resizable = false;
          // item.x = item.x * 0.8;
          // item.y = item.y * 0.8;
          // item.w = item.w * 0.8;
          // item.h = item.h * 0.8;
          if (val.sort == item.sort) {
            val.ballArr.push(item);
          }
        });
      });
    });
  });
  const addGrid = (event) => {
    event.preventDefault();
    // if (img.value[currentActiveIdx.value].ballArr.length < 3) {
    createBox({
      w: 110,
      h: 80,
      x: event.offsetX,
      y: event.offsetY,
      active: false,
      draggable: false,
      resizable: false,
    });
    // }
  };
  // 获取当前网格id
  const handleCheck = (data) => {
    dataId.value = data.id;
    if (type.value !== 'view') {
      img.value[currentActiveIdx.value].ballArr = img.value[currentActiveIdx.value].ballArr.map((item) => {
        if (item.id === dataId.value) {
          item.active = true;
          item.draggable = true;
          item.resizable = true;
        } else {
          item.active = false;
          item.draggable = false;
          item.resizable = false;
        }
        return item;
      });
    }
  };
  // 调整大小
  const resize = (data) => {
    const { w, h } = data;
    img.value[currentActiveIdx.value].ballArr = img.value[currentActiveIdx.value].ballArr.map((item) => {
      if (item.id === dataId.value) {
        item.w = w;
        item.h = h;
      }
      return item;
    });
  };
  // 拖动
  const drag = (data) => {
    const { x, y } = data;
    img.value[currentActiveIdx.value].ballArr = img.value[currentActiveIdx.value].ballArr.map((item) => {
      if (item.id === dataId.value) {
        item.x = x;
        item.y = y;
      }
      return item;
    });
  };
  // 生成id，添加网格
  const createBox = (data) => {
    let urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
    let nanoid = (size = 21) => {
      let id = '';
      let i = size;
      while (i--) {
        id += urlAlphabet[(Math.random() * 64) | 0];
      }
      return id;
    };
    data.id = nanoid();
    img.value[currentActiveIdx.value].ballArr.push(data);
  };
  const deleteMark = (index) => {
    img.value[currentActiveIdx.value].ballArr.splice(index, 1);
  };
  const handleSubmit = () => {
    // let arr = JSON.parse(JSON.stringify(img.value[currentActiveIdx.value].ballArr));
    // arr = arr.map((item) => {
    //   return {
    //     x: (item.x / 8) * 10,
    //     y: (item.y / 8) * 10,
    //     w: (item.w / 8) * 10,
    //     h: (item.h / 8) * 10,
    //   };
    // });
    let count = 0;
    img.value.forEach((item) => {
      if (item.ballArr && item.ballArr.length > 0) count++;
    });
    if (count > 1) {
      createMessage.info('同一车间只允许配置一张底图，请删除多出配置！');
      return;
    }
    let ball = img.value.find((item) => item.ballArr && item.ballArr.length > 0);
    if (ball) {
      ball.ballArr.forEach((item) => {
        item.sort = ball.sort;
      });
    }
    emits('callback-value', ball ? ball.ballArr : []);
    closeModal();
  };
  const close = () => {
    closeModal();
  };
  const currentActiveIdx = ref(0);
  const prev = () => {
    currentActiveIdx.value--;
    if (currentActiveIdx.value < 0) currentActiveIdx.value = img.value.length - 1;
  };

  const next = () => {
    currentActiveIdx.value++;
    if (currentActiveIdx.value > img.value.length - 1) currentActiveIdx.value = 0;
  };

  const handleClick = (index) => {
    currentActiveIdx.value = index;
  };
</script>
<style lang="less" scoped>
  .modal-body {
    // height: 900px;
    overflow-y: auto;
    .myCanvas {
      position: relative;
      .content-img {
        position: absolute;
        left: 0;
        top: 0;
      }
      .active {
        border: 2px dashed red;
      }
      .vdr-container {
        border: 2px dashed red !important;
      }
    }
    .mark-list {
      display: flex;
      margin-top: 20px;
      .mark-item {
        display: flex;
        margin: 0 15px;
        .mark-title {
          margin-right: 15px;
          line-height: 32px;
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
    .dot {
      display: flex;
      align-items: center;
      justify-content: center;
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
  }
</style>
<style lang="less">
  .mark-modal {
    .scroll-container {
      .scrollbar__wrap {
        margin-bottom: 0 !important;
      }
    }
    .ant-modal {
      top: 40px !important;
    }
  }
</style>
