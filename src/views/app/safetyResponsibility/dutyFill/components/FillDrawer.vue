<template>
  <div class="fill-drawer">
    <div class="scroll-wrapper">
      <!-- 基本信息显示 -->
      <div class="content-section">
        <h4 class="section-title">履职清单：</h4>
        <div class="section-content">{{ recordData.listDuties }}</div>
      </div>

      <div class="content-section">
        <h4 class="section-title">任务清单：</h4>
        <div class="section-content">{{ recordData.taskList }}</div>
      </div>

      <div class="content-section">
        <h4 class="section-title">考核标准：</h4>
        <div class="evaluation-header">
          <div class="section-content evaluation-content">
            <van-tag v-if="recordData.dataType == '0'" type="primary">常规项</van-tag>
            <van-tag v-else-if="recordData.dataType == '2'" type="success">加分项</van-tag>
            <van-tag v-else-if="recordData.dataType == '3'" type="danger">减分项</van-tag>
            <van-tag v-else-if="recordData.dataType == '1'" type="warning">自由填写项</van-tag>
            <van-tag v-else color="#666">系统获取</van-tag>
            {{ recordData.evaluationCriteria }}</div>
          <div class="score-info">得分情况：{{ userScore }} / {{ shouldScore }}</div>
        </div>

        <!-- 文件上传项循环 -->
        <van-form ref="formRef" v-if="!isView">
          <div v-for="(item, index) in fileJson" :key="index" class="upload-item">
            <div class="upload-title">{{ `第${index + 1}次上传` }}</div>
            <div class="upload-description">
              <van-field name="fileUrl" label="相关文件">
                <template #input>
                  <AppCustomizeUpload v-model:fileList="item.fileUrl" text="上传文件" :disabled="isView" />
                </template>
              </van-field>

              <!-- 加分类型 -->
              <van-field
                v-if="recordData.dataType == '2'"
                v-model="item.score"
                name="score"
                label="得分"
                type="number"
                placeholder="请输入得分"
                :min="0"
              />

              <!-- 扣分类型 -->
              <van-field
                v-if="recordData.dataType == '1' || recordData.dataType == '3'"
                v-model="item.score"
                name="score"
                label="扣分"
                type="number"
                placeholder="请输入扣分"
                :min="0"
              />
            </div>
          </div>
        </van-form>

        <!-- 查看模式 -->
        <div v-else>
          <div v-for="(item, index) in fileJson" :key="index" class="upload-item">
            <div class="upload-title">{{ `第${index + 1}次上传` }}</div>
            <div class="upload-description">
              <van-field name="fileUrl" label="相关文件">
                <template #input>
                  <AppCustomizeUpload v-model:fileList="item.fileUrl" text="上传文件" :disabled="isView" />
                </template>
              </van-field>
              <van-field readonly v-model="item.score" label="分数" v-if="item.score" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-buttons" v-if="!isView">
      <van-button size="large" @click="handleCancel">取消</van-button>
      <van-button size="large" type="primary" :loading="submitLoading" @click="handleSubmit"> 提交填报 </van-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="fill-drawer">
  import { ref, reactive } from 'vue';
  import { showToast } from 'vant';
  import AppCustomizeUpload from '../../../components/AppCustomizeUpload.vue';
  import { submitFill } from '/@/views/safetyResponsibility/dutyFill/dutyFill.api';

  /**
   * 文件上传项类型定义
   */
  interface FileItem {
    sort: number;
    fileUrl: string;
    score: number;
  }

  /**
   * 组件属性定义
   */
  interface Props {
    record: any;
    isView: boolean;
  }

  /**
   * 组件事件定义
   */
  interface Emits {
    (e: 'success'): void;
    (e: 'close'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    isView: false,
  });

  const emit = defineEmits<Emits>();

  /**
   * 响应式数据
   */
  const formRef = ref();
  const submitLoading = ref(false);
  const recordData = ref<any>({});
  const frequency = ref(0);
  const fileJson = ref<FileItem[]>([]);
  const formData = reactive({
    files: [] as any[][],
  });
  const shouldScore = ref(0);
  const userScore = ref(0);
  const isView = ref(false);

  /**
   * 获取文件名
   * @param fileUrl 文件URL
   */
  function getFileName(fileUrl: string): string {
    if (!fileUrl) return '';
    return fileUrl.split('/').pop() || fileUrl;
  }

  /**
   * 预览文件
   * @param fileUrl 文件URL
   */
  function previewFile(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      showToast('文件无法预览');
    }
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      submitLoading.value = true;

      // 计算完成数量
      let finishNum = 0;
      for (let i = 0; i < fileJson.value.length; i++) {
        const item = fileJson.value[i];
        if (item.fileUrl && item.fileUrl.length > 0) {
          finishNum++;
        }
      }

      // 计算用户得分
      let calculatedUserScore = 0;
      if (recordData.value.dataType == '0') {
        calculatedUserScore = Number(recordData.value.scoreEveryTime) * finishNum;
      }

      // 构建提交参数
      const params = {
        id: recordData.value.id,
        fileJson: fileJson.value,
        finishNum: finishNum,
        userScore: calculatedUserScore,
      };

      // 调用提交API
      await submitFill(params);

      showToast('提交成功');
      emit('success');
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败，请重试');
    } finally {
      submitLoading.value = false;
    }
  }

  /**
   * 取消操作
   */
  function handleCancel() {
    emit('close');
  }

  /**
   * 初始化数据
   */
  function initData() {
    if (props.record) {
      recordData.value = props.record;
      isView.value = props.isView;

      // 初始化频次
      frequency.value = Number(recordData.value.frequency) || 0;

      // 初始化文件上传项
      const fileJsonData: FileItem[] = [];
      for (let i = 0; i < frequency.value; i++) {
        fileJsonData.push({
          sort: i + 1,
          fileUrl: '',
          score: 0,
        });
      }

      // 如果有已填报的数据，则填充
      if (recordData.value.fileJson) {
        let existingFiles: any[] = [];
        try {
          existingFiles = typeof recordData.value.fileJson === 'string' ? JSON.parse(recordData.value.fileJson) : recordData.value.fileJson;
        } catch (e) {
          console.warn('文件数据解析失败:', e);
        }

        existingFiles.forEach((file: any, index: number) => {
          if (index < fileJsonData.length && file) {
            fileJsonData[index] = {
              ...fileJsonData[index],
              ...file,
            };
          }
        });
      }

      fileJson.value = fileJsonData;

      // 计算应得分数和用户得分
      shouldScore.value = Number(recordData.value.shouldScore) || 0;
      userScore.value = Number(recordData.value.userScore) || 0;
    }
  }

  /**
   * 组件初始化
   */
  initData();
</script>

<style scoped lang="less">
  .fill-drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    overflow: hidden;

    .scroll-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .footer-buttons {
      padding: 16px;
      background-color: #fff;
      display: flex;
      gap: 16px;
      margin-top: auto;

      .van-button {
        flex: 1;
      }
    }

    .attachment-list {
      .attachment-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        color: #1989fa;

        .van-icon {
          margin-right: 8px;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          text-decoration: underline;
        }

        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
      }
    }
  }

  :deep(.van-form) {
    background-color: #fff;

    .van-field {
      padding: 12px 16px;

      &:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
    }
  }

  :deep(.van-radio-group) {
    display: flex;
    gap: 16px;
  }

  :deep(.van-field__label) {
    font-weight: 500;
    color: #333;
  }
  :deep(.van-field__control) {
    color: #666;
  }
</style>
