<template>
  <div class="duty-review-detail-page">
    <!-- 内容区域 -->
    <div class="page-content">
      <div class="content-wrapper">
        <!-- 评分表格 -->
        <div class="score-section">
          <h4 class="section-title">评分结果</h4>
          <div class="score-table-wrapper">
            <van-cell-group>
              <van-cell title="得分" :value="detailData.score || '-'" :value-class="getScoreClass(detailData.score)" />
              <van-cell title="结果">
                <template #value>
                  <van-tag v-if="detailData.result == '不合格'" type="danger">不合格</van-tag>
                  <van-tag v-if="detailData.result == '合格'" type="success">合格</van-tag>
                  <van-tag v-if="detailData.result == '基本合格'" type="primary">基本合格</van-tag>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </div>

        <!-- 履职详情折叠面板 -->
        <div class="detail-section" v-if="detailData.itemList && detailData.itemList.length > 0">
          <van-collapse v-model="activeKey" :border="false">
            <van-collapse-item v-for="(item, index) in detailData.itemList || []" :key="index" :name="index" :title="`第${index + 1}条`">
              <div class="collapse-content">
                <!-- 履职清单 -->
                <div class="content-section">
                  <h4 class="section-title">履职清单</h4>
                  <div class="section-content">{{ item.listDuties }}</div>
                </div>

                <!-- 任务清单 -->
                <div class="content-section">
                  <h4 class="section-title">任务清单</h4>
                  <div class="section-content">{{ item.taskList }}</div>
                </div>

                <!-- 考核标准 -->
                <div class="content-section">
                  <h4 class="section-title">考核标准</h4>
                  <div v-for="(itemCase, indexCase) in item.childList || []" :key="indexCase" class="evaluation-item">
                    <div class="evaluation-header">
                      <div class="evaluation-content">
                        <van-tag v-if="itemCase.dataType == '0'" type="primary">常规项</van-tag>
                        <van-tag v-else-if="itemCase.dataType == '2'" type="success">加分项</van-tag>
                        <van-tag v-else-if="itemCase.dataType == '3'" type="danger">减分项</van-tag>
                        <van-tag v-else-if="itemCase.dataType == '1'" type="warning">自由填写项</van-tag>
                        <van-tag v-else color="#666">系统获取</van-tag>
                        {{ itemCase.evaluationCriteria }}</div
                      >
                      <div class="score-info">
                        <span v-if="itemCase.dataType == '0'">得分情况：{{ getNormalUserScore(itemCase) }} / {{ itemCase.scored }}</span>
                        <span v-if="itemCase.dataType == '1' || itemCase.dataType == '3'"
                          >得分情况：{{ (itemCase.scored || 0) - getTotalReduceScore(itemCase) }} / {{ itemCase.scored }}</span
                        >
                        <span v-if="itemCase.dataType == '2'">得分情况：{{ getTotalAddScore(itemCase) }}</span>
                      </div>
                    </div>
                    <!-- 文件上传项 -->
                    <div v-for="(fileItem, fileIndex) in itemCase.fileJson || []" :key="fileItem.sort" class="upload-item">
                      <div class="upload-title">
                        <span>第{{ fileIndex + 1 }}次上传</span>
                        <van-icon
                          v-if="itemCase.dataType != '0' && showFooter"
                          name="cross"
                          class="delete-icon"
                          @click="removeUploadItem(itemCase, fileIndex)"
                        />
                      </div>
                      <div class="upload-content">
                        <van-cell-group>
                          <van-field name="fileUrl" label="相关文件">
                            <template #input>
                              <AppCustomizeUpload :max-count="10" v-model:fileList="fileItem.fileUrl" text="上传文件" :disabled="!showFooter" />
                            </template>
                          </van-field>
                          <van-cell v-if="itemCase.dataType == '2'" title="得分">
                            <template #value>
                              <van-field v-model="fileItem.score" type="number" :disabled="!showFooter" placeholder="请输入得分" :min="0" />
                            </template>
                          </van-cell>
                          <van-cell v-if="itemCase.dataType == '1' || itemCase.dataType == '3'" title="扣分">
                            <template #value>
                              <van-field
                                style="margin-top: -8px"
                                v-model="fileItem.score"
                                type="number"
                                :disabled="!showFooter"
                                placeholder="请输入扣分"
                                :min="0"
                                @update:model-value="handleReduceScoreChange(itemCase, indexCase, index)"
                              />
                            </template>
                          </van-cell>
                        </van-cell-group>
                      </div>
                    </div>
                    <!-- 添加按钮 -->
                    <div v-if="itemCase.dataType != '0' && showFooter" class="add-btn-wrapper">
                      <van-button type="primary" size="small" plain @click="addUploadItem(itemCase)">+ 添加</van-button>
                    </div>
                  </div>
                </div>
              </div>
            </van-collapse-item>
          </van-collapse>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions" v-if="showFooter">
      <van-button size="large" @click="handleBack">取消</van-button>
      <van-button type="primary" size="large" :loading="saveLoading" @click="handleSave">保存</van-button>
      <van-button type="success" size="large" :loading="submitLoading" @click="handleSubmit">提交</van-button>
    </div>
    <!-- 签字弹窗 -->
    <ReviewSignModal v-model:show="showSignModal" :data="signModalData" @confirm="handleSignConfirm" />
  </div>
