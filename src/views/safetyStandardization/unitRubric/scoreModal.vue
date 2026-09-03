<template>
  <div>
    <basic-modal
      :bodyStyle="{ padding: '10px 0 0 0' }"
      :maskClosable="false"
      :title="title"
      destroyOnClose
      v-bind="$attrs"
      width="100%"
      wrapClassName="score-modal"
      @cancel="close"
      @register="registerModal"
    >
      <div>
        <div v-if="!isView" class="current-operator">
          <a-icon type="user" />
          <span class="operator-label">当前操作人：</span>
          <span class="operator-name">{{ currentOperator }}</span>
        </div>
        <a-tabs v-model:activeKey="activeKey" :style="{ '--tabs-height': tabsHeight }" @change="changeTabs">
          <a-tab-pane v-for="(item, index) in itemList" :key="index">
            <template #tab>
              <span :class="getTabClass(item)">
                <span class="tab-item-number">{{ index + 1 }}</span>
                <span class="tab-item-title">{{ item.category }}</span>
              </span>
            </template>
            <div class="review-content">
              <div class="review-content-title"> {{ item.category }}评审</div>
              <a-table :columns="columns" :data-source="reviewData" :loading="listLoading" :pagination="false" bordered>
                <template #content="{ record }">
                  <div v-html="record.content"></div>
                </template>
                <template #description="{ record }">
                  <InputTextArea v-model:value="record.description" :disabled="isView" auto-size placeholder="请输入" style="width: 100%" />
                </template>
                <template #score="{ record }">
                  <a-input-number
                    v-model:value="record.score"
                    :controls="false"
                    :disabled="isView || record.isInvolving === '2'"
                    :max="record.point"
                    :min="0"
                    :precision="1"
                  />
                </template>
                <template #isInvolving="{ record }">
                  <a-radio-group v-model:value="record.isInvolving" :disabled="isView" name="radioGroup" @change="changeInvolving(record)">
                    <a-radio value="1">是</a-radio>
                    <a-radio :class="{ 'radio-red': record.isInvolving === '2' }" value="2">否</a-radio>
                  </a-radio-group>
                </template>
              </a-table>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px; line-height: 42px; height: 52px; width: 180px; border-radius: 10px" @click="close">取消 </a-button>
          <a-button
            v-if="!isView"
            :loading="loading"
            style="line-height: 42px; height: 52px; width: 180px; border-radius: 10px"
            type="primary"
            @click="save"
            >保存
          </a-button>
          <a-button
            v-if="!isView && isSubmit"
            :loading="loading"
            style="line-height: 42px; height: 52px; width: 180px; border-radius: 10px"
            type="primary"
            @click="confirmClose"
            >提交评审
          </a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, computed, onUnmounted, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Input } from 'ant-design-vue';
  import { message } from 'ant-design-vue';
  import { addEditing, getEditing, queryById, getItemList, editItem, submit } from './api';

  const emit = defineEmits(['success']);
  const InputTextArea = Input.TextArea;
  const currentOperator = ref('');
  const loading = ref(false);
  const title = ref('');
  const activeKey = ref(0);
  const isView = ref(false);
  const id = ref('');
  const currentOperatorHeight = ref(0);
  const listLoading = ref(false);
  // 是否可以提交评审
  const isSubmit = ref(false);
  // 动态计算tabs高度
  const tabsHeight = computed(() => {
    const baseHeight = isView.value ? 228 : 248;
    const dynamicHeight = baseHeight + currentOperatorHeight.value;
    return `calc(100vh - ${dynamicHeight}px)`;
  });
  const columns = ref<any[]>([
    {
      title: '考评项目',
      align: 'center',
      width: 130,
      dataIndex: 'project',
      customCell: (_, index: any) => {
        return {
          rowSpan: projectRowSpan.value[index],
        };
      },
    },
    {
      title: '考评内容',
      width: 230,
      dataIndex: 'content',
      customCell: (_, index: any) => {
        return {
          rowSpan: contentRowSpan.value[index],
        };
      },
      slots: {
        customRender: 'content',
      },
    },
    {
      title: '标准分值',
      align: 'center',
      width: 60,
      dataIndex: 'point',
    },
    {
      title: '评分标准',
      width: 200,
      dataIndex: 'standard',
      slots: {
        customRender: 'standard',
      },
    },
    {
      title: '是否涉及',
      width: 80,
      align: 'center',
      dataIndex: 'isInvolving',
      slots: {
        customRender: 'isInvolving',
      },
    },
    {
      title: '自评描述',
      dataIndex: 'description',
      width: 180,
      slots: {
        customRender: 'description',
      },
    },
    {
      title: '实际得分',
      width: 80,
      align: 'center',
      dataIndex: 'score',
      slots: {
        customRender: 'score',
      },
    },
  ]);
  const itemList = ref<any[]>([]);
  const itemList1 = ref<any[]>([
    {
      category: '目标职责',
      saveFlag: false,
    },
    {
      category: '制度化管理',
      saveFlag: false,
    },
    {
      category: '教育培训',
      saveFlag: false,
    },
    {
      category: '现场管理',
      saveFlag: false,
    },
    {
      category: '安全风险管控及隐患排查治理',
      saveFlag: false,
    },
    {
      category: '应急管理',
      saveFlag: false,
    },
    {
      category: '事故管理',
      saveFlag: false,
    },
    {
      category: '持续改进',
      saveFlag: false,
    },
  ]);
  const itemList2 = ref<any[]>([
    {
      category: '安全生产目标',
      saveFlag: false,
    },
    {
      category: '组织机构和职责',
      saveFlag: false,
    },
    {
      category: '安全投入',
      saveFlag: false,
    },
    {
      category: '法律法规与安全管理制度',
      saveFlag: false,
    },
    {
      category: '教育培训',
      saveFlag: false,
    },
    {
      category: '生产设备设施',
      saveFlag: false,
    },
    {
      category: '作业安全',
      saveFlag: false,
    },
    {
      category: '隐患排查与治理',
      saveFlag: false,
    },
    {
      category: '危险源监控',
      saveFlag: false,
    },
    {
      category: '职业健康',
      saveFlag: false,
    },
    {
      category: '应急救援',
      saveFlag: false,
    },
    {
      category: '事故报告、调查和处理',
      saveFlag: false,
    },
    {
      category: '绩效评定和持续改进',
      saveFlag: false,
    },
  ]);
  const reviewData = ref<any[]>([]);
  const contentRowSpan = computed(() => getRowSpan(reviewData.value, ['content']));
  const projectRowSpan = computed(() => getRowSpan(reviewData.value, ['project']));
  // 计算 rowSpan 的工具函数（支持多字段联合判断）
  const getRowSpan = (data, fields: string | string[]) => {
    const spans: any = [];
    let count = 0;
    const fieldArr = Array.isArray(fields) ? fields : [fields];
    const isSame = (a: any, b: any) => fieldArr.every((field) => a[field] === b[field]);
    data.forEach((record, i) => {
      if (i === 0 || !isSame(record, data[i - 1])) {
        count = 1;
        let j = i + 1;
        while (j < data.length && isSame(data[j], record)) {
          count++;
          j++;
        }
        spans[i] = count;
      } else {
        spans[i] = 0;
      }
    });
    return spans;
  };
  // 定时器变量
  let addEditingTimer: NodeJS.Timeout | null = null;
  let getEditingTimer: NodeJS.Timeout | null = null;
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    id.value = data.data.id;
    title.value = data.title;
    if (data.data.unitType === '西柏坡新能源有限公司') {
      itemList.value = itemList1.value;
    } else {
      itemList.value = itemList2.value;
    }
    activeKey.value = 0;
    currentOperator.value = '';
    isView.value = data.isView || false;
    currentOperatorHeight.value = 0;
    await updateTopList();
    // 测量current-operator高度
    measureCurrentOperatorHeight();
    if (!isView.value) {
      await addEditing({ id: id.value });
      await getEditing({ id: id.value }).then((res) => {
        if (res) {
          currentOperator.value = res.result;
        }
      });
      // 启动定时器
      startTimers();
    }
  });
  // 切换标签页
  const changeTabs = (key) => {
    activeKey.value = key;
    updateTopList(false);
  };
  const changeInvolving = (data) => {
    if (data.isInvolving === '2') data.score = 0;
  };
  // 更新顶部状态
  const updateTopList = async (is = true) => {
    listLoading.value = true;
    reviewData.value = [];
    try {
      await queryById({ id: id.value }).then((res) => {
        const data = res.categoryList;
        itemList.value = itemList.value.map((item) => {
          item.saveFlag = data.filter((ite) => ite.category === item.category)?.[0]?.saveFlag;
          return item;
        });
        if (!isView.value) {
          isSubmit.value = res.categoryList.every((item) => item.saveFlag);
        }
        if (is && !isView.value) {
          // 设置默认激活的项目为第一个未完成的
          const firstIncomplete = itemList.value.findIndex((item) => !item.saveFlag);
          if (firstIncomplete !== -1) {
            activeKey.value = firstIncomplete; // activeKey 从 1 开始
          } else {
            // 如果所有项目都已完成，默认显示第一个
            activeKey.value = 0;
          }
        }
      });
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          await getItemListData({
            id: id.value,
            category: itemList.value[activeKey.value].category,
          });
          resolve();
        }, 400);
      });
    } finally {
      listLoading.value = false;
    }
  };
  // 获取模块下的项目
  const getItemListData = async (params) => {
    getItemList(params).then((res) => {
      const list = res.map((item) => {
        return {
          ...item,
          score: !item.score ? 0 : item.score,
          isInvolving: item.isInvolving || '1',
        };
      });
      reviewData.value = list;
    });
  };
  // 获取标签页样式类
  const getTabClass = (item: any) => {
    if (item.saveFlag) {
      return 'tab-item-completed';
    } else {
      return 'tab-item-incomplete';
    }
  };
  const close = () => {
    closeModal();
    clearTimers();
  };
  const save = async () => {
    const list = reviewData.value;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].description || list[i].description === '') {
        message.error('请填写审核描述!');
        return;
      }
      if (!list[i].score && list[i].score !== 0) {
        message.error('请填写实际得分!');
        return;
      }
    }
    loading.value = true;
    listLoading.value = true;
    try {
      await editItem(list);
      emit('success');
      await updateTopList();
    } finally {
      loading.value = false;
      listLoading.value = false;
    }
  };
  const confirmClose = async () => {
    loading.value = true;
    try {
      await submit({ id: id.value });
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      loading.value = false;
    }
  };
  // 启动定时器
  const startTimers = () => {
    // 清理已存在的定时器
    clearTimers();
    addEditingTimer = setInterval(() => {
      if (id.value) {
        addEditing({ id: id.value });
      }
    }, 60000);
    getEditingTimer = setInterval(() => {
      if (id.value) {
        getEditing({ id: id.value }).then((res) => {
          if (res) {
            currentOperator.value = res.result;
            // 重新测量高度
            measureCurrentOperatorHeight();
          }
        });
      }
    }, 10000);
  };
  // 清理定时器
  const clearTimers = () => {
    if (addEditingTimer) {
      clearInterval(addEditingTimer);
      addEditingTimer = null;
    }
    if (getEditingTimer) {
      clearInterval(getEditingTimer);
      getEditingTimer = null;
    }
  };
  // 测量current-operator的高度
  const measureCurrentOperatorHeight = () => {
    nextTick(() => {
      const operatorElement = document.querySelector('.current-operator') as HTMLElement;
      if (operatorElement) {
        currentOperatorHeight.value = operatorElement.offsetHeight;
      }
    });
  };
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearTimers();
  });
