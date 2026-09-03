<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="提醒未填报人员"
    :width="'70%'"
    :canFullscreen="false"
    @ok="handleOk"
    okText="发送提醒"
    cancelText="取消"
  >
    <div class="remind-container">
      <div class="section">
        <div class="section-title">未填报人员列表（共{{ totalSize }}人）</div>
        <div class="user-list-box">
          <!-- <div v-for="(user, index) in userList" :key="index" class="user-item"> {{ user.name }} - {{ user.dept }} - {{ user.status }} </div> -->
           <BasicTable @register="registerTable" @fetch-success="fetchSuccess" :maxHeight="300" height="300px">
          </BasicTable>
        </div>
      </div>
      <div class="section">
        <div class="section-title">提醒方式</div>
        <div class="method-options">
          <a-checkbox v-model:checked="formState.systemNotify">系统内消息通知</a-checkbox>
        </div>
      </div>
      <div class="section">
        <div class="section-title">提醒内容</div>
        <a-textarea v-model:value="formState.content" :rows="4" placeholder="请输入提醒内容" />
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { queryUnAnswerList, send } from './api'

  const { createMessage } = useMessage();
  const totalSize = ref<any>({});
  const formState = reactive({
    systemNotify: true,
    content: '',
  });

  const curId = ref('');
  const [registerModal, { closeModal, changeLoading }] = useModalInner(async (data) => {
    curId.value = data.id;
    reload();
    formState.content = `您好！您有一份【${data.name || '问卷'}】问卷待填写，请于${data.endTime || '近期'}前完成填报。感谢您的配合！`;
  });

  const fetchSuccess = (data) => {
    totalSize.value = data.total;
  };

  const searchFormSchema = <FormSchema[]>[
      {
        label: '姓名',
        field: 'name',
        component: 'Input',
      },
    ];
    const { tableContext } = useListPage({
      designScope: 'questionnaire-list',
      tableProps: {
        api: queryUnAnswerList,
        columns: [
          { title: '所属单位', dataIndex: 'orgName' },
          { title: '人员姓名', dataIndex: 'realName' },
          { title: '工号', dataIndex: 'workNo' },
        ],
        immediate: false,
        beforeFetch: (params) => {
          params.id = curId.value;
          return params;
        },
        showHeader: false,
        useSearchForm: false,
        showIndexColumn: true,
        showActionColumn: false,
        indexColumnProps: {
          fixed: 'left',
        },
      },
    });
 const [registerTable, { reload }] = tableContext;

 const loading = ref(false);
  const handleOk = () => {
    if(loading.value) return;
    if (!formState.systemNotify) {
      createMessage.warning('请至少选择一种提醒方式');
      return;
    }
    changeLoading(true);
    loading.value = true;
    send({ id: curId.value, systemNotify: formState.systemNotify, content: formState.content }).then(() => {
      closeModal();
      createMessage.success('发送提醒成功！');
    }).finally(() => {
      changeLoading(false);
      loading.value = false;
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-table-title){
    display: none !important;
  }
  .remind-container {
    padding: 10px;
  }
  .section {
    margin-bottom: 20px;
  }
  .section-title {
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
    font-size: 14px;
  }
  .user-list-box {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 10px;
    height: 350px;
    overflow-y: auto;
    background: #fafafa;
  }
  .user-item {
    line-height: 24px;
    color: #333;
  }
  .method-options {
    display: flex;
    gap: 20px;
  }
</style>
