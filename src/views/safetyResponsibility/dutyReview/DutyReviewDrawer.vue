<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" width="900" :show-footer="false" destroyOnClose>
    <!-- 评分表格 -->
    <div class="score-container">
      <div class="score-table-wrapper">
        <table class="score-table">
          <thead>
            <tr>
              <th style="width: 200px">得分</th>
              <th style="width: 200px">结果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span v-if="Number(detailData.score) <= 75" style="color: #f50">{{ detailData.score }}</span>
                <span v-if="Number(detailData.score) > 75 && Number(detailData.score) <= 85" style="color: #87d068">{{ detailData.score }}</span>
                <span v-if="Number(detailData.score) > 85" style="color: #2db7f5">{{ detailData.score }}</span>
              </td>
              <td>
                <a-tag v-if="detailData.result == '不合格'" color="#f50">不合格</a-tag>
                <a-tag v-if="detailData.result == '合格'" color="#87d068">合格</a-tag>
                <a-tag v-if="detailData.result == '基本合格'" color="#2db7f5">基本合格</a-tag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <a-tabs v-model:activeKey="activeKey" @change="changeTab(activeKey)">
        type="card">
        <a-tab-pane v-for="(item, index) in detailData.itemList" :key="index + 1 + ''" :tab="`第${index + 1}条`">
          <div class="fill-drawer-content">
            <div class="content-section">
              <h4 class="section-title">履职清单：</h4>
              <div class="section-content">{{ item.listDuties }}</div>
            </div>
            <div class="content-section">
              <h4 class="section-title">任务清单：</h4>
              <div class="section-content">{{ item.taskList }}</div>
            </div>

            <div class="content-section">
              <h4 class="section-title">考核标准：</h4>
              <div v-for="(itemCase, indexCase) in item.childList">
                <div class="evaluation-header">
                  <div class="section-content evaluation-content">
                    <a-tag v-if="itemCase.dataType == '0'" color="blue">常规项</a-tag>
                    <a-tag v-else-if="itemCase.dataType == '2'" color="green">加分项</a-tag>
                    <a-tag v-else-if="itemCase.dataType == '3'" color="red">减分项</a-tag>
                    <a-tag v-else-if="itemCase.dataType == '1'" color="orange">自由填写项</a-tag>
                    <a-tag v-else color="gray">系统获取</a-tag>
                    {{ itemCase.evaluationCriteria }}</div
                  >
                  <div v-if="itemCase.dataType == '0'" class="score-info">得分情况：{{ getNormalUserScore(itemCase) }} / {{ itemCase.scored }}</div>
                  <div v-if="itemCase.dataType == '1' || itemCase.dataType == '3'" class="score-info"
                    >得分情况：{{ (itemCase.scored || 0) - getTotalReduceScore(itemCase) }} / {{ itemCase.scored }}</div
                  >
                  <div v-if="itemCase.dataType == '2'" class="score-info">得分情况：{{ getTotalAddScore(itemCase) }}</div>
                </div>
                <div v-if="itemCase.dataType == '0' || itemCase.dataType == '1' || itemCase.dataType == '2' || itemCase.dataType == '3'">
                  <a-form ref="formRef">
                    <!-- 循环显示文件上传项 -->
                    <div v-for="(item1, indexFile) in itemCase.fileJson" :key="item1.sort" class="upload-item">
                      <div class="upload-title"
                        ><span>第{{ indexFile + 1 }}次上传</span>
                        <van-icon
                          v-if="itemCase.dataType != '0' && showFooter"
                          name="cross"
                          class="delete-icon"
                          @click="removeUploadItem(itemCase, indexFile)"
                      /></div>
                      <div class="upload-description">
                        <a-form-item label="相关文件" :label-col="labelCol" :wrapper-col="wrapperCol">
                          <JUpload :disabled="!showFooter" text="上传文件" v-model:value="item1.fileUrl" />
                        </a-form-item>
                        <a-row v-show="item1.fileUrl">
                          <a-col :span="2">
                            <div style="line-height: 32px"> <a-checkbox v-model:checked="item1.back" />&nbsp;退回 </div></a-col
                          >
                          <a-col v-show="item1.back" :span="12"> <a-input v-model:value="item1.backReason" placeholder="请输入原因" /></a-col>
                        </a-row>
                        <div v-if="itemCase.dataType == '2'">
                          <a-form-item label="得分" :label-col="labelCol" :wrapper-col="wrapperCol">
                            <a-input-number
                              :disabled="!showFooter"
                              style="width: 80px"
                              :min="0"
                              v-model:value="item1.score"
                              placeholder="请输入得分"
                            />
                          </a-form-item>
                          <a-form-item label="原因" :label-col="labelCol" :wrapper-col="wrapperCol">
                            <a-textarea :disabled="!showFooter" v-model:value="item1.reason" placeholder="请输入原因" :rows="2" />
                          </a-form-item>
                        </div>
                        <div v-if="itemCase.dataType == '1' || itemCase.dataType == '3'">
                          <a-form-item label="扣分" :label-col="labelCol" :wrapper-col="wrapperCol">
                            <a-input-number
                              :disabled="!showFooter"
                              style="width: 80px"
                              :min="0"
                              v-model:value="item1.score"
                              placeholder="请输入扣分"
                              @change="handleReduceScoreChange(itemCase, indexCase, index)"
                            />
                          </a-form-item>
                          <a-form-item label="原因" :label-col="labelCol" :wrapper-col="wrapperCol">
                            <a-textarea :disabled="!showFooter" v-model:value="item1.reason" placeholder="请输入原因" :rows="2" />
                          </a-form-item>
                        </div>
                      </div>
                    </div>
                  </a-form>
                  <!-- 添加按钮 -->
                  <a-button class="add-btn" size="small" type="primary" ghost v-if="itemCase.dataType != '0'" @click="addUploadItem(itemCase)"
                    >+ 添加</a-button
                  >
                </div>

                <div v-else style="margin-left: 20px">{{ itemCase.systemInfo }}</div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <template #footer>
      <div v-if="showFooter" style="margin-top: 15px">
        <a-space>
          <a-button @click="closeDrawer">取消</a-button>
          <a-button type="primary" @click="handleSave" :loading="saveLoading">保存</a-button>
          <a-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</a-button>
        </a-space>
      </div>
    </template>
    <ReviewSignModal @register="registerReviewSignModal" @success="handleSignSuccess" />
  </BasicDrawer>
