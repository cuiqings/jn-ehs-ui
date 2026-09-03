<template>
  <Teleport to="body">
  <div class="camera-container">
    <div v-if="isLoading && !error" class="loading-mask">
      <div class="spinner"></div>
      <p>相机启动中...</p>
    </div>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="initCamera">重试</button>
    </div>

    <video
      v-show="!hasPhoto && !isLoading"
      ref="videoRef"
      :controls="false"
      class="camera-video"
      muted
      playsinline
      webkit-playsinline="true"
      x5-video-player-fullscreen="true"
      x5-video-player-type="h5"
      @error="onVideoError"
      @loadedmetadata="onVideoLoaded"
      @canplay="onVideoCanPlay"
      @playing="onVideoPlaying"
      @touchstart="onVideoTouchStart"
      @touchmove="onVideoTouchMove"
    ></video>

    <canvas
      v-show="hasPhoto"
      ref="canvasRef"
      :class="{ 'touch-enabled': isEditing }"
      class="editor-canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @touchstart.stop.prevent="startDrawing"
      @touchmove.stop.prevent="draw"
      @touchend.stop.prevent="stopDrawing"
    ></canvas>

    <!-- 缩放倍率气泡，短暂显示后自动消失 -->
    <transition name="zoom-fade">
      <div v-if="showZoomIndicator && !hasPhoto && !isLoading" class="zoom-indicator">
        {{ zoomLevel.toFixed(1) }}×
      </div>
    </transition>

    <div v-show="!hasPhoto && !isLoading" class="camera-ui">
      <!-- 右侧竖向缩放滑杆 -->
      <div class="zoom-controls">
        <span class="zoom-label-text">{{ maxZoom >= 10 ? maxZoom.toFixed(0) : maxZoom.toFixed(1) }}×</span>
        <input
          type="range"
          class="zoom-slider"
          :min="minZoom"
          :max="maxZoom"
          :step="0.1"
          :value="zoomLevel"
          @input="onZoomSliderChange"
        />
        <span class="zoom-label-text">{{ minZoom.toFixed(1) }}×</span>
      </div>

      <div class="top-bar">
        <button class="icon-btn" @click="$emit('close')">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>

        <button v-if="hasFlash" :class="{ active: isFlashOn }" class="icon-btn" @click="toggleFlash">
          <svg
            v-if="isFlashOn"
            fill="currentColor"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <svg
            v-else
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            <line x1="1" x2="23" y1="1" y2="23" />
          </svg>
        </button>
      </div>

      <div class="bottom-bar">
        <div class="control-spacer"></div>
        <button class="shutter-btn" @click="takePhoto">
          <div class="shutter-inner"></div>
        </button>
        <button class="icon-btn switch-camera" @click="switchCamera">
          <svg fill="none" height="28" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="28">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="hasPhoto && !isEditing" class="preview-ui">
      <div class="preview-top-bar">
        <div></div>
        <button class="edit-btn" @click="enterEditMode">
          <svg
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>标记</span>
        </button>
      </div>
      <div class="preview-bottom-bar">
        <button class="action-btn retake" :disabled="isUploading" @click="retakePhoto">重拍</button>
        <button class="action-btn confirm" :disabled="isUploading" @click="confirmPhoto">
          <span v-if="isUploading" class="upload-spinner" />
          {{ isUploading ? '上传中...' : '使用照片' }}
        </button>
      </div>
    </div>

    <div v-if="hasPhoto && isEditing" class="editor-ui">
      <div class="editor-top-bar">
        <div class="color-palette">
          <div
            v-for="c in colors"
            :key="c"
            :class="{ active: strokeColor === c }"
            :style="{ background: c }"
            class="color-dot"
            @click="strokeColor = c"
          ></div>
        </div>
        <button :disabled="history.length === 0" class="icon-btn undo-btn" @click="undo">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M9 14L4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
        </button>
      </div>
      <div class="editor-bottom-bar">
        <button class="action-btn done-btn" @click="exitEditMode"> 完成编辑</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { uploadFile } from '/@/api/common/api';
  import { showToast } from 'vant';

  const emit = defineEmits(['close', 'photo-taken']);
  const props = defineProps({
    biz: {
      type: String,
      default: 'ehs',
    },
  });

  // --- 基础状态 ---
  const videoRef = ref(null);
  const canvasRef = ref(null);
  const stream = ref(null);
  const isLoading = ref(true);
  const error = ref('');
  const hasPhoto = ref(false);
  const loadingTimeout = ref(null);
  const facingMode = ref('environment');

  // --- 闪光灯状态 ---
  const isFlashOn = ref(false);
  const hasFlash = ref(false);

  // --- 缩放状态 ---
  const zoomLevel = ref(1);
  const minZoom = ref(0.5);
  const maxZoom = ref(4);           // 无硬件变焦时默认最大 4× 软件缩放
  const hasHardwareZoom = ref(false);
  const showZoomIndicator = ref(false);
  let zoomIndicatorTimer = null;
  let initialZoomApplied = false; // 防止多个事件重复推送初始焦距
  // 捏合手势中间变量（非响应式，不需要 ref）
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;

  // --- 上传状态 ---
  const isUploading = ref(false);

  // --- 编辑状态 ---
  const isEditing = ref(false);
  const isDrawing = ref(false);
  const ctx = ref(null);
  const strokeColor = ref('#FF3B30');
  const strokeWidth = 5;
  const colors = ['#FF3B30', '#FFCC00', '#4CD964', '#007AFF', '#FFFFFF'];
  const history = ref([]);
  let baseImageSnapshot = null;

  // --- 1. 相机初始化 ---
  const initCamera = async () => {
    isLoading.value = true;
    error.value = '';
    hasFlash.value = false;
    isFlashOn.value = false;
    // 切换/重试时重置缩放
    zoomLevel.value = 1;
    hasHardwareZoom.value = false;
    initialZoomApplied = false;
    if (videoRef.value) videoRef.value.style.transform = '';

    if (stream.value) stopCamera();

    // Bug2修复：先检测 getUserMedia 是否可用（要求 HTTPS 或 localhost）
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      isLoading.value = false;
      error.value = '当前环境不支持访问摄像头，请确认使用 HTTPS 协议访问';
      return;
    }

    // 请求摄像头最高可用分辨率以获得最清晰的拍照效果
    // 使用 ideal: 4096 让浏览器选择摄像头支持的最高分辨率（通常 4032×3024 / 3840×2160）
    // 实际分辨率由设备能力决定，ideal 只是引导
    const maxRes = 4096;

    const constraintsList = [
      // 第一优先：精确方向 + 最高分辨率 + 初始广角
      {
        audio: false,
        video: {
          facingMode: { exact: facingMode.value },
          width: { ideal: maxRes },
          height: { ideal: maxRes },
          advanced: [{ zoom: 0.5 }],
        },
      },
      // 第二优先：精确方向 + 最高分辨率，不带 zoom
      {
        audio: false,
        video: {
          facingMode: { exact: facingMode.value },
          width: { ideal: maxRes },
          height: { ideal: maxRes },
        },
      },
      // 第三优先：宽松 facingMode hint + 最高分辨率
      {
        audio: false,
        video: {
          facingMode: facingMode.value,
          width: { ideal: maxRes },
          height: { ideal: maxRes },
        },
      },
      // 最终兜底：不带任何约束，让浏览器自行决定
      { audio: false, video: true },
    ];

    let mediaStream = null;
    let lastErr = null;

    for (const constraints of constraintsList) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // 成功则跳出
      } catch (err) {
        lastErr = err;
        // NotAllowedError / NotFoundError 不需要继续重试
        if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') break;
      }
    }

    if (!mediaStream) {
      isLoading.value = false;
      const err = lastErr;
      if (err?.name === 'NotAllowedError') {
        error.value = '请允许访问摄像头权限';
      } else if (err?.name === 'NotFoundError') {
        error.value = '未检测到摄像头设备';
      } else if (err?.message?.includes('Permissions policy')) {
        error.value = '页面权限策略禁止访问摄像头';
      } else {
        error.value = `无法打开相机（${err?.name ?? '未知错误'}），请检查权限设置`;
      }
      return;
    }

    stream.value = mediaStream;
    await nextTick();
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      videoRef.value.muted = true;
      // Bug1修复：play() 移到 onVideoLoaded 里触发，这里只设置超时兜底
      loadingTimeout.value = setTimeout(() => {
        if (isLoading.value) error.value = '相机启动超时，请重试';
      }, 8000);
    }

    checkFlashCapability(mediaStream);
    checkZoomCapability(mediaStream);
  };

  // 应用初始焦距（靠 flag 去重，防止多个事件重复触发）
  const applyInitialZoom = () => {
    if (initialZoomApplied || !hasHardwareZoom.value) return;
    if (zoomLevel.value === 1) return;
    initialZoomApplied = true;
    // 立即推一次
    applyZoom(zoomLevel.value, true);
    // 部分设备在 play() 刚 resolve 时 applyConstraints 还未生效，
    // 等首帧真正渲染后（约 300ms）再推一次，确保实际生效
    setTimeout(() => applyZoom(zoomLevel.value, true), 300);
  };

  const clearLoading = () => {
    isLoading.value = false;
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value);
      loadingTimeout.value = null;
    }
  };

  const onVideoLoaded = () => {
    if (!videoRef.value) return;
    videoRef.value.play()
      .then(() => {
        // play() resolve = 浏览器已接受播放，部分 Android WebView playing 事件不触发
        // 在此直接清 loading 并推送初始焦距，是最可靠的时机
        clearLoading();
        applyInitialZoom();
      })
      .catch((e) => {
        console.warn('Video play failed:', e);
        error.value = '视频播放失败，请重试';
        clearLoading();
      });
  };

  // canplay：另一个可靠的早期事件，作为 play().then() 的备用
  const onVideoCanPlay = () => {
    clearLoading();
    applyInitialZoom();
  };

  const onVideoError = (e) => {
    console.error('Video element error:', e);
    error.value = '视频流异常，请重试';
    clearLoading();
  };

  // playing：保留作最后兜底
  const onVideoPlaying = () => {
    clearLoading();
    applyInitialZoom();
  };

  // --- 2. 闪光灯逻辑 (新增) ---
  const checkFlashCapability = (mediaStream) => {
    try {
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      // 检测 'torch' 能力。注意：iOS Safari 对此支持较差，Android Chrome 支持较好
      hasFlash.value = !!capabilities.torch;
    } catch (e) {
      console.warn('Flash capability check failed', e);
      hasFlash.value = false;
    }
  };

  const toggleFlash = async () => {
    if (!hasFlash.value || !stream.value) return;

    isFlashOn.value = !isFlashOn.value;
    const track = stream.value.getVideoTracks()[0];

    try {
      await track.applyConstraints({
        advanced: [{ torch: isFlashOn.value }],
      });
    } catch (err) {
      console.error('Flash toggle error:', err);
      // 如果失败，回滚状态
      isFlashOn.value = !isFlashOn.value;
      showToast('无法开启闪光灯');
    }
  };

  // --- 3. 缩放逻辑 ---
  const checkZoomCapability = (mediaStream) => {
    try {
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.zoom) {
        hasHardwareZoom.value = true;
        minZoom.value = 0.5;
        maxZoom.value = capabilities.zoom.max ?? 5;
      } else {
        showToast('当前设备不支持变焦');
        // 硬件变焦不可用，退回到 CSS transform 软件缩放
        // CSS scale < 1 会出现黑边，因此软件缩放最小只能是 1
        hasHardwareZoom.value = false;
        minZoom.value = 0.5;
        maxZoom.value = 4;
      }
    } catch (e) {
      console.warn('Zoom capability check failed', e);
      hasHardwareZoom.value = false;
      minZoom.value = 1;
      maxZoom.value = 4;
    }
    // 初始焦距 = 设备最小值（最广角），避免开机画面过度放大
    zoomLevel.value = minZoom.value;
  };

  const applyZoom = async (newZoom, silent = false) => {
    const clamped = Math.round(Math.min(Math.max(newZoom, minZoom.value), maxZoom.value) * 10) / 10;
    zoomLevel.value = clamped;

    if (hasHardwareZoom.value && stream.value) {
      const track = stream.value.getVideoTracks()[0];
      let hwSuccess = false;
      // 方式一：advanced 写法（Chrome Android 主流）
      try {
        await track.applyConstraints({ advanced: [{ zoom: clamped }] });
        hwSuccess = true;
      } catch (e) {
        // 方式二：直接写法（部分国产 WebView 只认这种格式）
        try {
          await track.applyConstraints({ zoom: clamped });
          hwSuccess = true;
        } catch (e2) {
          console.warn('Hardware zoom failed, fallback to CSS zoom', e2);
        }
      }
      if (!hwSuccess) {
        hasHardwareZoom.value = false;
        applyCssZoom(clamped);
      }
    } else {
      applyCssZoom(clamped);
    }

    // 静默模式（如初始化）不弹倍率气泡
    if (!silent) {
      showZoomIndicator.value = true;
      if (zoomIndicatorTimer) clearTimeout(zoomIndicatorTimer);
      zoomIndicatorTimer = setTimeout(() => {
        showZoomIndicator.value = false;
      }, 1500);
    }
  };

  const applyCssZoom = (scale) => {
    if (videoRef.value) {
      videoRef.value.style.transform = scale === 1 ? '' : `scale(${scale})`;
      videoRef.value.style.transformOrigin = 'center center';
    }
  };

  const onZoomSliderChange = (e) => {
    applyZoom(Number(e.target.value));
  };

  // --- 捏合缩放手势 ---
  const getPinchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onVideoTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStartDistance = getPinchDistance(e.touches);
      pinchStartZoom = zoomLevel.value;
    }
  };

  const onVideoTouchMove = (e) => {
    if (e.touches.length !== 2) return;
    e.preventDefault(); // 阻止页面缩放/滚动
    const distance = getPinchDistance(e.touches);
    applyZoom(pinchStartZoom * (distance / pinchStartDistance));
  };

  // --- 4. 拍照 ---
  const takePhoto = () => {
    if (!videoRef.value || !canvasRef.value) return;

    const video = videoRef.value;
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    ctx.value = context;

    // 当使用 CSS 软件缩放时，裁剪出缩放区域以提高清晰度
    const isCssZoom = !hasHardwareZoom.value && zoomLevel.value > 1;
    if (isCssZoom) {
      // 裁剪缩放中心区域：缩放 N 倍 → 取 1/N 的中心区域
      const cropW = Math.round(video.videoWidth / zoomLevel.value);
      const cropH = Math.round(video.videoHeight / zoomLevel.value);
      const cropX = Math.round((video.videoWidth - cropW) / 2);
      const cropY = Math.round((video.videoHeight - cropH) / 2);
      canvas.width = cropW;
      canvas.height = cropH;

      if (facingMode.value === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (facingMode.value === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    context.setTransform(1, 0, 0, 1, 0, 0);

    baseImageSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);

    hasPhoto.value = true;
    isEditing.value = false;
    history.value = [];

    // 拍照后关闭闪光灯，因为预览的是静态图
    if (isFlashOn.value) {
      toggleFlash(); // 或者直接重置状态
    }
  };

  // --- 4. 编辑模式 ---
  const enterEditMode = () => {
    isEditing.value = true;
  };

  const exitEditMode = () => {
    isEditing.value = false;
  };

  // --- 5. 绘图逻辑 ---
  const getCoords = (e) => {
    const canvas = canvasRef.value;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    if (!hasPhoto.value || !isEditing.value) return;

    isDrawing.value = true;
    const { x, y } = getCoords(e);

    ctx.value.beginPath();
    ctx.value.moveTo(x, y);
    ctx.value.strokeStyle = strokeColor.value;
    ctx.value.lineWidth = strokeWidth;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';

    saveState();
  };

  const draw = (e) => {
    if (!isDrawing.value) return;
    const { x, y } = getCoords(e);
    ctx.value.lineTo(x, y);
    ctx.value.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.value) return;
    isDrawing.value = false;
    ctx.value.closePath();
  };

  const saveState = () => {
    if (!ctx.value || !canvasRef.value) return;
    const snapshot = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
    history.value.push(snapshot);
  };

  const undo = () => {
    // 隐患4修复：pop 掉当前状态后，还原到栈顶（上一步）；栈空时回到原始截图
    history.value.pop();
    if (history.value.length === 0) {
      ctx.value.putImageData(baseImageSnapshot, 0, 0);
    } else {
      ctx.value.putImageData(history.value[history.value.length - 1], 0, 0);
    }
  };

  // --- 6. 底部操作 ---
  const retakePhoto = () => {
    hasPhoto.value = false;
    isEditing.value = false;
    history.value = [];
    baseImageSnapshot = null;
    // 重拍回到取景器，还原缩放状态
    if (!hasHardwareZoom.value && zoomLevel.value > 1) {
      // 仅 CSS 软件缩放且放大时才需要应用 CSS transform
      applyCssZoom(zoomLevel.value);
    } else {
      // 硬件变焦由 track 控制，清除 CSS 变换即可
      if (videoRef.value) videoRef.value.style.transform = '';
    }
  };

  const confirmPhoto = async () => {
    if (isUploading.value) return;
    try {
      const finalImage = canvasRef.value.toDataURL('image/jpeg', 0.95);
      const file = await base64ToFile_Simple(finalImage, 'photo.jpg');
      const params = {
        file,
        data: { biz: props.biz },
      };
      isUploading.value = true;
      uploadFile(params, (res) => {
        isUploading.value = false;
        if (res.success) {
          emit('photo-taken', res.message);
        } else {
          showToast(res.message || '上传失败，照片已缓存');
          emit('photo-taken', finalImage);
        }
      }, (e) => {
        showToast('图片上传超时已缓存，请改善网络环境后提交！');
        isUploading.value = false;
        emit('photo-taken', finalImage);
      });
    } catch (e) {
      isUploading.value = false;
      showToast('上传失败，请重试');
    }
  };

  const base64ToFile_Simple = async (base64Str, fileName) => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const switchCamera = async () => {
    // 隐患3修复：先彻底停止旧流，等一帧再启动新流，避免 NotReadableError
    stopCamera();
    await nextTick();
    facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
    initCamera();
  };

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((t) => t.stop());
      stream.value = null;
    }
  };

  onMounted(initCamera);
  onUnmounted(() => {
    stopCamera();
    if (zoomIndicatorTimer) clearTimeout(zoomIndicatorTimer);
  });
