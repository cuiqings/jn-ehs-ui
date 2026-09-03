<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="安全责任履职填报"
    :width="800"
    @ok="handleSubmit"
    :show-footer="true"
    :show-ok-btn="true"
    ok-text="提交填报"
    :confirm-loading="submitLoading"
    destroyOnClose
  >
    <div class="fill-drawer-content">
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
        <div>
          <div v-if="recordData.dataType == '0'">
            <div class="evaluation-header">
              <div class="section-content evaluation-content">
                <a-tag color="blue">常规项</a-tag>
                {{ recordData.evaluationCriteria }}</div
              >
              <div class="score-info">得分情况：{{ getNormalUserScore() }} / {{ shouldScore }}</div>
            </div>
          </div>
          <div v-else>
            <div class="evaluation-header">
              <div class="section-content evaluation-content">
                <a-tag v-if="recordData.dataType == '2'" color="green">加分项</a-tag>
                <a-tag v-else-if="recordData.dataType == '3'" color="red">减分项</a-tag>
                <a-tag v-else-if="recordData.dataType == '1'" color="orange">自由填写项</a-tag>
                <a-tag v-else color="gray">系统获取</a-tag>
                {{ recordData.evaluationCriteria }}</div
              >
              <div class="score-info">得分情况：{{ recordData.userScore }} / {{ recordData.scored }}</div>
            </div>
          </div>

          <div v-if="recordData.dataType == '0' || recordData.dataType == '1' || recordData.dataType == '2' || recordData.dataType == '3'">
            <a-form ref="formRef" :model="formData" :rules="formRules">
              <!-- 循环显示文件上传项 -->
              <div v-for="(item, index) in fileJson" :key="index" class="upload-item">
                <div class="upload-title">{{ `第${index + 1}次上传` }}</div>
                <div class="upload-description">
                  <a-form-item label="相关文件" :label-col="labelCol" :wrapper-col="wrapperCol">
                    <JUpload :disabled="isView" text="上传文件" v-model:value="item.fileUrl" />
                  </a-form-item>
                  <a-row v-if="recordData.dataType == '0'" v-show="item.back">
                    <a-col :span="2">
                      <div style="line-height: 32px"> <a-checkbox disabled v-model:checked="item.back" />&nbsp;退回 </div></a-col
                    >
                    <a-col v-show="item.back" :span="12"> <a-input disabled v-model:value="item.backReason" placeholder="请输入原因" /></a-col>
                  </a-row>
                  <div v-if="recordData.dataType == '2'">
                    <a-form-item label="得分" :label-col="labelCol" :wrapper-col="wrapperCol">
                      <a-input-number style="width: 80px" :min="0" v-model:value="item.score" placeholder="请输入得分" />
                    </a-form-item>
                  </div>
                  <div v-if="recordData.dataType == '1' || recordData.dataType == '3'">
                    <a-form-item label="扣分" :label-col="labelCol" :wrapper-col="wrapperCol">
                      <a-input-number style="width: 80px" :min="0" v-model:value="item.score" placeholder="请输入扣分" />
                    </a-form-item>
                  </div>
                  <div v-if="recordData.dataType > 3">
                    {{ recordData.systemInfo }}
                  </div>
                </div>
              </div>
            </a-form>
          </div>
          <div v-else style="margin-left: 20px">
            {{ recordData.systemInfo }}
          </div>
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>

