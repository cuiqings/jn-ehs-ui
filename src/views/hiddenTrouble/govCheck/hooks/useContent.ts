import { list, del, download } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
import { createVNode, ref, computed } from 'vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { useModal } from '/@/components/Modal';
import dayjs from 'dayjs';

export const useContent = () => {
  const { createConfirm } = useMessage();
  const [registerAdd, { openModal }] = useModal();
  
  const searchFormSchema = <FormSchema[]>[
    {
      field: 'start',
      label: '检查时间',
      component: 'RangeDate',
      componentProps: {
        placeholder: ['开始日期', '结束日期'],
        format: 'YYYY-MM-DD',
        separator: '至',
        clearable: true,
      },
      colProps: { span: 6 },
    },
    {
      label: '检查级别',
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '国家',
            value: '国家',
          },
          {
            label: '省',
            value: '省',
          },
          {
            label: '市',
            value: '市',
          },
          {
            label: '县级',
            value: '县级',
          }
        ],
      },
      colProps: { span: 6 },
    },
    {
      label: '名称',
      field: 'name',
      component: 'Input',
      colProps: { span: 6 },
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '检查时间',
      dataIndex: 'checkDate',
      width: 90,
      align: 'left',
    },
    {
      title: '检查级别',
      width: 100,
      dataIndex: 'checkLevel',
    },
    {
      title: '名称',
      width: 146,
      dataIndex: 'name',
    },
    {
      title: '相关文件',
      dataIndex: 'file',
      slots: { customRender: 'file' },
      width: 290,
    }
  ];
  const getActions = (record: any) => {
    return [
      {
        label: '查看',
        onClick: onView.bind(null, record),
      },
      {
        label: '编辑',
        auth: ['govcheck:edit'],
        onClick: onEdit.bind(null, record),
      },
      {
        label: '下载',
        auth: ['govcheck:download'],
        onClick: onDownload.bind(null, record),
      },
      {
        label: '删除',
        auth: ['govcheck:del'],
        onClick: onDel.bind(null, record),
      },
    ];
  };
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'govcheck-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        if(params.start){
          let d = params.start.split(',');
          params.checkStartDate = d[0]
          params.checkEndDate = d[1]
        }
        return params;
      },
      defSort: {
        column: 'updateTime',
        order: 'desc',
      },
      showIndexColumn: true,
      indexColumnProps: {
        fixed: 'left',
      },
      actionColumn: {
        width: 120,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
      },
      rowSelection: { type: 'checkbox' }, 
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  // 新增
  const onAdd = () => {
    openModal(true, {
      title: '新增检查记录',
    });
  };
  // 查看
  const onView = (data) => {
    openModal(true, {
      title: '查看',
      data,
    });
  };
  // 编辑
  const onEdit = (data) => {
    openModal(true, {
      title: '编辑',
      data,
    });
  };
  let submitIng = ref(false);
  // 下载
  const onDownload = (data) => {
    download({id: data.id}).then(res => {
      let blobOptions = { type: 'application/政府检查.zip' };
      let fileSuffix = '.zip';
      let url = window.URL.createObjectURL(new Blob([res], blobOptions));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', `政府检查-${dayjs(new Date()).format('YYYY-MM-DD')}${fileSuffix}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      submitIng.value = false
    }).catch(e => {
      submitIng.value = false
    })
  };
  // 删除
  const onDel = (data) => {
    createConfirm({
      iconType: 'warning',
      icon: createVNode(QuestionCircleOutlined),
      title: '删除',
      content: '确定要删除吗？',
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          del({ id: data.id })
            .then((res) => {
              if (res) {
                handleSuccess();
                resolve();
              } else {
                reject(new Error('删除失败！'));
              }
            })
            .catch(() => {
              resolve();
            });
        });
      },
    });
  };

  const handleSuccess = () => {
    reload();
  };
  return {
    getActions,
    registerTable,
    onAdd,
    handleSuccess,
    registerAdd,
    rowSelection, selectedRowKeys
  };
};
export default useContent;
