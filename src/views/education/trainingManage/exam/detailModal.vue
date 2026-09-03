<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      @cancel="close"
      @close="close"
      @register="registerModal"
      :width="'80%'"
      :bodyStyle="{ padding: '10px 20px 0 0' }"
      :title="title"
      destroyOnClose
      :maskClosable="false"
    >
      <a-card style="width: 100%">
        <div class="statisc">
          <div class="item"
            >应考人数
            <span>{{ statisc.totalNumber }}</span>
          </div>
          <div class="item"
            >已参考
            <span>{{ statisc.referenced }}</span>
          </div>
          <div class="item"
            >参考率
            <span>{{ statisc.referencedRate }}</span>
          </div>
          <div class="item"
            >试卷分
            <span>{{ statisc.score }}</span>
          </div>
          <div class="item"
            >及格分
            <span>{{ statisc.passScore }}</span>
          </div>
          <div class="item"
            >最高分
            <span>{{ statisc.highScore }}</span>
          </div>
          <div class="item"
            >平均分
            <span>{{ statisc.averageScore }}</span>
          </div>
          <div class="item"
            >合格率
            <span>{{ statisc.passRate }}</span>
          </div>
        </div>
      </a-card>
      <a-card style="width: 100%; margin-top: 16px">
        <div class="hd">
          <div class="left"></div>
          <div class="right"></div>
        </div>
        <basic-table @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
          <template #form-type="{ model, field }">
            <a-radio-group v-model:value="model[field]" button-style="solid" @change="onRadioChange">
              <a-radio-button value="1">应考人数({{ statisc.totalNumber }})</a-radio-button>
              <a-radio-button value="2">已及格({{ statisc.passNum }})</a-radio-button>
              <a-radio-button value="3">不及格({{ statisc.noPassNum }})</a-radio-button>
              <a-radio-button value="4">未参考({{ statisc.notReferenced }})</a-radio-button>
            </a-radio-group>
          </template>
          <template #tableTitle>
            <a-button type="primary" @click="onExportXls">导出考试明细</a-button>
            <a-button type="primary" @click="addPerson">新增</a-button>
            <a-button
              preIcon="ant-design:delete-outlined"
              v-auth="'trainingTasks:viewDel'"
              v-if="selectedRowKeys.length > 0"
              @click="batchHandleDelete"
            >
              批量删除</a-button
            >
          </template>
          <template #examPaperName="{ record }">
            <span>{{ record.examPaperName }}</span>
          </template>
          <template #action="{ record }">
            <table-action :actions="getActions(record)" />
          </template>
        </basic-table>
      </a-card>
    </BasicDrawer>
    <ExamRecord @register="registerRecore" />
    <a-modal v-model:visible="visible1" :width="600" :body-style="{ padding: '20px' }" title="新增" z-index="1001" :maskClosable="false">
      <a-form :model="viewForm" ref="viewFormRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
        <a-form-item label="新增人员" name="ids" :rules="[{ required: true, message: '新增人员为必填项！' }]">
          <JUserModal v-model:value="viewForm.ids" type="checkbox" placeholder="请选择" :zIndex="1200" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="back" @click="() => (visible1 = false)">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">确认</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, onMounted } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { statistics, examDetails, addUser } from './url/index';
  import { useDetailContent } from './hooks/useDetailContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import ExamRecord from '../../../studyTraining/trainingTasks/examRecord.vue';
  import { JUserModal } from '/@/components/Form';
  import type { FormInstance } from 'ant-design-vue';
  const title = ref('');
  const statisc = ref<any>({});
  const taskId = ref('');
  const [registerModal, { closeDrawer }] = useDrawerInner(async (data) => {
    title.value = data.title;
    statisc.value = await statistics(data.data.id);
    taskId.value = data.data.id;
    pageInit(taskId.value);
    console.log(statisc);
  });

  const close = () => {
    closeDrawer();
  };

  const onRadioChange = () => {
    pageInit(taskId.value);
  };

  // 添加人员
  const visible1 = ref(false);
  const viewForm = ref({ids: ''})
  const viewFormRef = ref<FormInstance|null>();
  const addPerson = () => {
    visible1.value = true;
  };
  const loading = ref(false);
  const handleOk = async() => {
    await viewFormRef.value?.validate();
    loading.value = true;
    addUser({userId: viewForm.value.ids, id: taskId.value}).then(() => {
      visible1.value = false;
      pageInit(taskId.value);
      viewForm.value.ids = '';
    }).finally(() => {
      loading.value = false;
    });

  }

  const { onExportXls, pageInit, registerTable, rowSelection, selectedRowKeys, batchHandleDelete, getActions, registerRecore } = useDetailContent();
</script>
<style lang="less" scoped>
  .statisc {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .item {
      display: flex;
      flex-direction: column;
      text-align: center;
      color: #666;
      span {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        padding-top: 15px;
      }
    }
  }
  .hd {
    display: flex;
    justify-content: space-between;
    .left {
    }
    .right {
    }
  }
</style>
