<template>
  <div class="examine" style="position: relative">
    <a-tabs v-model:activeKey="activeKey" :class="['custom-tabs', { 'is-photo-mode': isPhoto }]" @change="changeTabs" @tab-click="tabClick">
      <template #leftExtra>
        <a-button :type="isPhoto ? 'primary' : ''" style="margin-right: 12px" @click="handlerPhoto">检查照片</a-button>
      </template>
      <a-tab-pane v-for="(item, index) in itemList" :key="index">
        <template #tab>
          <span :class="getTabClass(item)">
            {{ index + 1 }}
          </span>
        </template>
        <div v-if="!isPhoto" class="inspection-container">
          <!-- 检查任务描述 -->
          <div class="task-description">
            <div class="description-title">检查任务</div>
            <div class="description-content">
              <div class="task-item">
                <span class="task-label">检查项目：</span>
                <span class="task-value">{{ item.content }}</span>
              </div>
              <div class="task-item">
                <span class="task-label">检查方式：</span>
                <span class="task-value">{{ item.way }}</span>
              </div>
            </div>
          </div>

          <!-- 状态选择 -->
          <div v-if="type === 'check' || (type === 'view' && item.checkResult)" class="status-section">
            <div class="section-title required">检查结果</div>
            <div v-if="type === 'view'">
              <span class="task-value">{{ item.checkResult === '1' ? '正常' : '异常' }}</span>
            </div>
            <div v-else class="status-buttons">
              <div :class="{ active: item.checkResult === '1' }" class="status-btn" @click="selectStatus(item, '1')"> 正常 </div>
              <div :class="{ active: item.checkResult === '2' }" class="status-btn" @click="selectStatus(item, '2')"> 异常 </div>
            </div>
          </div>

          <!-- 正常状态下的字段 -->
          <template v-if="item.checkResult === '1'">
            <!-- 检查照片 -->
            <div class="photo-section">
              <div :class="item.pictureFlag === '1' ? 'section-title required' : 'section-title'">检查照片</div>
              <!-- <RealCameraUpload v-model:value="item.checkPicture" :maxCount="10" :disabled="type === 'view'" biz="socialFacilitiesManage" /> -->
              <AppUpload biz="socialFacilitiesManage" :disabled="type === 'view'" v-model:fileList="item.checkPicture" />
            </div>

            <!-- 备注 -->
            <div class="remarks-section" style="padding-bottom: 30px">
              <div class="section-title">备注</div>
              <a-textarea
                v-model:value="item.remark"
                :disabled="type === 'view'"
                :maxlength="100"
                allow-clear
                class="remarks-textarea"
                placeholder="请输入"
                rows="4"
                show-count
              />
            </div>
          </template>

          <!-- 异常状态下的字段 -->
          <template v-if="item.checkResult === '2'">
            <!-- 隐患描述 -->
            <div class="hazard-description-section" style="padding-bottom: 30px">
              <div class="section-title required">隐患描述</div>
              <a-textarea
                v-model:value="item.yhDescription"
                :disabled="type === 'view'"
                :maxlength="100"
                allow-clear
                class="hazard-textarea"
                placeholder="请详细描述发现的隐患"
                rows="4"
                show-count
              />
            </div>

            <!-- 检查照片 -->
            <div class="photo-section">
              <div :class="item.pictureFlag === '1' ? 'section-title required' : 'section-title'">检查照片</div>
              <!-- <RealCameraUpload v-model:value="item.checkPicture" :maxCount="10" :disabled="type === 'view'" biz="socialFacilitiesManage" /> -->
              <AppUpload biz="socialFacilitiesManage" :disabled="type === 'view'" v-model:fileList="item.checkPicture" />
            </div>

            <!-- 隐患等级 -->
            <div class="hazard-level-section">
              <div class="section-title required">隐患等级</div>
              <div v-if="type === 'view'">
                <span class="task-value">{{ item.yhLevel === '1' ? '一般' : '重大' }}</span>
              </div>
              <div v-else class="hazard-level-buttons">
                <div :class="{ active: item.yhLevel === '1' }" class="hazard-level-btn" @click="selectHazardLevel(item, '1')">一般 </div>
                <div :class="{ active: item.yhLevel === '2' }" class="hazard-level-btn" @click="selectHazardLevel(item, '2')">重大 </div>
              </div>
            </div>

            <!-- 班组长 -->
            <div class="team-leader-section">
              <div class="section-title required">班组长</div>
              <JUserModal
                v-model:value="item.teamLeader"
                :disabled="type === 'view'"
                :orgCode="orgCode"
                type="checkbox"
                @confirm="(name, nameWorkNo) => handlerChange(name, nameWorkNo, index)"
              />
            </div>
          </template>
        </div>
        <div v-if="isPhoto" class="inspection-container">
          <div v-for="(ite, inx) in pictureList" :key="inx">
            <!-- 检查任务描述 -->
            <div class="task-description">
              <div class="description-content">
                <div class="task-item">
                  <span class="task-label">脱水器编号：</span>
                  <span class="task-value">{{ ite.code }}</span>
                </div>
                <div class="task-item">
                  <div :class="type === 'check' ? 'required task-label' : 'task-label'">现场照片：</div>
                  <!-- <RealCameraUpload v-model:value="ite.picture" biz="socialFacilitiesManage" :disabled="type === 'view'" /> -->
                  <AppUpload :disabled="type === 'view'" biz="socialFacilitiesManage" v-model:fileList="ite.picture" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 底部操作栏 -->
    <div v-if="type === 'check'" class="action-bar">
      <a-button v-if="!isSubmit && !isPhoto" :loading="loading" class="action-btn" type="primary" @click="onSave"> 保存 </a-button>
      <a-button v-if="isSubmit" :loading="loading1" class="action-btn" type="primary" @click="onSubmit"> 提交</a-button>
    </div>
  </div>
