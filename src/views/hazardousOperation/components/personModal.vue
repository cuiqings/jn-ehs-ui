<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" width="70%" wrap-class-name="mark-modal" destroyOnClose @cancel="close">
      <div class="modal-body">
        <BasicTable @register="registerTable" @selection-change="selectionChange" :rowSelection="rowSelection" />
      </div>
      <template #footer>
        <div>
          <a-button @click="close">取消</a-button>
          <a-button v-if="type !== 'view'" type="primary" @click="handleSubmit">提交</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" name="mark-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { ref } from 'vue';
  import { getIdCode } from '../api';

  const emit = defineEmits(['submit']);
  const selection = ref([]);

  const columns: BasicColumn[] = [
    {
      title: '所属单位',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: '人员姓名',
      dataIndex: 'realname',
      key: 'realname',
    },
    {
      title: '工号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '证书',
      dataIndex: 'certificationsName',
      key: 'certificationsName',
    },
  ];
  const searchFormSchema: FormSchema[] = [
    {
      label: '人员姓名/工号',
      field: 'userName',
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      colProps: { span: 8 },
    },
  ];
  const hiddenFormData: any = ref({});
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    if (data.workType) {
      reload();
    }
    if (data.operator) {
      selection.value = data.operator.split(',');
      setSelectedRowKeys(selection.value);
      if (data.operatorList) {
        selectionRows.value = JSON.parse(JSON.stringify(data.operatorList));
      }
      delete data.operatorList;
    }
    hiddenFormData.value = data;
  });

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: getIdCode,
      title: '用户列表',
      formConfig: {
        schemas: searchFormSchema,
        submitFunc: () => {
          // if (getForm().getFieldsValue().org && !getForm().getFieldsValue().orgCode) {
          //   createMessage.info('请选择所属车间！');
          //   return Promise.resolve();
          // }
          // if (!getForm().getFieldsValue().orgCode) {
          //   getDepart(hiddenFormData.value);
          //   getForm().setFieldsValue({
          //     orgCode: hiddenFormData.value.orgCode,
          //     org: hiddenFormData.value.orgCode.slice(0, 6),
          //   });
          // }
          reload();
          return Promise.resolve();
        },
      },
      columns: columns,
      size: 'small',
      rowSelection: { type: 'checkbox' },
      rowKey: 'id',
      immediate: false,
      showActionColumn: false,
      beforeFetch: (params) => {
        params.cardFlag = hiddenFormData.value.cardFlag;
        params.workType = hiddenFormData.value.workType;
        return params;
      },
      handleSearchInfoFn: (params) => {
        params.cardFlag = hiddenFormData.value.cardFlag;
        params.workType = hiddenFormData.value.workType;
        return params;
      },
    },
  });

  const [registerTable, { reload, setColumns, setSelectedRowKeys, getSelectRowKeys, getSelectRows, getDataSource }, { rowSelection }] = tableContext;

  const selectionRows = ref<any[]>([]);
  const selectionChange = ({ keys, rows }) => {
    console.log(rows);

    if (keys.length == 0) return;
    if (rows.length > 0) {
      selectionRows.value = [...selectionRows.value, ...JSON.parse(JSON.stringify(rows))];
    }
    selectionRows.value = selectionRows.value.filter((val) => keys.includes(val.id));

    selectionRows.value = uniqueArrayByMap(selectionRows.value, 'id');
    function uniqueArrayByMap(arr, property) {
      const map = new Map();
      for (const item of arr) {
        map.set(item[property], item);
      }
      return Array.from(map.values());
    }
  };
  const handleSubmit = () => {
    let map: { ids?: string; names?: string } = { names: '' };
    console.log(getSelectRows());

    let rowkeys = getSelectRowKeys();
    let rows: any[] = [];
    map.ids = rowkeys.join(',');
    // getDataSource().forEach((item) => {
    //   rowkeys.forEach((key) => {
    //     if (item.userId == key) {
    //       map.names += item.userName + ',';
    //       item.userName = item.userName;
    //       item.cardInfo = item.project;
    //       item.id = item.userId;
    //       item.realname = item.userName;
    //       rows.push(item);
    //     }
    //   });
    // });
    getSelectRows().forEach((item: any) => {
      map.names += item.realname + ',';
      item.userName = item.realname;
      item.cardInfo = item.project;
      item.id = item.id;
      rows.push(item);
    });
    map.names = map.names && map.names.substring(0, map.names.length - 1);
    console.log('handleSubmit', rows);

    emit('submit', { map, rows: rows });
    setSelectedRowKeys([]);
    closeModal();
  };

  const close = () => {
    setSelectedRowKeys([]);
    closeModal();
    if (columns.find((item) => item.title == '证件信息')) {
      columns.splice(3, 1);
    }
    setColumns(columns);
  };
</script>
<style lang="less" scoped>
  .modal-body {
    min-height: 500px;
  }
</style>
