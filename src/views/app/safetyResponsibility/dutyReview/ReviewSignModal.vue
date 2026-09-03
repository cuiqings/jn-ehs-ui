<template>
  <van-popup v-model:show="visible" position="bottom" :style="{ height: '70%' }" round closeable close-icon-position="top-right" @close="handleClose">
    <div class="review-sign-modal">
      <!-- 标题栏 -->
      <div class="modal-header">
        <h3 class="modal-title">审核签字</h3>
      </div>

      <!-- 内容区域 -->
      <div class="modal-content">
        <!-- 手写签名 -->
        <div class="form-section">
          <div class="form-label required">手写签名</div>
          <div class="signature-container">
            <!-- 显示已有签名或签名预览 -->
            <div v-if="signatureUrl" class="signature-preview">
              <img :src="signatureUrl" alt="签名" class="signature-image" @click="previewSignature" />
              <div class="signature-actions">
                <van-button size="small" type="default" @click="clearSignature">清除签名</van-button>
                <van-button size="small" type="primary" @click="openSignatureModal">重新签名</van-button>
              </div>
            </div>
            <!-- 未签名状态 -->
            <div v-else class="signature-empty">
              <van-button type="primary" @click="openSignatureModal" class="sign-button">
                <van-icon name="edit" />
                点击进行手写签名
              </van-button>
              <div class="signature-tip"> 请在签名板上进行手写签名 </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="modal-footer">
        <van-button block @click="handleClose">取消</van-button>
        <van-button type="primary" block @click="handleSubmit" :loading="submitLoading" :disabled="!canSubmit"> 确认提交 </van-button>
      </div>
    </div>

    <!-- 手写签名弹窗 -->
    <van-popup
      v-model:show="showSignatureModal"
      position="center"
      :style="{ width: '90%' }"
      round
      closeable
      close-icon-position="top-right"
      @close="closeSignatureModal"
    >
      <div class="signature-modal">
        <div class="signature-header">
          <h3>手写签名</h3>
        </div>
        <div class="signature-content">
          <van-signature
            ref="signatureRef"
            :pen-color="'#000'"
            :line-width="3"
            background-color="#fff"
            clear-button-text="清除"
            confirm-button-text="确认"
            @submit="onSignatureSubmit"
            @clear="onSignatureClear"
          />
        </div>
      </div>
    </van-popup>

    <!-- 图片预览 -->
    <van-image-preview v-model:show="showPreview" :images="previewImages" :start-position="previewIndex" />
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { showToast, showConfirmDialog } from 'vant';
  import { auditRecord, auditBatch } from './dutyReview.api';
  import { useUserStore } from '/@/store/modules/user';
  import { uploadFile } from '/@/api/common/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  interface Props {
    show: boolean;
    data: {
      id?: string | number;
      auditData?: any[];
    } | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    show: false,
    data: null,
  });

  const emit = defineEmits(['update:show', 'success']);

  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);

  // 响应式数据
  const visible = computed({
    get: () => props.show,
    set: (value) => emit('update:show', value),
  });

  const formData = ref({});

  // 签名相关
  const signatureUrl = ref<string>('');
  const signatureFile = ref<string>('');
  const showSignatureModal = ref(false);
  const signatureRef = ref();

  const submitLoading = ref(false);
  const showPreview = ref(false);
  const previewImages = ref<string[]>([]);
  const previewIndex = ref(0);

  // 计算属性
  const canSubmit = computed(() => {
    return signatureFile.value;
  });

  // 监听弹窗显示状态
  watch(
    () => props.show,
    (newVal) => {
      if (newVal) {
        resetForm();
        initUserSignature();
      }
    }
  );

  /**
   * 重置表单
   */
  const resetForm = () => {
    formData.value = {};
    signatureUrl.value = '';
    signatureFile.value = '';
  };

  /**
   * 初始化用户签名
   */
  const initUserSignature = () => {
    // 如果用户有已保存的签名，则显示
    if (userInfo.value.signature) {
      if (/^http/i.test(userInfo.value.signature)) {
        signatureUrl.value = userInfo.value.signature;
      } else {
        signatureUrl.value = getFileAccessHttpUrl(userInfo.value.signature);
      }
      signatureFile.value = userInfo.value.signature;
    }
  };

  /**
   * 打开签名弹窗
   */
  const openSignatureModal = () => {
    showSignatureModal.value = true;
  };

  /**
   * 关闭签名弹窗
   */
  const closeSignatureModal = () => {
    showSignatureModal.value = false;
  };

  /**
   * 签名提交处理
   */
  const onSignatureSubmit = (data: any) => {
    if (data.image) {
      // 将base64转换为文件并上传
      const file = base64ToFile(data.image, 'signature.png');
      uploadFile({ file, data: { biz: 'signature' } }, (res: any) => {
        if (res.success) {
          signatureFile.value = res.message;
          signatureUrl.value = getFileAccessHttpUrl(res.message);
          showToast('签名保存成功');
          closeSignatureModal();
        } else {
          showToast('签名保存失败，请重试');
        }
      });
    } else {
      showToast('请先进行签名');
    }
  };

  /**
   * 清除签名板内容
   */
  const onSignatureClear = () => {
    // 签名板清除事件
  };

  /**
   * 清除已保存的签名
   */
  const clearSignature = () => {
    showConfirmDialog({
      title: '确认清除',
      message: '确定要清除当前签名吗？',
    })
      .then(() => {
        signatureUrl.value = '';
        signatureFile.value = '';
        showToast('签名已清除');
      })
      .catch(() => {});
  };

  /**
   * 预览签名
   */
  const previewSignature = () => {
    if (signatureUrl.value) {
      previewImages.value = [signatureUrl.value];
      previewIndex.value = 0;
      showPreview.value = true;
    }
  };

  /**
   * 将base64转换为文件
   */
  const base64ToFile = (dataurl: string, filename: string = 'file') => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const suffix = mime.split('/')[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime,
    });
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    visible.value = false;
  };

  /**
   * 提交审核
   */
  const handleSubmit = async () => {
    if (!canSubmit.value) {
      showToast('请完善必填信息');
      return;
    }

    try {
      await showConfirmDialog({
        title: '确认提交',
        message: '提交后将无法修改，确认要提交审核吗？',
      });

      submitLoading.value = true;

      // 构建提交数据
      const submitData: any = {
        sign: signatureFile.value, // 签字文件
        auditData: props.data?.auditData,
        id: props.data?.id,
      };
      await auditRecord(submitData);
      showToast('审核提交成功');
      emit('success');
      handleClose();
      // 返回审核列表
      router.push({
        path: '/app/safetyResponsibility/dutyReview',
      });
    } catch (error) {
      console.error('审核提交失败:', error);
      showToast('审核提交失败，请重试');
    } finally {
      submitLoading.value = false;
    }
  };
