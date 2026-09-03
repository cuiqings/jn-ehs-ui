<template>
  <div class="app-commitment-sign">
    <!-- Content Area -->
    <div class="content-wrapper">
      <div v-if="loading" class="loading-placeholder">
        <van-loading size="24px" vertical>加载中...</van-loading>
      </div>
      <div v-if="signType == '1' || signType == '3'" style="width: 794px; height: 1123px" v-html="htmlContent"></div>
      <div v-else>
        <div class="sign-title">请签署以下承诺人：</div>
        <div v-for="(name, index) in names" :key="index" class="sign-item">
          {{ name }}
        </div>
      </div>
    </div>

    <!-- Bottom Action Area -->
    <div class="bottom-action">
      <div class="btn-wrapper" v-if="(signType == '2' || signType == '1') && signStatus != '3'">
        <van-button type="primary" block round @click="handleConfirm" :loading="loading"> 确认签署 </van-button>
      </div>
    </div>
    <!-- Signature Popup -->
    <van-popup v-model:show="showSignPopup" position="bottom" :style="{ height: '50%' }" closeable round>
      <div class="sign-popup-content">
        <!-- Preview Mode -->
        <div v-if="!showSignaturePad" class="sign-preview">
          <div class="preview-title">确认签名</div>
          <img :src="imgSrc" class="sign-image" />
          <div class="preview-actions">
            <van-button plain type="primary" size="small" @click="handleReSign">重新签名</van-button>
            <van-button type="primary" size="small" @click="handleFinalConfirm">确定</van-button>
          </div>
        </div>

        <!-- Pad Mode -->
        <div v-else class="sign-pad">
          <div class="pad-title">手写签名</div>
          <van-signature
            style="width: 100%; height: 200px"
            @submit="handleSignSubmit"
            clear-button-text="重签"
            confirm-button-text="确认"
            background-color="#fff"
          />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { showToast, showSuccessToast } from 'vant';
  import { getCommitmentDetail, signCommitment, batchSignCommitment, getBatchSignList } from '../../safetyCommitment/sign/api';
  import { useUserStore } from '/@/store/modules/user';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  const htmlContent = ref('');
  const signUrl = ref('');
  const loading = ref(false);
  const recordId = ref('');
  const signType = ref('');
  const signStatus = ref('');
  const showSignPopup = ref(false);
  const showSignaturePad = ref(false);
  const names = ref<string[]>([]);

  const imgSrc = computed(() => {
    if (!signUrl.value) return '';
    return getFileAccessHttpUrl(signUrl.value);
  });

  /**
   * Initialize data
   */
  const init = async () => {
    const { id, type } = route.query;
    if (!id) {
      showToast('参数错误');
      return;
    }

    recordId.value = id as string;
    signType.value = type as string;
    loading.value = true;
    if (type == '1' || type == '3') {
      // 承诺人签字
      try {
        const res = await getCommitmentDetail({ id });
        htmlContent.value = res.htmlValue || '';
      } catch (error) {
        console.error(error);
        showToast('获取详情失败');
      } finally {
        loading.value = false;
      }
    }
    if (type == '2') {
      // 获取批量签字的承诺人
      try {
        const res = await getBatchSignList({});
        if (res && res.length > 0) {
          names.value = res;
        }
      } catch (error) {
        console.error(error);
        showToast('获取详情失败');
      } finally {
        loading.value = false;
      }
    }

    const user = userInfo.value as any;
    if (user && user.signature && !signUrl.value) {
      signUrl.value = user.signature;
    }
  };

  const base64ImgtoFile = (dataurl: string, filename = 'file') => {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)![1];
    let suffix = mime.split('/')[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime,
    });
  };

  /**
   * 提交签名图片
   * @param data 签名数据
   */
  const handleSignSubmit = (data: any) => {
    if (data.image) {
      const file = base64ImgtoFile(data.image);
      uploadFile({ file, data: { biz: 'app' } }, (res: any) => {
        if (res.success) {
          signUrl.value = res.message;
          showSignaturePad.value = false; // 签名成功后返回预览
        } else {
          showToast('上传签名失败');
        }
      });
    } else {
      showToast('请先签名');
    }
  };

  /**
   * 重新签名
   */
  const handleReSign = () => {
    showSignaturePad.value = true;
  };

  /**
   * 最终确认提交
   */
  const handleFinalConfirm = () => {
    if (!signUrl.value) {
      showToast('请先签名');
      return;
    }
    submitCommitment();
    // 签署成功后返回特定路由
    router.push({
      path: '/app/supervisor/task',
      query: {
        id: recordId.value,
        type: '3',
      },
    });
  };

  /**
   * 提交承诺书
   */
  const submitCommitment = async () => {
    showSignPopup.value = false;
    try {
      let signVal = signUrl.value;
      if (Array.isArray(signVal)) {
        signVal = (signVal as string[]).join(',');
      }
      if (signType.value == '1') {
        const params = {
          id: recordId.value,
          type: signType.value,
          sign: signVal,
        };

        await signCommitment(params);
        showSuccessToast('签署成功');
      }
      if (signType.value == '2') {
        await batchSignCommitment({
          sign: signVal,
        });
        showSuccessToast('签署成功');
      }
      setTimeout(() => {
        // 签署成功后返回特定路由
        router.push({
          path: '/app/supervisor/task',
          query: {
            id: recordId.value,
            type: '3',
          },
        });
        signType.value = '3';
        getCommitmentDetail({ id: recordId.value }).then((res) => {
          htmlContent.value = res.htmlValue || '';
          signStatus.value = res.status || '1';
        });
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 点击签署按钮
   */
  const handleConfirm = async () => {
    showSignPopup.value = true;
    if (signUrl.value) {
      showSignaturePad.value = false;
    } else {
      showSignaturePad.value = true;
    }
  };

  onMounted(() => {
    init();
  });
</script>

<style lang="less" scoped>
  .app-commitment-sign {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7f8fa;

    .content-wrapper {
      flex: 1;
      overflow: auto;
      background-color: #fff;
      position: relative;
      margin-bottom: 12px;

      .content-iframe {
        width: 100%;
        height: 100%;
        display: block;
      }

      .loading-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #969799;

        .text {
          margin-top: 8px;
          font-size: 14px;
        }
      }
    }

    .bottom-action {
      background-color: #fff;
      padding: 12px 16px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

      .sign-wrapper {
        margin-bottom: 16px;
      }

      .btn-wrapper {
        padding-bottom: constant(safe-area-inset-bottom);
        padding-bottom: env(safe-area-inset-bottom);
      }
    }

    .sign-popup-content {
      padding: 40px 16px 16px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .sign-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;

        .preview-title {
          font-size: 16px;
          font-weight: bold;
        }

        .sign-image {
          width: 100px;
          height: 100px;
          border: 1px dashed #ccc;
          background-color: #fff;
          object-fit: contain;
        }

        .preview-actions {
          display: flex;
          gap: 16px;
          width: 100%;

          .van-button {
            flex: 1;
          }
        }
      }

      .sign-pad {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .pad-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }
      }
    }
    .sign-title {
      font-size: 16px;
      font-weight: bold;
      margin: 20px;
    }
    .sign-item {
      font-size: 14px;
      margin-bottom: 10px;
      padding-left: 20px;
    }
  }
</style>
