<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '70%' }"
    round
    closeable
    close-icon-position="top-right"
    @close="onClose"
  >
    <div class="self-sign-popup">
      <div class="popup-header">
        <h3>本人签字</h3>
      </div>
      
      <div class="popup-content">
        <div class="promise-text">
          <p>本人承诺：</p>
          <p>1. 以上填写的个人信息真实有效；</p>
          <p>2. 将严格遵守安全生产规章制度；</p>
          <p>3. 积极参加安全培训，提高安全意识；</p>
          <p>4. 如实报告安全隐患和事故。</p>
        </div>
        
        <van-form @submit="onSubmit" ref="formRef">
          <van-field name="signature" label="本人签字" required>
            <template #input>
              <div class="signature-container">
                <!-- 显示已有签名 -->
                <div v-if="currentSignature" class="signature-display">
                  <img 
                    :src="currentSignature" 
                    alt="签名" 
                    class="signature-image"
                    @click="previewSignature"
                  />
                  <div class="signature-actions">
                    <van-button 
                      type="default" 
                      size="small" 
                      @click="openSignModal"
                    >
                      重新签名
                    </van-button>
                  </div>
                </div>
                
                <!-- 无签名时显示签名按钮 -->
                <div v-else class="no-signature">
                  <van-button 
                    type="primary" 
                    @click="openSignModal"
                    block
                  >
                    手写签名
                  </van-button>
                </div>
              </div>
            </template>
          </van-field>
          
          <div class="form-actions">
            <van-button 
              round 
              block 
              type="primary" 
              native-type="submit" 
              :loading="loading"
              :disabled="!currentSignature"
            >
              确认签字
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </van-popup>
  
  <!-- 手写签名弹窗 -->
  <van-popup
    v-model:show="showSignModal"
    position="center"
    :style="{ width: '90%', height: '50%' }"
    round
    closeable
    @close="closeSignModal"
  >
    <div class="sign-modal">
      <div class="sign-header">
        <h3>手写签名</h3>
      </div>
      <div class="sign-content">
        <van-signature
          ref="signatureRef"
          :pen-color="'#000'"
          :line-width="3"
          background-color="#f8f9fa"
          clear-button-text="重新签字"
          @clear="onClearSignature"
          @submit="onSignatureSubmit"
        />
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { useUserStore } from '/@/store/modules/user'
import { uploadFile } from '/@/api/common/api'
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils'
import { addSelfSign } from '/@/views/education/trainingManage/archive/archive.api'

interface Props {
  show: boolean
  personData: any
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 用户信息
const userStore: any = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loading = ref(false)
const signLoading = ref(false)
const formRef = ref()
const signatureRef = ref()
const showSignModal = ref(false)
const currentSignature = ref('')
const originSignature = ref('')

/**
 * 初始化签名数据
 */
const initSignature = (personData: any) => {
  // 优先使用个人档案中的签名
  if (personData && personData.userSign) {
    currentSignature.value = /^http/i.test(personData.userSign) 
      ? personData.userSign 
      : getFileAccessHttpUrl(personData.userSign);
    originSignature.value = personData.userSign
  } 
  // 如果个人档案没有签名，则使用用户信息中的签名
  else if (userInfo.value.signature && /^http/i.test(userInfo.value.signature)) {
    currentSignature.value = userInfo.value.signature
    originSignature.value = userInfo.value.signature
  } 
  // 都没有则为空
  else {
    currentSignature.value = ''
  }
}

/**
 * 监听personData变化，初始化签名数据
 */
watch(
  () => props.personData,
  (newData) => {
    initSignature(newData)
  },
  { immediate: true, deep: true }
)

/**
 * 关闭弹窗
 */
const onClose = () => {
  visible.value = false
}

/**
 * 打开手写签名弹窗
 */
const openSignModal = () => {
  showSignModal.value = true
}

/**
 * 关闭手写签名弹窗
 */
const closeSignModal = () => {
  showSignModal.value = false
}

/**
 * 清除签名
 */
const onClearSignature = () => {
  // van-signature组件会自动清除画布
}

/**
 * 手写签名提交（van-signature的submit事件）
 */
const onSignatureSubmit = (data: any) => {
  if (data.image) {
    confirmSignature(data.image)
  }
}

/**
 * 确认手写签名
 */
const confirmSignature = async (imageData?: string) => {
  try {
    signLoading.value = true
    
    // 如果没有传入图片数据，从签名组件获取
    let signatureData = imageData
    if (!signatureData && signatureRef.value) {
      const result = signatureRef.value.submit()
      if (!result || !result.image) {
        showToast('请先签名')
        return
      }
      signatureData = result.image
    }
    
    if (!signatureData) {
      showToast('请先签名')
      return
    }
    
    // 将base64转换为文件并上传
    const file = base64ToFile(signatureData, 'signature')
    
    const uploadResult = await new Promise((resolve, reject) => {
      uploadFile(
        { file, data: { biz: 'app' } },
        (res: any) => {
          if (res.success) {
            resolve(res.message)
          } else {
            reject(new Error(res.message || '上传失败'))
          }
        }
      )
    })
    originSignature.value = uploadResult as string;
    // 更新当前签名
    currentSignature.value = getFileAccessHttpUrl(uploadResult as string)
    
    showToast('签名成功')
    closeSignModal()
  } catch (error) {
    console.error('签名失败:', error)
    showToast('签名失败')
  } finally {
    signLoading.value = false
  }
}

/**
 * 预览签名
 */
const previewSignature = () => {
  if (currentSignature.value) {
    showImagePreview([currentSignature.value])
  }
}

/**
 * 提交签字
 */
const onSubmit = async () => {
  if (!currentSignature.value) {
    showToast('请先签名')
    return
  }
  
  try {
    loading.value = true
    
    await addSelfSign({
      id: props.personData.id,
      sign: originSignature.value
    })
    
    showToast('签字成功')
    emit('confirm')
    onClose()
  } catch (error) {
    console.error('签字失败:', error)
    showToast('签字失败')
  } finally {
    loading.value = false
  }
}

/**
 * 将base64转换为文件
 */
const base64ToFile = (dataurl: string, filename = 'file') => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const suffix = mime.split('/')[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime,
  })
}
</script>

<style lang="less" scoped>
.self-sign-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    text-align: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .promise-text {
      background: #f7f8fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      
      p {
        margin: 8px 0;
        line-height: 1.6;
        color: #323233;
        
        &:first-child {
          font-weight: bold;
          margin-bottom: 12px;
        }
      }
    }

    :deep(.van-field__label) {
      width: 80px;
      flex: none;
    }

    .signature-container {
      .signature-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        
        .signature-image {
          max-width: 200px;
          max-height: 100px;
          border: 1px solid #eee;
          border-radius: 8px;
          cursor: pointer;
          object-fit: contain;
        }
        
        .signature-actions {
          display: flex;
          gap: 8px;
        }
      }
      
      .no-signature {
        padding: 20px 0;
      }
    }

    .form-actions {
      padding: 20px 0;
      margin-top: 20px;
    }
  }
}

// 手写签名弹窗样式
.sign-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .sign-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    text-align: center;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }
  
  .sign-content {
    flex: 1;
    padding: 16px;
    
    :deep(.van-signature) {
      width: 100%;
      height: 100%;
      border: 1px solid #dcdee0;
      border-radius: 8px;
    }
  }
  
  .sign-actions {
    padding: 16px;
    display: flex;
    justify-content: center;
    border-top: 1px solid #eee;
  }
}
</style>