</script>

<style scoped>
  .camera-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 防止 CSS 软件缩放溢出屏幕 */
  }

  .camera-video,
  .editor-canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }

  .editor-canvas.touch-enabled {
    touch-action: none;
  }

  .loading-mask,
  .error-message {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    color: #fff;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* --- UI 层级配置 --- */
  .camera-ui,
  .preview-ui,
  .editor-ui {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .camera-ui button,
  .preview-ui button,
  .editor-ui button {
    pointer-events: auto;
  }

  /* --- 顶部栏 --- */
  .top-bar {
    padding: 40px 20px 20px; /* 适配刘海屏 */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
    display: flex;
    justify-content: space-between; /* 让关闭按钮和闪光灯左右分布 */
    align-items: flex-start;
  }

  .bottom-bar {
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 50px;
  }

  .icon-btn {
    background: rgba(0, 0, 0, 0.3);
    border: none;
    color: #fff;
    padding: 10px;
    border-radius: 50%;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn.active {
    color: #f1c40f; /* 开启闪光灯后的黄色高亮 */
    background: rgba(255, 255, 255, 0.2);
  }

  .shutter-btn {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 4px solid #fff;
    background: transparent;
    padding: 4px;
  }

  .shutter-inner {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 50%;
  }

  .control-spacer {
    width: 44px;
  }

  /* --- 预览 & 编辑界面 --- */
  .preview-top-bar {
    padding: 40px 20px;
    display: flex;
    justify-content: space-between;
  }

  .edit-btn {
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    backdrop-filter: blur(4px);
  }

  .preview-bottom-bar {
    padding: 0 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .editor-top-bar {
    padding: 40px 20px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  }

  .color-palette {
    display: flex;
    gap: 12px;
  }

  .color-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .color-dot.active {
    transform: scale(1.3);
    border-color: #fff;
  }

  .editor-bottom-bar {
    padding: 0 30px 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .done-btn {
    background: #4cd964;
    color: #fff;
    border: none;
    padding: 12px 40px;
    border-radius: 30px;
    font-weight: bold;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
  }

  .action-btn {
    font-size: 16px;
    font-weight: 600;
    border: none;
    padding: 12px 32px;
    border-radius: 30px;
    cursor: pointer;
  }

  .action-btn.retake {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    backdrop-filter: blur(10px);
  }

  .action-btn.confirm {
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .upload-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  /* --- 缩放控件 --- */
  .zoom-controls {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 15;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .zoom-label-text {
    color: rgba(255, 255, 255, 0.75);
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  }

  .zoom-slider {
    /* 竖向滑块：writing-mode 在 Android Chrome 60+ 中稳定支持 */
    writing-mode: vertical-lr;
    direction: rtl;           /* rtl 使顶部为最大值、底部为最小值 */
    -webkit-appearance: slider-vertical;
    appearance: slider-vertical;
    width: 28px;
    height: 150px;
    cursor: pointer;
    accent-color: rgba(255, 255, 255, 0.9);
    opacity: 0.85;
    touch-action: none; /* 避免与页面滚动冲突 */
  }

  /* --- 缩放倍率气泡 --- */
  .zoom-indicator {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10020;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    color: #fff;
    padding: 7px 18px;
    border-radius: 22px;
    font-size: 18px;
    font-weight: bold;
    pointer-events: none;
  }

  .zoom-fade-enter-active,
  .zoom-fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .zoom-fade-enter-from,
  .zoom-fade-leave-to {
    opacity: 0;
  }
</style>