</script>

<style lang="less" scoped>
  .review-sign-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;

    .modal-header {
      background: white;
      padding: 16px;
      border-bottom: 1px solid #eee;
      text-align: center;

      .modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;

      .form-section {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .form-label {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          position: relative;

          &.required::after {
            content: '*';
            color: #ee0a24;
            margin-left: 4px;
          }
        }

        :deep(.van-field) {
          padding: 0;
          background: #f8f9fa;
          border-radius: 6px;

          .van-field__control {
            padding: 12px;
          }
        }

        .signature-container {
          .signature-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;

            .signature-image {
              max-width: 200px;
              max-height: 100px;
              border: 1px solid #ddd;
              border-radius: 8px;
              cursor: pointer;
              transition: border-color 0.3s;

              &:hover {
                border-color: #1989fa;
              }
            }

            .signature-actions {
              display: flex;
              gap: 8px;
            }
          }

          .signature-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 20px;
            border: 2px dashed #ddd;
            border-radius: 8px;
            background: #fafafa;

            .sign-button {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
            }

            .signature-tip {
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          }
        }
      }
    }

    .modal-footer {
      background: white;
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 12px;

      .van-button {
        flex: 1;
      }
    }
  }
  // 手写签名弹窗样式
  .signature-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    overflow: hidden;

    .signature-header {
      padding: 20px 16px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #2c3e50;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }

    .signature-content {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;

      :deep(.van-signature) {
        width: 100%;
        height: 100%;
        border: 2px solid #3498db;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 49%, rgba(52, 152, 219, 0.05) 50%, transparent 51%);
          pointer-events: none;
        }

        &:hover {
          border-color: #2980b9;
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .van-signature__content {
          border-radius: 10px;
        }

        .van-signature__footer {
          background: rgba(248, 249, 250, 0.95);
          backdrop-filter: blur(5px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 12px 16px;
          border-radius: 0 0 10px 10px;
          .van-button {
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            &--default {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border: 1px solid #dee2e6;
              color: #6c757d;

              &:hover {
                background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
              }
            }

            &--primary {
              background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
              border: none;
              color: white;

              &:hover {
                background: linear-gradient(135deg, #2980b9 0%, #1f5f8b 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
              }
            }
          }
        }
      }
    }
  }
</style>