<script setup name="fill-drawer" lang="ts">
  import { ref, reactive } from 'vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { UploadOutlined, FileOutlined } from '@ant-design/icons-vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { submitFill } from './dutyFill.api';
  const emit = defineEmits(['success', 'close']);
  const { createMessage } = useMessage();

  const submitLoading = ref(false);
  const formRef = ref();
  const recordData = ref<any>({});
  const frequency = ref(0);
  const labelCol = ref({
    span: 5,
  });
  const wrapperCol = ref({
    span: 18,
  });
  // 定义文件上传项的类型接口
  interface FileItem {
    sort: number;
    fileUrl: string;
    score: number;
    back: boolean;
    backReason: string;
  }

  const fileJson = ref<FileItem[]>([]);
  const formData = reactive({
    files: [] as any[][],
  });
  const shouldScore = ref(0);
  const userScore = ref(0);
  const isView = ref(false);
  /**
   * 表单验证规则
   */
  const formRules = {};
  /**
   * 使用useDrawerInner处理抽屉内部逻辑
   */
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner((data) => {
    console.log('useDrawerInner data', data);
    setDrawerProps({ confirmLoading: false, showCancelBtn: !data?.isView, showOkBtn: !data?.isView });
    recordData.value = data.record || {};
    isView.value = !!data?.isView;
    fileJson.value = [];
    // 次数
    frequency.value = recordData.value.frequency || 0;
    // 得分
    userScore.value = recordData.value.userScore || 0;
    // 应得分
    if (recordData.value.dataType == '0') {
      shouldScore.value = Number(recordData.value.scoreEveryTime) * frequency.value;
    }
    // frequency.value是一个整数，根据它的值，构建fileJson
    if (
      recordData.value.dataType == '0' ||
      recordData.value.dataType == '1' ||
      recordData.value.dataType == '2' ||
      recordData.value.dataType == '3'
    ) {
      if (recordData.value.fileJson && recordData.value.fileJson.length > 0) {
        fileJson.value = recordData.value.fileJson;
      } else {
        for (let i = 0; i < frequency.value; i++) {
          fileJson.value.push({
            sort: i + 1,
            fileUrl: '',
            score: 0,
          });
        }
      }
    } else {
      fileJson.value = [];
    }
    setDrawerProps({ confirmLoading: false });
  });
  /**
   * 计算普通用户得分
   * @param itemCase 考核项目数据
   * @returns 普通用户得分
   */
  const getNormalUserScore = () => {
    if (fileJson.value.length == 0) {
      return 0;
    }

    let normalUserScore = 0;
    fileJson.value.forEach((item: any) => {
      if (item.fileUrl && !item.back) {
        normalUserScore += Number(recordData.value.scoreEveryTime);
      }
    });
    userScore.value = normalUserScore;
    return normalUserScore;
  };

  /**
   * 关闭抽屉
   */
  function handleClose() {
    formRef.value?.resetFields();
    isView.value = false;
    closeDrawer();
    emit('close');
  }
  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      // 验证表单
      // await formRef.value?.validate();
      let finishNum = 0;
      for (let i = 0; i < fileJson.value.length; i++) {
        const item = fileJson.value[i];
        if (item.fileUrl && item.fileUrl.length > 0) {
          finishNum++;
        }
      }
      let userScore = 0;
      if (recordData.value.dataType == '0') {
        userScore = Number(recordData.value.scoreEveryTime) * finishNum;
      }
      let params = {
        id: recordData.value.id,
        fileJson: fileJson.value,
        finishNum: finishNum,
        userScore: userScore,
      };

      // TODO: 调用API提交数据
      await submitFill(params);

      closeDrawer();
      emit('success');
    } catch (error) {
      console.error('提交失败:', error);
      createMessage.error('提交失败，请重试');
    } finally {
      submitLoading.value = false;
    }
  }

  // 暴露方法给父组件
  defineExpose({
    registerDrawer,
  });
</script>

<style scoped lang="less">
  .fill-drawer-content {
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 8px;
  }

  .content-section {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #ffffff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:first-child {
      margin-top: 16px;
    }
  }

  .section-title {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: #262626;
    font-size: 16px;
  }

  .section-content {
    color: #595959;
    line-height: 1.6;
    padding: 8px 12px;
    background-color: #fafafa;
    border-radius: 4px;
    border-left: 3px solid #1890ff;
  }

  .evaluation-section {
    background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
    border: 1px solid #91d5ff;
  }

  .evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 12px;
    background-color: rgba(24, 144, 255, 0.1);
    border-radius: 4px;
  }

  .score-info {
    color: #ee0a24;
    font-weight: 600;
    font-size: 14px;
    background-color: #fff2f0;
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid #ffccc7;
    width: 140px;
    margin-left: 5px;
  }

  .evaluation-content {
    width: 625px;
    background-color: #ffffff;
    border-left: 3px solid #52c41a;
  }

  .upload-item {
    margin: 16px;
    padding: 16px;
    background-color: #ffffff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .upload-title {
      margin-bottom: 12px;
      font-weight: 600;
      color: #262626;
      font-size: 15px;
      padding: 8px 12px;
      background-color: #f0f2f5;
      border-radius: 4px;
      border-left: 3px solid #722ed1;
    }

    .upload-description {
      margin-left: 2px;
    }
  }
  :deep(.ant-tag) {
    margin-right: 0px;
  }
</style>