</template>

<script setup lang="ts" name="DutyReviewDetail">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { showToast, showConfirmDialog } from 'vant';
  import { getDetail, auditRecord, saveRecord } from './dutyReview.api';
  import ReviewSignModal from './ReviewSignModal.vue';
  import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';

  // 路由
  const router = useRouter();
  const route = useRoute();

  // 数据
  const loading = ref(false);
  const detailData = ref<any>({});
  const showSignModal = ref(false);
  const signModalData = ref<any>({});
  const detailId = ref('');
  const activeKey = ref([0]); // 折叠面板使用数组管理展开状态
  const showFooter = ref(true);
  const saveLoading = ref(false);
  const submitLoading = ref(false);
  const signShow = ref(false);
  const signature = ref('');

  /**
   * 返回上一页
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * 获取详情数据
   */
  const fetchDetail = async () => {
    const id = route.query.id as string;
    if (!id) {
      showToast('缺少必要参数');
      handleBack();
      return;
    }
    detailId.value = id;

    // 根据路由参数判断是否为编辑模式
    const isEdit = route.query.mode === 'audit';
    showFooter.value = isEdit;

    loading.value = true;
    try {
      const response = await getDetail({ id });
      detailData.value = response || {};
    } catch (error) {
      console.error('获取详情失败:', error);
      showToast('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存数据
   */
  const handleSave = async () => {
    saveLoading.value = true;
    try {
      await saveRecord({
        id: detailId.value,
        auditData: detailData.value.itemList,
      });
      showToast('保存成功');
      handleBack();
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败');
    } finally {
      saveLoading.value = false;
    }
  };

  /**
   * 提交审核
   */
  const handleSubmit = () => {
    showConfirmDialog({
      title: '提示',
      message: '提交后将不能再进行填写，确认仍要提交？',
    })
      .then(() => {
        signModalData.value = {
          id: detailId.value,
          auditData: detailData.value.itemList,
        };
        showSignModal.value = true;
      })
      .catch(() => {
        // 用户取消
        showSignModal.value = false;
      });
  };

  /**
   * 签字确认回调
   */
  const handleSignConfirm = async (signData: any) => {};
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
      fileUrl: null, // 初始化为空数组，避免van-uploader的map错误
      score: 0,
    });
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
      if (item.fileUrl) {
        console.log('item', item);
        normalUserScore += itemCase.scoreEveryTime;
      }
    });
    console.log('normalUserScore', normalUserScore);
    itemCase.userScore = normalUserScore;
    return normalUserScore;
  };

  /**
   * 扣分改变时，计算总扣分
   * @param itemCase 考核项目数据
   * @param indexCase 考核项索引
   * @param index 当前项索引
   */
  const handleReduceScoreChange = (itemCase: any, indexCase: any, index: any) => {
    console.log('itemCase', itemCase);
    console.log('indexCase', indexCase);
    console.log('index', index);
    // 安全检查：确保fileJson存在且为数组
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
   * 获取得分颜色样式类
   */
  const getScoreClass = (score: number | string) => {
    const scoreNum = Number(score);
    if (isNaN(scoreNum)) return '';

    if (scoreNum >= 86) {
      return 'score-excellent'; // 绿色
    } else if (scoreNum >= 76) {
      return 'score-good'; // 蓝色
    } else {
      return 'score-poor'; // 红色
    }
  };

  onMounted(() => {
    fetchDetail();
  });
</script>

<style lang="less" scoped>
  .duty-review-detail-page {
    height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;

      .content-wrapper {
        .score-section,
        .detail-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
        }

        .score-section {
          .score-table-wrapper {
            .van-cell {
              :deep(.van-cell__value) {
                &.score-excellent {
                  color: #07c160 !important; // 绿色 - 86分及以上
                  font-weight: 600;
                }

                &.score-good {
                  color: #1989fa !important; // 蓝色 - 76-85分
                  font-weight: 600;
                }

                &.score-poor {
                  color: #ee0a24 !important; // 红色 - 75分及以下
                  font-weight: 600;
                }
              }
            }
          }
        }

        .detail-section {
          .collapse-content {
            padding: 12px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin: 8px 0;

            .content-section {
              margin-bottom: 20px;
              padding: 16px;
              background-color: #ffffff;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

              &:first-child {
                margin-top: 0;
              }

              &:last-child {
                margin-bottom: 0;
              }

              .section-title {
                margin: 0 0 12px 0;
                font-weight: 600;
                color: #262626;
                font-size: 16px;
                border-bottom: none;
                padding-bottom: 0;
              }

              .section-content {
                color: #595959;
                line-height: 1.6;
                padding: 8px 12px;
                background-color: #fafafa;
                border-radius: 4px;
                border-left: 3px solid #1890ff;
              }

              .evaluation-item {
                margin-bottom: 16px;
                padding: 12px;
                background-color: #f8f9fa;
                border-radius: 6px;
                border: 1px solid #e8e8e8;

                &:last-child {
                  margin-bottom: 0;
                }

                .evaluation-header {
                  margin-bottom: 12px;

                  .evaluation-content {
                    background-color: #ffffff;
                    // border-left: 3px solid #52c41a;
                    margin-bottom: 5px;
                  }

                  .score-info {
                    color: #ee0a24;
                    font-weight: 600;
                    font-size: 14px;
                    background-color: #fff2f0;
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: 1px solid #ffccc7;
                    text-align: center;
                  }
                }

                .upload-item {
                  margin: 12px 0;
                  padding: 12px;
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .delete-icon {
                      color: #ee0a24;
                      font-size: 16px;
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

                  .upload-content {
                    .van-cell-group {
                      border-radius: 4px;
                      // overflow: hidden;
                    }

                    .van-field {
                      // width: 100px;
                    }
                  }
                }

                .add-btn-wrapper {
                  text-align: center;
                  margin-top: 12px;
                  padding-top: 12px;
                  border-top: 1px solid #eee;
                }
              }
            }
          }

          :deep(.van-collapse-item__title) {
            font-size: 15px;
            font-weight: 600;
            color: #333;
          }

          :deep(.van-collapse-item__content) {
            padding: 0;
          }
        }
      }
    }

    .footer-actions {
      background: white;
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      position: sticky;
      bottom: 0;
      z-index: 100;

      .van-button {
        flex: 1;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
</style>