</template>

<script lang="ts" name="app-checkPlan-examine" setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import { recordDetail, saveRecord, submitRecord } from '../api';
  import uni from '@dcloudio/uni-webview-js';
  // import RealCameraUpload from '/@/components/App/RealCameraUpload.vue';

  const { createMessage } = useMessage();
  const route = useRoute();
  const activeKey: any = ref(0);
  const itemList = ref<any[]>([]);
  const isSubmit = ref(false);
  const loading = ref(false);
  const loading1 = ref(false);
  const orgCode = ref('');
  const type: any = ref('check');
  const isPhoto = ref(false);
  const pictureList: any = ref([]);
  onMounted(() => {
    if (route.query.type) {
      type.value = route.query.type;
      init();
    }
  });
  const init = () => {
    recordDetail({ id: route.query.id }).then((res) => {
      pictureList.value = res.pictureList;
      itemList.value = res.itemList;
      orgCode.value = res.org;
      // 检查是否所有项目都已完成
      isSubmit.value = itemList.value.every((item) => item.saveFlag === '1');
      // 设置默认激活的项目为第一个未完成的
      const firstIncomplete = itemList.value.findIndex((item) => item.saveFlag === '0');
      if (type.value === 'view') {
        activeKey.value = 0;
        return;
      }
      if (firstIncomplete !== -1) {
        activeKey.value = firstIncomplete; // activeKey 从 1 开始
      } else if (itemList.value.length > 0) {
        // 如果所有项目都已完成，默认显示第一个
        activeKey.value = 0;
      }
    });
  };
  // 选择状态
  const selectStatus = (item: any, status: string) => {
    if (item) {
      item.checkResult = status;
      // 如果切换到正常状态，清空异常相关字段
      if (status === '1') {
        item.yhLevel = '';
      } else if (status === '2') {
        item.yhLevel = '1';
      }
      item.yhDescription = '';
      item.teamLeader = '';
      item.teamLeaderName = '';
    }
  };

  // 选择隐患等级
  const selectHazardLevel = (item: any, level: string) => {
    if (item) {
      item.yhLevel = level;
    }
  };

  // 切换标签页
  const changeTabs = (key) => {
    activeKey.value = key;
  };
  const tabClick = () => {
    isPhoto.value = false;
  };
  const handlerPhoto = () => {
    isPhoto.value = true;
  };
  watch(
    () => isPhoto.value,
    (newVal) => {
      nextTick(() => {
        const tabsNav = document.querySelector('.custom-tabs .ant-tabs-nav') as HTMLElement;
        const activeTabs = tabsNav.querySelectorAll('.ant-tabs-tab-active');
        const tabsTab = tabsNav.querySelectorAll('.ant-tabs-tab');
        if (tabsNav) {
          if (newVal) {
            const removeActiveClass = () => {
              activeTabs.forEach((tab) => {
                tab.classList.remove('ant-tabs-tab-active');
              });
            };
            removeActiveClass();
          } else {
            tabsTab[activeKey.value]?.classList?.add('ant-tabs-tab-active');
          }
        }
      });
    },
    { immediate: true }
  );
  // 获取标签页样式类
  const getTabClass = (item: any) => {
    if (item.saveFlag === '1') {
      return 'tab-item-completed';
    } else if (item.saveFlag === '0') {
      return 'tab-item-incomplete';
    }
    return '';
  };
  const handlerChange = (_name: string, nameWorkNo: string, index: number) => {
    itemList.value[index].teamLeaderName = nameWorkNo;
  };
  const onSave = () => {
    const _currentItem = itemList.value[activeKey.value];
    if (_currentItem.checkResult === '' || !_currentItem.checkResult) {
      return createMessage.error('请先选择检查结果');
    }
    if ((!_currentItem.checkPicture || _currentItem.checkPicture === '') && _currentItem.pictureFlag === '1') {
      return createMessage.error('请上传检查照片');
    }
    if (_currentItem.checkResult === '2') {
      if (_currentItem.yhDescription === '') {
        return createMessage.error('请输入隐患描述');
      }
      if (_currentItem.yhLevel === '' || !_currentItem.yhLevel) {
        return createMessage.error('请选择隐患等级');
      }
      if (_currentItem.teamLeader === '') {
        return createMessage.error('请选择班组长');
      }
    }
    loading.value = true;
    saveRecord({ taskId: route.query.id, ..._currentItem })
      .then((res) => {
        if (res) {
          init();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const onSubmit = () => {
    for (let i = 0; i < pictureList.value.length; i++) {
      if (!pictureList.value[i].picture || pictureList.value[i].picture === '') {
        return createMessage.error('请上传检查照片中的现场照片');
      }
    }
    loading1.value = true;
    submitRecord({ id: route.query.id, pictureList: pictureList.value })
      .then((res) => {
        if (res) {
          uni.switchTab({
            url: '/pages/index/index',
          });
        }
      })
      .finally(() => {
        loading1.value = false;
      });
  };
</script>

<style lang="less" scoped>
  .examine {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f5f5;

    .required::before {
      content: '*';
      color: #ff4d4f;
      margin-right: 4px;
      font-size: 16px;
      font-family: SimSun, sans-serif;
    }

    .custom-tabs {
      flex: 1;
      overflow: hidden;

      :deep(.ant-tabs-nav) {
        background: #fff;
        margin: 0;
        padding: 0 16px;
        border-bottom: 1px solid #f0f0f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .ant-tabs-tab {
          margin: 0 8px 0 0;
          padding: 12px 0;
        }

        .ant-tabs-tab-active {
          .tab-item-completed,
          .tab-item-incomplete {
            background: linear-gradient(135deg, #1890ff, #40a9ff);
            border-color: #1890ff;
            color: #fff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          }
        }
      }

      :deep(.ant-tabs-content-holder) {
        overflow-y: auto;
      }

      :deep(.ant-tabs-tabpane) {
        padding: 20px;
      }

      &.is-photo-mode {
        :deep(.ant-tabs-ink-bar) {
          display: none !important;
        }
      }

      .tab-item-completed {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #52c41a;
        background: linear-gradient(135deg, #52c41a, #73d13d);
        color: #fff;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
      }

      .tab-item-incomplete {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #d9d9d9;
        background: #fff;
        color: #666;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
    }

    .inspection-container {
      max-width: 600px;
      margin: 0 auto;
      width: 100%;

      .task-description {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .description-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .description-content {
          .task-item {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;

            &:last-child {
              margin-bottom: 0;
            }

            .task-label {
              color: #666;
              font-size: 14px;
              min-width: 80px;
              flex-shrink: 0;
            }

            .task-value {
              color: #333;
              font-size: 14px;
              line-height: 1.5;
              flex: 1;
            }
          }
        }
      }

      .status-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .status-buttons {
          display: flex;
          gap: 16px;

          .status-btn {
            flex: 1;
            height: 36px;
            border: 2px solid #e8e8e8;
            border-radius: 8px;
            background: #fff;
            color: #666;
            font-size: 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: #40a9ff;
              color: #40a9ff;
            }

            &.active {
              border-color: #1890ff;
              background: #1890ff;
              color: #fff;
              box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
            }
          }
        }
      }

      .photo-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .image-upload {
          :deep(.ant-upload-list) {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }

          :deep(.ant-upload-drag) {
            border: 2px dashed #d9d9d9;
            border-radius: 8px;
            background: #fafafa;
            transition: all 0.3s ease;

            &:hover {
              border-color: #40a9ff;
              background: #f0f8ff;
            }
          }
        }
      }

      .remarks-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .remarks-textarea {
          border-radius: 8px;
          border-color: #d9d9d9;
          resize: none;

          &:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
        }
      }

      .hazard-description-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .hazard-textarea {
          border-radius: 8px;
          border-color: #d9d9d9;
          resize: none;

          &:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
        }
      }

      .hazard-level-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .hazard-level-buttons {
          display: flex;
          gap: 16px;

          .hazard-level-btn {
            flex: 1;
            height: 36px;
            border: 2px solid #e8e8e8;
            border-radius: 8px;
            background: #fff;
            color: #666;
            font-size: 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: #40a9ff;
              color: #40a9ff;
            }

            &.active {
              border-color: #1890ff;
              background: #1890ff;
              color: #fff;
              box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
            }
          }
        }
      }

      .team-leader-section {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .team-leader-select {
          border-radius: 8px;
          border-color: #d9d9d9;

          &:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }
        }
      }
    }

    .action-bar {
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      // padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      justify-content: center;
      gap: 16px;
      z-index: 100;

      .action-btn {
        min-width: 180px;
        height: 40px;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s;
        margin: 16px 0;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .examine {
      .custom-tabs {
        :deep(.ant-tabs-nav) {
          padding: 0 12px;
        }

        :deep(.ant-tabs-tabpane) {
          padding: 16px;
        }

        .tab-item-completed,
        .tab-item-incomplete {
          width: 36px;
          height: 36px;
          font-size: 13px;
        }
      }

      .inspection-container {
        .task-description,
        .status-section,
        .photo-section,
        .remarks-section,
        .hazard-description-section,
        .hazard-level-section,
        .team-leader-section {
          padding: 16px;
        }

        .status-buttons {
          .status-btn {
            height: 36px;
            font-size: 15px;
          }
        }
      }

      .action-bar {
        // padding: 12px 16px;

        .action-btn {
          min-width: 180px;
          height: 36px;
        }
      }
    }
  }

  // 深色模式支持
  @media (prefers-color-scheme: dark) {
    .examine {
      background: #141414;

      .custom-tabs {
        :deep(.ant-tabs-nav) {
          background: #1f1f1f;
          border-bottom-color: #303030;
        }
      }

      .inspection-container {
        .task-description,
        .status-section,
        .photo-section,
        .remarks-section,
        .hazard-description-section,
        .hazard-level-section,
        .team-leader-section {
          background: #1f1f1f;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .task-description {
          .description-title {
            color: #fff;
          }

          .description-content {
            .task-item {
              .task-label {
                color: #999;
              }

              .task-value {
                color: #fff;
              }
            }
          }
        }

        .status-section {
          .section-title {
            color: #fff;
          }

          .status-buttons {
            .status-btn {
              border-color: #434343;
              background: #1f1f1f;
              color: #999;

              &:hover {
                border-color: #40a9ff;
                color: #40a9ff;
              }

              &.active {
                border-color: #1890ff;
                background: #1890ff;
                color: #fff;
              }
            }
          }
        }

        .photo-section,
        .remarks-section,
        .hazard-description-section,
        .hazard-level-section,
        .team-leader-section {
          .section-title {
            color: #fff;
          }
        }
      }

      .action-bar {
        background: #1f1f1f;
        border-top-color: #303030;
      }
    }
  }
</style>
