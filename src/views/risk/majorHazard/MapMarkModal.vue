<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="标记点位"
    :width="1200"
    wrap-class-name="map-mark-modal"
    destroyOnClose
    @cancel="close"
  >
    <div class="modal-body">
      <div class="tip-text">点击地图选择标记位置，右键可删除标记</div>
      <div class="canvas-wrap" ref="canvasWrap">
        <canvas class="base-canvas" ref="baseCanvas"></canvas>
        <canvas class="mark-canvas" ref="markCanvas"></canvas>
      </div>
      <div class="coord-info" v-if="markPoint.x !== null">
        <span>标记坐标：</span>
        <a-input prefix="X:" v-model:value="markPoint.x" style="width: 120px; margin-right: 10px" @change="redrawMark" />
        <a-input prefix="Y:" v-model:value="markPoint.y" style="width: 120px" @change="redrawMark" />
      </div>
      <div class="coord-info" v-else>
        <span style="color: #999">请在地图上点击选择标记位置</span>
      </div>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 10px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">保存</a-button>
      </div>
    </template>
  </BasicModal>
</template>

<script lang="ts" name="map-mark-modal" setup>
  import { ref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { saveMark } from './majorHazard.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import markerIcon from '/@/assets/images/risk/high_risk.png';

  const { createMessage } = useMessage();
  const emit = defineEmits(['success', 'register']);

  const baseCanvas = ref();
  const markCanvas = ref();
  const canvasWrap = ref();
  const baseCtx = ref();
  const markCtx = ref();
  const loading = ref(false);
  const recordData = ref<any>({});

  // 画布尺寸
  const canvasWidth = 1160;
  const canvasHeight = 790;

  // 底图原始尺寸
  const imgOriginalWidth = 7793;
  const imgOriginalHeight = 5312;

  const markPoint = ref<{ x: number | null; y: number | null }>({ x: null, y: null });
  const iconImg = ref<HTMLImageElement>();

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    recordData.value = data.record;

    // 回显已有标记
    if (data.record.markX && data.record.markY) {
      markPoint.value = {
        x: Number(data.record.markX),
        y: Number(data.record.markY),
      };
    } else {
      markPoint.value = { x: null, y: null };
    }

    // 加载标记图标
    iconImg.value = new Image();
    iconImg.value.src = markerIcon;

    nextTick(() => {
      initCanvas();
    });
  });

  function initCanvas() {
    if (!baseCanvas.value || !markCanvas.value) return;

    // 设置画布尺寸
    baseCanvas.value.width = canvasWidth;
    baseCanvas.value.height = canvasHeight;
    markCanvas.value.width = canvasWidth;
    markCanvas.value.height = canvasHeight;

    baseCtx.value = baseCanvas.value.getContext('2d');
    markCtx.value = markCanvas.value.getContext('2d');

    // 绘制底图
    drawBaseMap();

    // 绑定点击事件
    markCanvas.value.addEventListener('click', handleCanvasClick);
    markCanvas.value.oncontextmenu = (e) => {
      e.preventDefault();
      handleRightClick(e);
      return false;
    };

    // 绘制已有标记
    if (markPoint.value.x !== null) {
      nextTick(() => {
        redrawMark();
      });
    }
  }

  function drawBaseMap() {
    const bgImg = new Image();
    bgImg.src = '/resource/cockpit2/map-bg.jpg';
    bgImg.onload = () => {
      baseCtx.value.clearRect(0, 0, canvasWidth, canvasHeight);
      baseCtx.value.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

      // 底图加载完后再绘制标记
      if (markPoint.value.x !== null) {
        redrawMark();
      }
    };
  }

  function handleCanvasClick(e) {
    const rect = markCanvas.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 转换为原图坐标
    const originalX = Math.round((x / canvasWidth) * imgOriginalWidth);
    const originalY = Math.round((y / canvasHeight) * imgOriginalHeight);

    markPoint.value = { x: originalX, y: originalY };
    redrawMark();
  }

  function handleRightClick(e) {
    if (markPoint.value.x === null) return;

    const rect = markCanvas.value.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 将标记坐标转换为画布坐标
    const drawX = (markPoint.value.x! / imgOriginalWidth) * canvasWidth;
    const drawY = (markPoint.value.y! / imgOriginalHeight) * canvasHeight;

    // 判断是否点击在标记点附近
    if (Math.abs(clickX - drawX) < 20 && Math.abs(clickY - drawY) < 20) {
      markPoint.value = { x: null, y: null };
      markCtx.value.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  function redrawMark() {
    if (!markCtx.value) return;
    markCtx.value.clearRect(0, 0, canvasWidth, canvasHeight);

    if (markPoint.value.x === null || markPoint.value.y === null) return;

    // 将原图坐标转换为画布坐标
    const drawX = (markPoint.value.x / imgOriginalWidth) * canvasWidth;
    const drawY = (markPoint.value.y / imgOriginalHeight) * canvasHeight;

    const w = 25;
    const h = 25;

    if (iconImg.value && iconImg.value.complete) {
      markCtx.value.drawImage(iconImg.value, drawX - w / 2, drawY - h / 2, w, h);
    } else if (iconImg.value) {
      iconImg.value.onload = () => {
        markCtx.value.drawImage(iconImg.value, drawX - w / 2, drawY - h / 2, w, h);
      };
    }
  }

  async function handleSubmit() {
    if (markPoint.value.x === null || markPoint.value.y === null) {
      createMessage.warning('请先在地图上选择标记位置');
      return;
    }

    loading.value = true;
    try {
      await saveMark({
        id: recordData.value.id,
        markX: markPoint.value.x,
        markY: markPoint.value.y,
      });
      createMessage.success('标记保存成功');
      closeModal();
      emit('success');
    } finally {
      loading.value = false;
    }
  }

  function close() {
    markPoint.value = { x: null, y: null };
    closeModal();
  }
</script>

<style lang="less" scoped>
  .modal-body {
    .tip-text {
      margin-bottom: 10px;
      color: #666;
      font-size: 13px;
    }

    .canvas-wrap {
      position: relative;
      width: 1160px;
      height: 790px;
      border: 1px solid #e8e8e8;
      cursor: crosshair;

      .base-canvas,
      .mark-canvas {
        position: absolute;
        left: 0;
        top: 0;
      }
    }

    .coord-info {
      margin-top: 12px;
      display: flex;
      align-items: center;

      > span {
        margin-right: 10px;
        font-weight: 500;
      }
    }
  }
</style>

<style lang="less">
  .map-mark-modal {
    .scroll-container {
      .scrollbar__wrap {
        margin-bottom: 0 !important;
      }
    }
  }
</style>