</template>
<script setup lang="ts">
  import { ref, createVNode } from 'vue';
  const { createMessage } = useMessage();
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { getDetail, auditRecord, saveRecord } from './dutyReview.api';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import ReviewSignModal from './ReviewSignModal.vue';
  import { Modal } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  const emit = defineEmits(['success', 'register']);
  const title = ref('履职审核');
  const showFooter = ref(true);
  const detailData = ref<any>({});
  const activeKey = ref('1');
  const oldActiveKey = ref('1');
  const reviewId = ref('');
  const saveLoading = ref(false);
  const submitLoading = ref(false);
  const labelCol = ref({
    span: 5,
  });
  const wrapperCol = ref({
    span: 18,
  });

  const [registerReviewSignModal, { openModal: openReviewSignModal }] = useModal();

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner((data) => {
    console.log('useDrawerInner data', data);
    setDrawerProps({ confirmLoading: false });
    activeKey.value = '1';
    showFooter.value = data.showFooter;
    if (!data.showFooter) {
      title.value = '履职详情';
    } else {
      title.value = '履职审核';
    }
    reviewId.value = data.record.id;
    getDetail({ id: data.record.id }).then((res) => {
      console.log('getDetail res', res);
      detailData.value = res;
    });
    setDrawerProps({ confirmLoading: false });
  });

  const changeTab = (e) => {
    let message = checkBackReason();
    if (message != '') {
      Modal.error({
        title: '提示：',
        content: message,
      });
      //如果没有填写，tab还是原来的
      console.log(e);
      activeKey.value = oldActiveKey.value;
      return;
    }
    oldActiveKey.value = activeKey.value;
  };

  const checkBackReason = () => {
    let message = '';
    detailData.value.itemList.forEach((item) => {
      item.childList.forEach((item) => {
        if (item.dataType == '0') {
          item.fileJson.forEach((item) => {
            if (item.back && item.backReason == null) {
              message = '请填写退回原因！';
            }
          });
        }
      });
    });
    return message;
  };
  const handleSubmit = () => {
    if (checkFirstTab()) {
      createMessage.warning('请填写退回原因');
      return;
    }
    Modal.confirm({
      title: '提示：',
      icon: createVNode(ExclamationCircleOutlined),
      content: createVNode('div', { style: 'font-size:14px;' }, '提交后将不能再进行填写，确认仍要提交？'),
      onOk() {
        // 打开签字弹窗
        openReviewSignModal(true, {
          id: reviewId.value,
          auditData: detailData.value.itemList,
          isBatch: false,
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  };
  const handleSave = () => {
    if (checkFirstTab()) {
      createMessage.warning('请填写退回原因');
      return;
    }
    setDrawerProps({ confirmLoading: true });
    saveLoading.value = true;
    saveRecord({ id: reviewId.value, auditData: detailData.value.itemList }).then(() => {
      setDrawerProps({ confirmLoading: false });
      saveLoading.value = false;
      closeDrawer();
      emit('success');
    });
  };

  // 校验在第一个tab页填写数据提交验证
  const checkFirstTab = () => {
    let message = checkBackReason();
    return message != '';
  };
  /**
   * 添加文件上传项
   * @param itemCase 考核项目数据
   */
  const addUploadItem = (itemCase: any) => {
    // 安全检查：确保fileJson存在，如果不存在则初始化为空数组
    if (!itemCase.fileJson) {
      itemCase.fileJson = [];
    }

    itemCase.fileJson.push({
      sort: itemCase.fileJson.length + 1,
      fileUrl: '',
      score: 0,
    });
  };
  /**
   * 计算总扣分
   * @param itemCase 考核项目数据
   * @returns 总扣分
   */
  const getTotalReduceScore = (itemCase: any) => {
    if (!itemCase || !itemCase.fileJson || !Array.isArray(itemCase.fileJson)) {
      return 0;
    }

    let totalReduceScore = 0;
    itemCase.fileJson.forEach((item: any) => {
      const score = Number(item.score) || 0;
      totalReduceScore += score;
    });
    itemCase.userScore = itemCase.scored - totalReduceScore;
    return totalReduceScore;
  };

  /**
   * 计算总加分
   * @param itemCase 考核项目数据
   * @returns 总加分
   */
  const getTotalAddScore = (itemCase: any) => {
    if (!itemCase || !itemCase.fileJson || !Array.isArray(itemCase.fileJson)) {
      return 0;
    }

    let totalAddScore = 0;
    itemCase.fileJson.forEach((item: any) => {
      const score = Number(item.score) || 0;
      totalAddScore += score;
    });
    itemCase.userScore = totalAddScore;
    return totalAddScore;
  };

  /**
   * 计算普通用户得分
   * @param itemCase 考核项目数据
   * @returns 普通用户得分
   */
  const getNormalUserScore = (itemCase: any) => {
    if (!itemCase || !itemCase.fileJson || !Array.isArray(itemCase.fileJson)) {
      return 0;
    }

    let normalUserScore = 0;
    itemCase.fileJson.forEach((item: any) => {
      if (item.fileUrl && !item.back) {
        normalUserScore += itemCase.scoreEveryTime;
      }
    });
    itemCase.userScore = normalUserScore;
    return normalUserScore;
  };

  /**
   * 扣分改变时，计算总扣分
   * @param itemCase 考核项目数据
   * @param item1 当前文件项
   */
  const handleReduceScoreChange = (itemCase: any, indexCase: any, index) => {
    console.log('itemCase', itemCase);
    console.log('indexCase', indexCase);
    console.log('index', index);
    // 安全检查：确保fileJson存在且为数组reviewSignModalRef
    if (!itemCase || !itemCase.fileJson || !Array.isArray(itemCase.fileJson)) {
      console.warn('itemCase.fileJson is not available or not an array');
      return;
    }

    const totalReduceScore = getTotalReduceScore(itemCase);

    // 确保scored是数字类型
    const scored = Number(itemCase.scored) || 0;
    itemCase.userScore = scored - totalReduceScore;
  };
  /**
   * 删除文件上传项
   * @param itemCase 考核项目数据
   * @param fileIndex 要删除的文件项索引
   */
  const removeUploadItem = (itemCase: any, fileIndex: number) => {
    // 安全检查：确保fileJson存在且为数组
    if (!itemCase || !itemCase.fileJson || !Array.isArray(itemCase.fileJson)) {
      console.warn('itemCase.fileJson is not available or not an array');
      return;
    }
    // 删除指定索引的项
    itemCase.fileJson.splice(fileIndex, 1);

    // 重新排序sort字段
    itemCase.fileJson.forEach((item: any, index: number) => {
      item.sort = index + 1;
    });

    // 重新计算得分（如果是扣分或加分类型）
    if (itemCase.dataType === '1' || itemCase.dataType === '3') {
      getTotalReduceScore(itemCase);
    } else if (itemCase.dataType === '2') {
      getTotalAddScore(itemCase);
    } else if (itemCase.dataType === '0') {
      getNormalUserScore(itemCase);
    }
  };
  const handleSignSuccess = () => {
    emit('success');
    closeDrawer();
  };
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
    padding: 8px;
    background-color: rgba(24, 144, 255, 0.1);
    border-radius: 4px;
  }

  .score-info {
    width: 140px;
    color: #ee0a24;
    font-weight: 600;
    font-size: 14px;
    background-color: #fff2f0;
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid #ffccc7;
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
      position: relative;
      .delete-icon {
        position: absolute;
        top: 6px;
        right: 6px;
        color: #ee0a24;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;
        &:hover {
          background-color: rgba(238, 10, 36, 0.1);
          transform: scale(1.1);
        }
        &:active {
          transform: scale(0.95);
        }
      }
    }

    .upload-description {
      margin-left: 2px;
    }
  }
  .score-container {
    padding: 20px;
    margin: 0 auto;
  }

  .score-table-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: center;
  }
  .score-table {
    border-collapse: collapse;
    border: 1px solid #d9d9d9;
  }

  .score-table th,
  .score-table td {
    border: 1px solid #d9d9d9;
    padding: 8px 16px;
    text-align: center;
  }

  .score-table th {
    background-color: #fafafa;
    font-weight: 500;
  }

  .criteria-table {
    border-collapse: collapse;
    margin-left: 20px;
  }

  .criteria-table td {
    padding: 4px 12px;
    border: 1px solid #d9d9d9;
    text-align: center;
    font-size: 12px;
  }

  .qualified {
    background-color: #fff2e8;
  }

  .basic-qualified {
    background-color: #f6ffed;
  }

  .unqualified {
    background-color: #fff2f0;
  }
  .add-btn {
    margin: 0 0 15px 20px;
  }
  :deep(.ant-tag) {
    margin-right: 0px;
  }
</style>
