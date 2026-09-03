<template>
  <div style="text-align: center; height: 300px">
    <basic-modal :centered="true" v-bind="$attrs" @register="registerModal" :width="1200" title="添加项目" :mask-closable="false" @cancel="close">
      <a-form
        ref="formRef"
        :model="queryParam"
        :label-col="{
          xs: { span: 12 },
          sm: { span: 5 },
        }"
        :wrapper-col="{
          xs: { span: 24 },
          sm: { span: 19 },
        }"
      >
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="项目名称">
              <a-input allowClear placeholder="请输入" v-model:value="queryParam.projectName" />
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="所属机构">
              <api-select v-model:value="queryParam.orgCode" :api="orgList" label-field="departName" value-field="orgCode" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="项目状态">
              <a-select :options="projectStatusList" v-model:value="queryParam.status" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="12">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>

      <div>
        <!-- <div style="margin-bottom: 16px">
      <a-button type="primary" :disabled="!hasSelected" :loading="state.loading" @click="start">
        刷新
      </a-button>
      <span style="margin-left: 8px">
        <template v-if="hasSelected">
          {{ `选中 ${state.selectedRowKeys.length} 行` }}
        </template>
      </span>
    </div> -->
        <a-table
          ref="table"
          size="small"
          bordered
          rowKey="id"
          :columns="columns"
          :scroll="{ x: 1300, y: 1000 }"
          :dataSource="listInfoData"
          :pagination="false"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        />
      </div>

      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" @click="confirmClose">确认({{ countNum }}) </a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="ehs-eia-add-project" setup>
  import { computed, onMounted, reactive, toRefs, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { orgList, updateBatch, listEiaInfoByCondition } from '../EhsEiaProjectInfo.api';
  import { ApiSelect } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict';

  const { createMessage } = useMessage();
  const emit = defineEmits(['success', 'getStepsTimes']);

  const countNum = ref(0);
  const projectStatusList = ref<any>([]);
  const queryParam = reactive({
    orgCode: '',
    eiaProjectName: '',
    projectName: '',
    status: '',
    applyId: '',
  });

  const updateInfo = reactive({
    eiaProjectName: '',
    applyId: '',
  });

  const [registerModal, { closeModal }] = useModalInner((data) => {
    updateInfo.eiaProjectName = data.record.eiaProjectName;
    updateInfo.applyId = data.record.applyId;

    initQuery();
  });

  async function initDictData() {
    const dictOptions: any = await initDictOptions('eia-info-status');

    dictOptions.forEach((dict) => {
      // 过滤重复数据
      if (dict.value == '0' || dict.value == '1' || dict.value == '2' || dict.value == '3' || dict.value == '4') {
        projectStatusList.value.push(dict);
      }
    });
  }
  onMounted(() => {
    initDictData();
  });

  const close = () => {
    countNum.value = 0;
    // 清空
    state.selectedRowKeys = [];
    resetQueryParam();
    closeModal();
  };
  const confirmClose = async () => {
    try {
      console.log(state.selectedRowKeys);

      let ids = state.selectedRowKeys.join(',');

      let projectDataArr = state.selectionRows;

      if (projectDataArr && projectDataArr.length > 0) {
        let projectNameArr = [];

        for (let eiaInfo of projectDataArr) {
          if (null == eiaInfo.orgName || '' == eiaInfo.orgName || undefined == eiaInfo.orgName) {
            projectNameArr.push(eiaInfo.projectName);
          }
        }
        if (projectNameArr && projectNameArr.length > 0) {
          createMessage.warning('请在项目申请列表为以下项目添加所属机构:' + projectNameArr.join(','));
          return;
        }
      }

      let params = {
        ids: ids,
        eiaProjectName: updateInfo.eiaProjectName,
        applyId: updateInfo.applyId,
        status: '5',
      };
      await updateBatch(params);

      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', 6);

      // 子组件时间传递
      let stepsTimes = {};

      emit('getStepsTimes', stepsTimes);

      // 刷新
      countNum.value = 0;
      // 清空
      state.selectedRowKeys = [];
      resetQueryParam();
      initQuery();
    } catch (e) {}
  };

  // onMounted(() => {
  //   searchQuery();
  // });

  // searchReset();
  // let listInfoData = [];
  // let listInfoData: DataType[] = [];
  const listInfoData = ref([]);

  async function initQuery() {
    listInfoData.value = [];
    let params = Object.assign({}, queryParam);
    // 审批中、审批通过、已关闭、合同签订、已备案
    let status = '0,1,2,3,4';
    params.status = status;
    await listEiaInfoByCondition(params).then((res) => {
      listInfoData.value.push(...res);
    });
  }

  async function searchQuery() {
    listInfoData.value = [];
    let params = Object.assign({}, queryParam);
    await listEiaInfoByCondition(params).then((res) => {
      listInfoData.value.push(...res);
    });
  }

  async function searchReset() {
    queryParam.orgCode = '';
    queryParam.status = '';
    queryParam.projectName = '';
    initQuery();
  }

  function resetQueryParam() {
    queryParam.orgCode = '';
    queryParam.status = '';
    queryParam.projectName = '';
    queryParam.eiaProjectName = '';
  }

  type Key = string | number;

  interface DataType {
    key: Key;
    projectName: string;
    type: string;
    status: string;
    orgName: string;
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: '600',
    },
    {
      title: '项目类型1',
      dataIndex: 'type',
    },
    {
      title: '所属机构',
      dataIndex: 'orgName',
    },
    {
      title: '项目状态',
      dataIndex: 'status_dictText',
    },
  ];

  const state = reactive<{
    selectedRowKeys: Key[];
    selectionRows: [];
    loading: boolean;
  }>({
    selectedRowKeys: [], // Check here to configure the default column
    selectionRows: [],
    loading: false,
  });
  toRefs(state);
  const hasSelected = computed(() => state.selectedRowKeys.length > 0);

  const start = () => {
    state.loading = true;
    // ajax request after empty completing
    setTimeout(() => {
      state.loading = false;
      state.selectedRowKeys = [];
      state.selectionRows = [];
    }, 1000);
  };
  const onSelectChange = (selectedRowKeys: Key[], rows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    console.log('selectionRows changed: ', rows);
    state.selectedRowKeys = selectedRowKeys;
    state.selectionRows = rows;
    countNum.value = selectedRowKeys.length;
  };

  function filterOption(input, option) {
    console.log(option);
    // return option.children()[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }
</script>

<style scoped></style>
