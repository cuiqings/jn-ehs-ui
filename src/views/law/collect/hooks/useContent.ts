import { ref, onMounted, reactive } from 'vue';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { list, getChildList, details } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { render } from '/@/utils/common/renderUtils';
export const useContent = () => {
  const isContent = ref('content');
  const expandedKeys: any = ref([]);
  const treeData: any = ref([]);
  const count = ref(0);
  const breadcrumbText = ref('我的收藏');
  const listObj = ref({});
  const queryParams = reactive({
    topicCategory: '',
    topicTwoCategory: '',
  });
  const treeLoading = ref(false);
  const searchFormSchema = <FormSchema[]>[
    {
      label: '关键字',
      field: 'fileName',
      component: 'Input',
      componentProps: {
        placeholder: '请输入文件名称',
      },
      colProps: { span: 8 },
    },
    {
      field: 'topicCategory',
      component: 'Input',
      show: false,
    },
    {
      field: 'topicTwoCategory',
      component: 'Input',
      show: false,
    },
  ];
  const columns = <BasicColumn[]>[
    {
      title: '文件编号',
      dataIndex: 'standardNumber',
    },
    {
      title: '文件名称',
      dataIndex: 'fileName',
      slots: { customRender: 'fileName' },
    },
    {
      title: '状态',
      width: 200,
      dataIndex: 'hierarchyStatus',
      customRender: ({ text }) => {
        return render.renderDict(text, 'law_status');
      },
    },
    {
      title: '实施日期',
      width: 200,
      dataIndex: 'executeDate',
    },
  ];
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'incidentExpress-list',
    tableProps: {
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      defSort: {
        column: 'executeDate',
      },
      showActionColumn: false,
      showIndexColumn: true,
      beforeFetch: (params) => {
        if (queryParams.topicCategory !== '') {
          params.topicCategory = queryParams.topicCategory;
        }
        if (queryParams.topicTwoCategory !== '') {
          params.topicTwoCategory = queryParams.topicTwoCategory;
        }
        return params;
      },
    },
  });
  const [registerTable, { reload }] = tableContext;
  onMounted(async () => {
    treeLoading.value = true;
    getChildList({ pid: '1719911661011816449' })
      .then((res) => {
        if (res.success && res.result.length > 0) {
          //已展开的数据批量子节点
          const records = res.result;
          treeData.value = records.map((item) => {
            item.fatherName = null;
            item.name = item.topicCategory + `（${item.topicCategoryCount}）`;
            item.children = item.twoTopicCategory;
            count.value += item.topicCategoryCount;
            if (item.twoTopicCategory.length > 0) {
              childrenNode(item);
              item.isLeaf = false;
            } else {
              item.isLeaf = true;
            }
            return item;
          });
        }
      })
      .finally(() => {
        treeLoading.value = false;
      });
  });
  const childrenNode = (data) => {
    return data.twoTopicCategory.map((item) => {
      item.name = item.topicCategory + `（${item.topicCategoryCount}）`;
      item.children = item.twoTopicCategory;
      item.fatherName = data.name;
      if (item.twoTopicCategory.length > 0) {
        childrenNode(item);
        item.isLeaf = false;
      } else {
        item.isLeaf = true;
      }
      return item;
    });
  };
  // 树节点选中
  const selectTree = (selectedKeys, e) => {
    if (selectedKeys.length > 0) {
      if (e.node.fatherName) {
        queryParams.topicCategory = e.node.fatherName.replace(/\（[^（）]*\）/g, '');
        queryParams.topicTwoCategory = selectedKeys[0].replace(/\（[^（）]*\）/g, '');
      } else {
        queryParams.topicCategory = selectedKeys[0].replace(/\（[^（）]*\）/g, '');
        queryParams.topicTwoCategory = '';
      }
    } else {
      queryParams.topicCategory = '';
      queryParams.topicTwoCategory = '';
    }
    reload();
  };
  // 展开全部
  const onExpandAll = () => {
    expandedKeys.value = [];
    treeData.value.forEach((item) => {
      if (item.twoTopicCategory.length > 0) {
        expandedKeys.value.push(item.topicCategory + `（${item.topicCategoryCount}）`);
        childrenExpand(item.twoTopicCategory);
      }
    });
  };
  const childrenExpand = (data) => {
    data.forEach((item) => {
      if (item.twoTopicCategory.length > 0) {
        expandedKeys.value.push(item.topicCategory + `（${item.topicCategoryCount}）`);
        childrenExpand(item.twoTopicCategory);
      }
    });
  };
  //关闭全部
  const onExpand = () => {
    expandedKeys.value = [];
  };
  // 详情查看
  const onView = (data) => {
    isContent.value = 'view';
    details({ id: data.id }).then((res) => {
      listObj.value = { ...res };
    });
  };
  const onSuccess = () => {
    isContent.value = 'content';
  };

  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  return {
    isContent,
    expandedKeys,
    treeData,
    count,
    renderDict,
    selectTree,
    onView,
    listObj,
    onSuccess,
    breadcrumbText,
    registerTable,
    onExpandAll,
    onExpand,
    treeLoading,
  };
};
export default useContent;