</script>
<style lang="less" scoped>
  /* 选中时文字变红 */
  .radio-red.ant-radio-wrapper.ant-radio-wrapper-checked {
    color: red;
  }

  .tab-item-completed {
    .tab-item-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid #52c41a;
      background: linear-gradient(135deg, #52c41a, #73d13d);
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
      margin-right: 10px;
    }

    .tab-item-title {
      color: #52c41a;
    }
  }

  .tab-item-incomplete {
    .tab-item-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
      background: #fff;
      color: #666;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      margin-right: 10px;
    }

    .tab-item-title {
      color: #666;
    }
  }

  :deep(.ant-tabs-nav) {
    background: #fff;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .ant-tabs-tab {
      margin: 0 15px 0 0;
      padding: 12px 0;
    }

    .ant-tabs-tab-active {
      .tab-item-completed,
      .tab-item-incomplete {
        .tab-item-number {
          background: linear-gradient(135deg, #1890ff, #40a9ff);
          border-color: #1890ff;
          color: #fff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
        }

        .tab-item-title {
          color: #1890ff;
        }
      }
    }
  }

  // 当前操作人样式
  .current-operator {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #fff5f5, #fed7d7);
    border: 1px solid #feb2b2;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.1);
    position: relative;
    overflow: hidden;

    .anticon {
      color: #e53e3e;
      font-size: 18px;
      margin-right: 12px;
      filter: drop-shadow(0 2px 4px rgba(229, 62, 62, 0.2));
    }

    .operator-label {
      color: #c53030;
      font-weight: 600;
      font-size: 15px;
      margin-right: 8px;
    }

    .operator-name {
      color: #e53e3e;
      font-weight: 700;
      font-size: 16px;
      background: linear-gradient(135deg, #e53e3e, #c53030);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(229, 62, 62, 0.1);
    }
  }

  .review-content {
    .review-content-title {
      font-size: 16px;
      font-weight: 600;
      line-height: 60px;

      span {
        color: #999;
        font-size: 12px;
      }
    }
  }

  :deep(.ant-tabs-content-holder) {
    overflow-y: auto;
    height: var(--tabs-height);
  }
</style>
<style lang="less">
  .score-modal {
    .ant-modal {
      max-width: 100% !important;
      top: 0 !important;

      .scroll-container {
        padding-bottom: 0 !important;
      }
    }
  }
</style>
