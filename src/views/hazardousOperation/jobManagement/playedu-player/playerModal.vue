<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerModal"
    :width="800"
    :z-index="zIndex"
    title="预览"
    :canFullscreen="false"
    :defaultFullscreen="false"
    destroyOnClose
    @cancel="close"
  >
    <div class="video-wrapper">
      <div id="play_window" style="width: 100%; height: 100%"></div>
      <div class="loading-mask" v-if="isLoading">
        <a-spin size="large" tip="加载中..." />
      </div>
      <div class="error-mask" v-if="errorMessage">
        <div class="error-content">
          <ExclamationCircleOutlined class="error-icon" />
          <span class="error-text">{{ errorMessage }}</span>
        </div>
      </div>
      <div class="fullscreen-btn" @click="fullScreen" v-if="!isLoading && isPlaying && !errorMessage">
        <ExpandOutlined />
      </div>
    </div>
    <template #footer>
      <div>
        <a-button @click="close">取消</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="review-release-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, onBeforeUnmount, nextTick } from 'vue';
  import { ExpandOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

  const url: any = ref('');
  const id = ref('');
  const zIndex = ref(1000);
  const player: any = ref(null);
  const isPlaying = ref(false);
  const isLoading = ref(false);
  const errorMessage = ref('');

  const [registerModal, { closeModal }] = useModalInner((data) => {
    id.value = data.id;
    url.value = data.url;
    if (data.zIndex) zIndex.value = data.zIndex;
    else zIndex.value = 1000;
    isLoading.value = true;
    isPlaying.value = false;
    errorMessage.value = '';
    nextTick(() => {
      initPlayer();
    });
  });

  const playVideo = (playURL: string) => {
    if (!player.value) return;
    isLoading.value = true;
    isPlaying.value = false;
    errorMessage.value = '';
    player.value.JS_Play(playURL, { playURL, mode: 0, keepDecoder: 0 }, player.value.currentWindowIndex).then(
      () => {
        isPlaying.value = true;
        isLoading.value = false;
      },
      () => {
        isLoading.value = false;
        errorMessage.value = '取流失败，请确认布控球是否开机或网络是否畅通';
      }
    );
  };

  // 全屏
  const fullScreen = () => {
    if (!player.value) return;
    player.value.JS_FullScreenSingle(player.value.currentWindowIndex).then(
      () => {
        console.info('JS_FullScreenSingle success');
      },
      (_err) => {
        console.info('JS_FullScreenSingle failed');
      }
    );
  };

  const onResize = () => {
    if (!player.value) return;
    player.value.JS_Resize().then(
      () => {
        console.info('JS_Resize success');
      },
      (_err: any) => {
        console.info('JS_Resize failed');
      }
    );
  };

  const close = () => {
    window.removeEventListener('resize', onResize);
    if (player.value) {
      player.value.JS_Stop().then(
        () => {
          isPlaying.value = false;
          player.value = null;
          closeModal();
        },
        (_err: any) => {
          isPlaying.value = false;
          player.value = null;
          closeModal();
        }
      );
    } else {
      closeModal();
    }
  };

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (player.value) {
      player.value.JS_Stop().then(
        () => {
          player.value = null;
        },
        () => {
          player.value = null;
        }
      );
    }
  });

  const initPlayer = () => {
    if (player.value) {
      playVideo(url.value);
      return;
    }
    // @ts-ignore
    player.value = new JSPlugin({
      szId: 'play_window',
      szBasePath: '/h5player/',
      iMaxSplit: 1,
      iCurrentSplit: 1,
      openDebug: false,
      mseWorkerEnable: false, //是否开启多线程解码，分辨率大于1080P建议开启，否则可能卡顿
      bSupporDoubleClickFull: false, //是否支持双击全屏，true-双击是全屏；false-双击无响应
      oStyle: {
        borderSelect: '#000',
      },
    });
    window.addEventListener('resize', onResize);
    playVideo(url.value);
  };
</script>
<style lang="less" scoped>
  .video-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    background: #000;

    #play_window {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }

    .loading-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      z-index: 5;
    }

    .error-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.7);
      z-index: 6;
      color: #ff4d4f;

      .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .error-icon {
          font-size: 32px;
        }

        .error-text {
          font-size: 14px;
        }
      }
    }

    .fullscreen-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 10;
      color: white;
      cursor: pointer;
      font-size: 24px;
      opacity: 0.8;
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;

      &:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
        transform: scale(1.1);
      }
    }
  }
</style>
