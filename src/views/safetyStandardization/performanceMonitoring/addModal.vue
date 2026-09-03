<template>
  <div>
    <basic-modal
      wrapClassName="performanceMonitoring-modal"
      v-bind="$attrs"
      @register="registerModal"
      :width="900"
      :bodyStyle="{ padding: '20px' }"
      :title="title"
      :maskClosable="false"
      destroyOnClose
    >
      <a-form :model="info" ref="infoForm" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
        <a-row>
          <a-col :span="12">
            <a-form-item label="所属单位" name="orgCode" :rules="[{ required: showOkBtn, message: '请选择所属单位!' }]">
              <a-select
                v-model:value="info.orgCode"
                style="width: 100%"
                placeholder="请选择"
                :disabled="!showOkBtn"
                showSearch
                :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                :options="orgOptions"
                allowClear
                @change="changeOrg"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属部门" name="departCode" :rules="[{ required: showOkBtn, message: '请选择所属部门!' }]">
              <a-select
                v-model:value="info.departCode"
                style="width: 100%"
                placeholder="请选择"
                :disabled="!showOkBtn"
                showSearch
                :filterOption="(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                :options="departOptions"
                allowClear
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-tabs v-model:activeKey="activeKey" @change="changeTabs">
          <a-tab-pane :key="index" v-for="(item, index) in info.itemList">
            <template #tab>
              <span class="tab-item-incomplete">
                <span class="tab-item-number">{{ index + 1 }}</span>
              </span>
            </template>
            <div class="tab-item-title">{{ item.title }}</div>
            <a-row>
              <a-col :span="12">
                <a-form-item
                  label="监测与测量人"
                  :name="['itemList', index, 'monitorPerson']"
                  :rules="[{ required: showOkBtn, message: '请输入监测与测量人!' }]"
                >
                  <a-input v-model:value="item.monitorPerson" style="width: 100%" placeholder="请输入" :disabled="!showOkBtn" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="监测与测量时间"
                  :name="['itemList', index, 'monitorTime']"
                  :rules="[{ required: showOkBtn, message: '请选择监测与测量时间!' }]"
                >
                  <a-date-picker
                    v-model:value="item.monitorTime"
                    style="width: 100%"
                    placeholder="请选择"
                    :disabled="!showOkBtn"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <a-form-item
                  label="监测与测量结果"
                  :name="['itemList', index, 'monitorResult']"
                  :rules="[{ required: showOkBtn, message: '请输入监测与测量结果!' }]"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 20 }"
                >
                  <a-textarea v-model:value="item.monitorResult" style="width: 100%" placeholder="请输入" :rows="4" :disabled="!showOkBtn" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="改进要求" :name="['itemList', index, 'improveRequire']">
                  <a-input v-model:value="item.improveRequire" style="width: 100%" placeholder="请输入" :disabled="!showOkBtn" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="改进措施" :name="['itemList', index, 'improveMeasure']">
                  <a-input v-model:value="item.improveMeasure" style="width: 100%" placeholder="请输入" :disabled="!showOkBtn" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">保存记录</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { add, edit, queryById } from './api';
  import { message } from 'ant-design-vue';
  const emit = defineEmits(['success']);
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const loading = ref(false);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const info: any = ref({
    id: '',
    orgCode: undefined,
    departCode: undefined,
    itemList: [
      {
        title: '系统运行效果',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '1',
      },
      {
        title: '系统运行中出现的问题和缺陷，所采取的改进措施',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '2',
      },
      {
        title: '统计技术、信息技术等在系统中的使用情况和效果',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '3',
      },
      {
        title: '系统中各种资源的使用效果',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '4',
      },
      {
        title: '绩效监测系统的适宜性以及结果的准确性',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '5',
      },
      {
        title: '与相关方的关系',
        monitorPerson: '',
        monitorTime: '',
        monitorResult: '',
        improveRequire: '',
        improveMeasure: '',
        checkType: '6',
      },
    ],
  });
  const activeKey = ref(0);
  const infoForm = ref();
  // 切换标签页
  const changeTabs = (key) => {
    activeKey.value = key;
  };
  const initOrg = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  const changeOrg = (value) => {
    departOptions.value = [];
    info.value.departCode = undefined;
    if (value) {
      initDepart(value);
    }
  };
  const initDepart = (value) => {
    selectDeptNew({ orgCode: value }).then((res) => {
      departOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoForm.value.resetFields();
    activeKey.value = 0;
    title.value = data.title;
    showOkBtn.value = data.showOkBtn;
    Object.assign(info.value, {
      id: '',
      orgCode: undefined,
      departCode: undefined,
      itemList: [
        {
          title: '系统运行效果',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '1',
        },
        {
          title: '系统运行中出现的问题和缺陷，所采取的改进措施',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '2',
        },
        {
          title: '统计技术、信息技术等在系统中的使用情况和效果',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '3',
        },
        {
          title: '系统中各种资源的使用效果',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '4',
        },
        {
          title: '绩效监测系统的适宜性以及结果的准确性',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '5',
        },
        {
          title: '与相关方的关系',
          monitorPerson: '',
          monitorTime: '',
          monitorResult: '',
          improveRequire: '',
          improveMeasure: '',
          checkType: '6',
        },
      ],
    });
    departOptions.value = [];
    initOrg();
    if (title.value !== '新增') {
      queryById({ id: data.data.id }).then((res) => {
        initDepart(res.orgCode);
        info.value.id = res.id;
        info.value.orgCode = res.orgCode;
        info.value.departCode = res.departCode;
        info.value.itemList.forEach((item, index) => {
          Object.keys(res.itemList[0]).forEach((key) => {
            item[key] = res.itemList[index][key];
          });
        });
      });
    }
  });
  const close = () => {
    closeModal();
  };

  const confirmClose = async () => {
    const list = info.value.itemList;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].monitorPerson || list[i].monitorPerson === '') {
        message.error(`请输入第${i + 1}项监测与测量人!`);
        return;
      }
      if (!list[i].monitorTime || list[i].monitorTime === '') {
        message.error(`请选择第${i + 1}项监测与测量时间!`);
        return;
      }
      if (!list[i].monitorResult || list[i].monitorResult === '') {
        message.error(`请输入第${i + 1}项监测与测量结果!`);
        return;
      }
    }
    await infoForm.value.validate();
    loading.value = true;
    if (title.value === '新增') {
      add({ ...info.value })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      edit({ ...info.value })
        .then((res) => {
          if (res) {
            //关闭弹窗
            closeModal();
            //刷新列表
            emit('success');
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
</script>
<style lang="less">
  .performanceMonitoring-modal {
    .scroll-container {
      padding: 0 !important;
    }
  }
</style>
<style lang="less" scoped>
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
        }
      }
    }
  }
  .tab-item-title {
    color: #1890ff;
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0;
  }
  :deep(.ant-col-4) {
    width: 162px !important;
    flex: none !important;
  }
</style>
