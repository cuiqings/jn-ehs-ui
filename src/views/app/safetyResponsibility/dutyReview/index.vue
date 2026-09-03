<template>
  <div class="duty-review-page">
    <div v-if="list.length > 0">
      <van-floating-bubble axis="xy" :gap="8" v-model:offset="offset" class="mybubble">
        <template #default>
          <span class="content" @click="searchPopup = true">
            <van-icon style="transform: translateY(0px)" name="filter-o" size="14" />
            搜索
          </span>
        </template>
      </van-floating-bubble>
    </div>
    <!-- 列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div v-for="item in list" :key="item.id" class="list-item" @click="handleItemClick(item)">
            <div class="item-header">
              <div class="item-title">
                <van-checkbox v-model="item.checked" @click.stop @change="handleCheckChange(item)" v-if="item.status === '1'" />
                <span class="name">{{ item.realName }}</span>
                <span class="post">{{ item.post }}</span>
              </div>
              <div class="item-status">
                <van-tag plain :type="getStatusType(item.status)" size="medium">
                  {{ item.status }}
                </van-tag>
              </div>
            </div>
            <div class="item-content">
              <div class="content-row">
                <span class="label">类型:</span>
                <span class="value">{{ item.postType }}</span>
              </div>
              <div class="content-row">
                <span class="label">所属单位:</span>
                <span class="value">{{ item.orgCode }}</span>
              </div>
              <div class="content-row">
                <span class="label">所属部门:</span>
                <span class="value">{{ item.workshop || '-' }}</span>
              </div>
              <div class="content-row">
                <span class="label">考评周期:</span>
                <span class="value">{{ item.cycleDate }}</span>
              </div>
              <div class="content-row">
                <span class="label">得分:</span>
                <span class="value score" :class="getScoreClass(item.score)">{{ item.score || '-' }}</span>
              </div>
              <div class="content-row">
                <span class="label">履职结果:</span>
                <span class="value result" :class="getResultClass(item.result)">
                  {{ item.result }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <van-button style="margin-right: 8px" v-if="item.status === '待审核'" type="primary" size="small" @click.stop="handleAudit(item)"
                >审核</van-button
              >
              <van-button size="small" @click.stop="handleDetail(item)">查看</van-button>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <!-- 审核详情弹窗 -->
    <DutyReviewDrawer v-model:show="showDrawer" :record="currentRecord" :show-footer="showDrawerFooter" @success="handleSuccess" />

    <!-- 签字弹窗 -->
    <ReviewSignModal v-model:show="showSignModal" :data="signModalData" @success="handleSuccess" />

    <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '65%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="searchPopup = false" name="cross" />
        </div>
        <div class="btns">
          <p>类型</p>
          <div class="btn-wrap">
            <van-button
              @click="postTypeClick(item.value)"
              v-for="item in typeOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.postType == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <van-field readonly @click="openPicker('org')" v-model="orgName" label-align="top" name="orgName" label="所属单位" placeholder="请选择" />
        <van-field v-model="queryParams.post" label-align="top" name="post" label="岗位" placeholder="请输入" />
        <!-- 考评周期选择 -->
        <div class="btns">
          <p>考评周期</p>
          <div class="btn-wrap">
            <van-button
              @click="cycleClick(item.value)"
              v-for="item in cycleOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.cycle == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <!-- 履职结果选择 -->
        <div class="btns">
          <p>履职结果</p>
          <div class="btn-wrap">
            <van-button
              @click="resultClick(item.value)"
              v-for="item in resultOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.result == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <!-- 履职状态选择 -->
        <div class="btns">
          <p>履职状态</p>
          <div class="btn-wrap">
            <van-button
              @click="statusClick(item.value)"
              v-for="item in statusOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.status == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns-field-names="customFieldName" :columns="orgList" @confirm="onConfirm($event, 'org')" @cancel="showPicker = false" />
    </van-popup>
    <!-- 签字弹窗 -->
    <ReviewSignModal v-model:show="showSignModal" :review-data="signModalData" @confirm="handleSignConfirm" />
  </div>
</template>

<script setup lang="ts" name="AppDutyReview">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { showToast, showConfirmDialog } from 'vant';
  import { getDepartTreeBy23, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { getList, auditBatch } from './dutyReview.api';
  import { orgOptions, departOptions, typeOptions, statusOptions, resultOptions, getDepartList, cycleOptions } from './dutyReview.data';
  // DutyReviewDrawer 组件已移除，改为路由跳转方式
  import ReviewSignModal from './ReviewSignModal.vue';
  const offset = ref({ x: document.body.clientWidth - 75, y: 8 });
  // 路由
  const router = useRouter();
  const searchPopup = ref(false);
  const showPicker = ref(false);
  // 列表相关
  const list = ref<any[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };
  // 选择相关
  const selectedItems = ref<any[]>([]);
  const selectAll = ref(false);
  const orgTree = ref<{ orgCode: string; departName: string }[]>([]);

  // 弹窗相关
  const showDrawer = ref(false);
  const showDrawerFooter = ref(true);
  const currentRecord = ref<any>(null);
  const showSignModal = ref(false);
  const signModalData = ref<any>(null);
  const orgName = ref('');
  // 查询参数
  const queryParams = reactive<any>({
    postType: '',
    orgCode: '',
    workshop: '',
    post: '',
    cycle: '',
    result: '',
    status: '',
    realName: '',
  });

  /**
   * 页面初始化
   */
  onMounted(() => {
    loadData();
    getOrgList();
  });
  const orgList = ref<any[]>([]);
  const getOrgList = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgList.value = res;
    });
  };
  const postTypeClick = (e) => {
    queryParams.postType = e;
  };
  const cycleClick = (e) => {
    queryParams.cycle = e;
  };
  const resultClick = (e) => {
    queryParams.result = e;
  };
  const statusClick = (e) => {
    queryParams.status = e;
  };
  /**
   * 加载数据
   */
  const loadData = async () => {
    loading.value = true;
    try {
      const params = {
        ...queryParams,
        pageNo: pageNo.value,
        pageSize: pageSize.value,
      };

      // 尝试调用真实API，如果失败则使用模拟数据
      let res;
      try {
        res = await getList(params);
      } catch (apiError) {
        console.warn('API调用失败，使用模拟数据:', apiError);
      }

      const newList = res.records || [];

      if (pageNo.value === 1) {
        list.value = newList;
      } else {
        list.value.push(...newList);
      }

      // 添加选中状态
      list.value.forEach((item) => {
        if (!item.hasOwnProperty('checked')) {
          item.checked = false;
        }
      });

      finished.value = newList.length < pageSize.value;
    } catch (error) {
      showToast('加载失败');
      console.error('数据加载错误:', error);
    } finally {
      loading.value = false;
      refreshing.value = false;
    }
  };

  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    pageNo.value = 1;
    finished.value = false;
    selectedItems.value = [];
    loadData();
  };

  /**
   * 上拉加载
   */
  const onLoad = () => {
    if (!finished.value) {
      pageNo.value++;
      loadData();
    }
  };
  const onConfirm = (e, type) => {
    if (type == 'org') {
      queryParams.orgCode = e.selectedOptions[0].orgCode;
      orgName.value = e.selectedOptions[0].departName;
      showPicker.value = false;
    }
  };

  const reset = () => {
    queryParams.orgCode = '';
    queryParams.postType = '';
    queryParams.cycle = '';
    queryParams.result = '';
    queryParams.status = '';
    orgName.value = '';
  };
  const searchClick = () => {
    pageNo.value = 1;
    searchPopup.value = false;
    loadData();
  };

  /**
   * 复选框变化
   */
  const handleCheckChange = (item: any) => {
    if (item.checked) {
      selectedItems.value.push(item);
    } else {
      const index = selectedItems.value.findIndex((selected: any) => selected.id === item.id);
      if (index > -1) {
        selectedItems.value.splice(index, 1);
      }
    }
  };

  /**
   * 列表项点击
   */
  const handleItemClick = (item: any) => {
    currentRecord.value = item;
    showDrawerFooter.value = false;
    showDrawer.value = true;
  };

  /**
   * 审核 - 跳转到审核详情页面
   */
  const handleAudit = (item: any) => {
    router.push({
      name: 'AppSafetyResponsibilityDutyReviewDetail',
      query: {
        id: item.id,
        mode: 'audit',
      },
    });
  };
  const openPicker = (type) => {
    if (type === 'org') {
      showPicker.value = true;
    }
  };
  /**
   * 查看详情
   */
  const handleDetail = (item: any) => {
    router.push({
      name: 'AppSafetyResponsibilityDutyReviewDetail',
      query: {
        id: item.id,
        mode: 'detail',
      },
    });
  };

  /**
   * 批量审核
   */
  const handleBatchAudit = async () => {
    if (selectedItems.value.length === 0) {
      showToast('请选择要审核的记录');
      return;
    }

    const selectedNames = selectedItems.value.map((item) => item.realName).join('、');

    try {
      await showConfirmDialog({
        title: '批量审核确认',
        message: `即将对以下人员：${selectedNames} 进行批量审核，确认提交？`,
      });

      signModalData.value = {
        idList: selectedItems.value.map((item) => item.id),
        isBatch: true,
      };
      showSignModal.value = true;
    } catch {
      // 用户取消
    }
  };

  /**
   * 全选/取消全选
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 全选：选择所有状态为待审核的项目
      selectedItems.value = list.value.filter((item) => item.status === '1');
      list.value.forEach((item) => {
        if (item.status === '1') {
          item.checked = true;
        }
      });
    } else {
      // 取消全选
      selectedItems.value = [];
      list.value.forEach((item) => {
        item.checked = false;
      });
    }
  };

  /**
   * 批量审核
   */
  const handleBatchReview = () => {
    if (selectedItems.value.length === 0) {
      showToast('请选择要审核的项目');
      return;
    }

    const selectedNames = selectedItems.value.map((item) => item.realName).join('、');

    showConfirmDialog({
      title: '批量审核确认',
      message: `确定要审核以下人员吗？\n${selectedNames}`,
    })
      .then(() => {
        // 批量审核逻辑
        const reviewData = {
          idList: selectedItems.value.map((item) => item.id),
          auditResult: '2', // 审核通过
          auditOpinion: '批量审核通过',
        };

        signModalData.value = reviewData;
        showSignModal.value = true;
      })
      .catch(() => {
        // 取消操作
      });
  };

  /**
   * 签字确认回调
   */
  const handleSignConfirm = (signData: any) => {
    console.log('签字确认:', signData);
    // 这里可以调用API提交审核结果
    showToast('审核提交成功');
    handleSuccess();
  };

  /**
   * 操作成功回调
   */
  const handleSuccess = () => {
    showDrawer.value = false;
    showSignModal.value = false;
    selectedItems.value = [];
    selectAll.value = false;
    onRefresh();
  };

  /**
   * 获取状态类型
   */
  const getStatusType = (status: string) => {
    const typeMap: any = {
      待审核: 'primary',
      审核完成: 'success',
    };
    return typeMap[status] || 'default';
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string) => {
    const option = statusOptions.find((item: any) => item.value === status);
    return option?.label || '-';
  };

  /**
   * 获取履职结果样式类
   */
  const getResultClass = (result: string) => {
    const classMap: any = {
      合格: 'result-qualified',
      基本合格: 'result-basic',
      不合格: 'result-unqualified',
    };
    return classMap[result] || '';
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
</script>

<style lang="less" scoped>
  .duty-review-page {
    margin-top: 60px;
    height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;

    .filter-header {
      background: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;

      .filter-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .filter-modal {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;

      .filter-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;

        .filter-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .filter-modal-content {
        flex: 1;
        overflow-y: auto;

        .filter-item {
          margin-bottom: 15px;

          .filter-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
        }
      }

      .filter-modal-footer {
        padding-top: 15px;
        border-top: 1px solid #eee;
      }
    }

    .batch-section {
      background: white;
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .batch-info {
        color: #1989fa;
        font-size: 14px;
      }
    }

    .list-section {
      flex: 1;
      overflow-y: auto;

      .list-item {
        position: relative;
        background: white;
        margin: 8px 12px;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;

          .item-title {
            display: flex;
            align-items: center;

            .name {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-right: 8px;
            }

            .post {
              font-size: 14px;
              color: #666;
              background: #f0f0f0;
              padding: 2px 8px;
              border-radius: 12px;
            }
          }
        }

        .item-content {
          .content-row {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #666;
              margin-right: 8px;
              min-width: 60px;
            }

            .value {
              color: #333;
              margin-right: 16px;

              &.score {
                font-weight: 600;
              }

              &.score-excellent {
                color: #07c160; // 绿色 - 86分及以上
              }

              &.score-good {
                color: #1989fa; // 蓝色 - 76-85分
              }

              &.score-poor {
                color: #ee0a24; // 红色 - 75分及以下
              }

              &.result-qualified {
                color: #07c160;
              }

              &.result-basic {
                color: #ff976a;
              }

              &.result-unqualified {
                color: #ee0a24;
              }
            }
          }
        }
        .item-actions {
          position: absolute;
          bottom: 16px;
          right: 16px;
        }
      }
    }
  }
  .mybubble {
    width: 50px !important;
    height: 26px !important;
    .content {
      font-size: 12px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .search-box {
    .van-button {
      width: 48%;
    }

    .foot {
      padding: 0 10px;
      display: flex;
      margin-top: 30px;
      justify-content: space-between;
    }

    .hd {
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-weight: 600;
    }

    .btns {
      padding: 10px 16px;
      p {
        margin-bottom: 10px;
      }

      ul li {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
    }
  }
  .btn-wrap {
    button {
      margin-bottom: 10px;
      padding: 0 5px;
    }
  }
  .dialog-content {
    padding: 0 15px;
    display: flex;
    align-items: center;
    height: 100px;
    & > span {
      width: 80px;
      &::before {
        content: '* ';
        color: #ff4d4f;
      }
    }
  }
</style>
