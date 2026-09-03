<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="1841" :title="title" wrap-class-name="mark-modal" destroyOnClose @cancel="close">
      <template #closeIcon> <CloseOutlined /></template>
      <div class="modal-body">
        <div
          class="myCanvas"
          ref="canvasable"
          :style="{
            background: `url(${baseMap})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            width: '1813px',
            height: '424px',
          }"
          @dblclick="addGrid"
        >
          <vue3-draggable-resizable
            v-for="item in ballArr"
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
        <div class="mark-list" v-if="ballArr.length > 0">
          <div class="mark-item" v-for="(item, index) in ballArr" :key="index">
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
  import management from '/@/assets/images/risk/management.png'; // 安全管理一张图
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { list } from '../safeBaseMap/url/index';
  import { CloseOutlined } from '@ant-design/icons-vue';
  const title = ref('网格区域标记');
  const ballArr: any = ref([]);
  const dataId = ref('');
  const type = ref('add');
  const baseMap = ref();
  const maxLen = ref(1);
  const emits = defineEmits(['callback-value']);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    type.value = data.type;
    maxLen.value = data.maxLen;
    if (data.org) {
      await list({ pageNo: 1, pageSize: 10, org: data.org }).then((res) => {
        if (res.records.length > 0) {
          baseMap.value = getFileAccessHttpUrl(res.records[0].picture);
        }
      });
    } else baseMap.value = data.baseMap ? await getFileAccessHttpUrl(data.baseMap) : management;
    nextTick(() => {
      ballArr.value = JSON.parse(JSON.stringify(data.ballArr)).map((item) => {
        item.active = false;
        item.draggable = false;
        item.resizable = false;
        return item;
      });
    });
  });
  const addGrid = (event) => {
    event.preventDefault();
    if (ballArr.value.length < maxLen.value) {
      createBox({
        w: 110,
        h: 80,
        x: event.offsetX,
        y: event.offsetY,
        active: false,
        draggable: false,
        resizable: false,
      });
    }
  };
  // 获取当前网格id
  const handleCheck = (data) => {
    dataId.value = data.id;
    if (type.value !== 'view') {
      ballArr.value = ballArr.value.map((item) => {
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
    ballArr.value = ballArr.value.map((item) => {
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
    ballArr.value = ballArr.value.map((item) => {
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
    ballArr.value.push(data);
  };
  const deleteMark = (index) => {
    ballArr.value.splice(index, 1);
  };
  const handleSubmit = () => {
    emits('callback-value', ballArr.value);
    closeModal();
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less" scoped>
  .modal-body {
    height: 673px;
    overflow-y: auto;
    .myCanvas {
      position: relative;
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
