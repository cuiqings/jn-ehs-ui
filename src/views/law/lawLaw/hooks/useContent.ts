import { ref, onMounted, reactive, watch } from 'vue';
import { list, getChildList, details } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { initDictOptions } from '/@/utils/dict';
export const useContent = (fileType: string) => {
  const conditionsValue = ref('标题');
  const value = ref('');
  const dataSource: any = ref([]);
  const isContent = ref('content');
  const expandedKeys: any = ref([]);
  const treeData: any = ref([]);
  const count = ref(0);
  const breadcrumbText = ref('');
  // 实施日期选中
  const executeSelected = ref('全部');
  const executeDate = ref([]);
  const page = reactive({
    total: 0, // 共多少条
    pageSize: 10,
    pageNo: 1,
  });
  const queryParams = reactive({
    executeDateBegin: '',
    executeDateEnd: '',
    topicCategory: '',
    topicTwoCategory: '',
    legalHierarchy: '',
    hierarchyStatus: '',
    publishDepart: '',
    technicalOmmittees: '',
    tradeStandardCategort: '',
    area: undefined,
  });
  const listObj = ref({});
  const legalHierarchyArr: any = ref([]);
  const legalHierarchySelected = ref(['']);
  const statusArr: any = ref([]);
  const statusSelected = ref(['']);
  const spinning = ref(true);
  const tradeStandardCategortCode = ref('');
  const treeLoading = ref(false);
  watch(
    () => fileType,
    (value) => {
      if (value) {
        switch (value) {
          case '1':
            breadcrumbText.value = '法律法规';
            break;
          case '2':
            breadcrumbText.value = '国家标准';
            break;
          case '3':
            breadcrumbText.value = '行业标准';
            break;
          case '4':
            breadcrumbText.value = '地方标准';
            break;
        }
      }
    },
    { immediate: true }
  );
  onMounted(async () => {
    treeLoading.value = true;
    const res = await getChildList({ pid: '1719911661011816449' });
    if (res.success && res.result.length > 0) {
      //已展开的数据批量子节点
      const records = res.result;
      let arr: any = [];
      count.value = 0;
      arr = records.map(async (item) => {
        if (item.hasChild !== '1') item.isLeaf = true;
        item.fatherName = null;
        item.lawCount = item.lawCount ? item.lawCount : 0;
        item.chinaStandardCount = item.chinaStandardCount ? item.chinaStandardCount : 0;
        item.internalStandardCount = item.internalStandardCount ? item.internalStandardCount : 0;
        item.areaStandardCount = item.areaStandardCount ? item.areaStandardCount : 0;
        let num = 0;
        switch (fileType) {
          case '1':
            num = item.lawCount;
            break;
          case '2':
            num = item.chinaStandardCount;
            break;
          case '3':
            num = item.internalStandardCount;
            break;
          case '4':
            num = item.areaStandardCount;
            break;
        }
        item.name = item.name + `（${num}）`;
        count.value += num;
        item.children = [];
        if (item.hasChild === '1') {
          const obj = await getChildList({ pid: item.id });
          if (obj.success && obj.result.length > 0) {
            item.children = obj.result.map((ite) => {
              ite.isLeaf = true;
              ite.fatherName = item.name;
              ite.lawCount = ite.lawCount ? ite.lawCount : 0;
              ite.chinaStandardCount = ite.chinaStandardCount ? ite.chinaStandardCount : 0;
              ite.internalStandardCount = ite.internalStandardCount ? ite.internalStandardCount : 0;
              ite.areaStandardCount = ite.areaStandardCount ? ite.areaStandardCount : 0;
              let num = 0;
              switch (fileType) {
                case '1':
                  num = ite.lawCount;
                  break;
                case '2':
                  num = ite.chinaStandardCount;
                  break;
                case '3':
                  num = ite.internalStandardCount;
                  break;
                case '4':
                  num = ite.areaStandardCount;
                  break;
              }
              ite.name = ite.name + `（${num}）`;
              item.children = [];
              return ite;
            });
          }
        }
        return item;
      });
      Promise.all(arr).then((data) => {
        treeData.value = data;
        treeLoading.value = false;
      });
    }
    legalHierarchyArr.value = await dict('law_level');
    statusArr.value = await dict('law_status');
    onSearch();
  });
  const dict = async (code) => {
    const dictData = await initDictOptions(code);
    dictData.unshift({
      value: '',
      label: '全部',
    });
    return dictData;
  };
  const onSearch = ({ pageNo = 1 } = {}) => {
    page.pageNo = pageNo;
    spinning.value = true;
    if (queryParams.topicCategory !== '') {
      queryParams.topicCategory = queryParams.topicCategory.replace(/\（[^（）]*\）/g, '');
    }
    if (queryParams.topicTwoCategory !== '') {
      queryParams.topicTwoCategory = queryParams.topicTwoCategory.replace(/\（[^（）]*\）/g, '');
    }
    list({
      column: 'executeDate',
      order: 'desc',
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      fileType,
      fileContent: conditionsValue.value === '内容' ? value.value : '',
      fileName: conditionsValue.value === '标题' ? value.value : '',
      ...queryParams,
    })
      .then((res) => {
        dataSource.value = res.records.map((item) => {
          if (item.fileContent && item.fileContent.length > 0) {
            item.fileContent = item.fileContent.replace(/(<[^>]+>|&nbsp;|\s)/g, '');
            if (item.fileContent.length > 140) {
              item.fileContent = item.fileContent.slice(0, 140) + '...';
            }
            if (conditionsValue.value === '内容') {
              const char = value.value; // 指定要匹配的字符
              const regex = new RegExp(char, 'g');
              item.fileContent = item.fileContent.replace(regex, `<span style='color:red'>${char}</span>`);
            }
          }
          if (conditionsValue.value === '标题') {
            const char = value.value; // 指定要匹配的字符
            const regex = new RegExp(char, 'g');
            item.fileName = item.fileName.replace(regex, `<span style='color:red'>${char}</span>`);
          }
          return item;
        });
        page.total = res.total;
        isContent.value = 'content';
      })
      .finally(() => {
        spinning.value = false;
      });
  };
  const enterPressHadlerSearc = (e) => {
    if (e.keyCode === 13) {
      onSearch();
    }
  };
  // 重置
  const onReset = () => {
    value.value = '';
    Object.keys(queryParams).forEach((key) => {
      if (key !== 'topicCategory' && key !== 'topicTwoCategory') {
        queryParams[key] = '';
      }
    });
    queryParams.area = undefined;
    conditionsValue.value = '标题';
    executeDate.value = [];
    executeSelected.value = '全部';
    legalHierarchySelected.value = [''];
    statusSelected.value = [''];
    tradeStandardCategortCode.value = '';
    onSearch();
  };
  // 树节点选中
  const selectTree = (selectedKeys, e) => {
    if (selectedKeys.length > 0) {
      if (e.node.fatherName) {
        queryParams.topicCategory = e.node.fatherName;
        queryParams.topicTwoCategory = selectedKeys[0];
      } else {
        queryParams.topicCategory = selectedKeys[0];
        queryParams.topicTwoCategory = '';
      }
    } else {
      queryParams.topicCategory = '';
      queryParams.topicTwoCategory = '';
    }
    onSearch();
  };
  // 展开全部
  const onExpandAll = () => {
    expandedKeys.value = [];
    treeData.value.forEach((item) => {
      if (item.children.length > 0) {
        expandedKeys.value.push(item.name);
      }
    });
  };
  //关闭全部
  const onExpand = () => {
    expandedKeys.value = [];
  };
  // 实施日期时间框查询
  const onDate = (value) => {
    if (value && value.length > 0) {
      executeSelected.value = '全部';
      queryParams.executeDateBegin = value[0];
      queryParams.executeDateEnd = value[1];
    } else {
      queryParams.executeDateBegin = '';
      queryParams.executeDateEnd = '';
      executeDate.value = [];
    }
    onSearch();
  };
  const onDateSelect = (value) => {
    executeSelected.value = value;
    executeDate.value = [];
    queryParams.executeDateEnd = timeDate(new Date().getTime());
    switch (value) {
      case '全部':
        queryParams.executeDateBegin = '';
        queryParams.executeDateEnd = '';
        onSearch();
        break;
      case '近一月':
        queryParams.executeDateBegin = timeDate(new Date().getTime() - 2592000000);
        break;
      case '近三月':
        queryParams.executeDateBegin = timeDate(new Date().getTime() - 7776000000);
        break;
      case '近一年':
        queryParams.executeDateBegin = timeDate(new Date().getTime() - 31536000000);
        break;
      case '近两年':
        queryParams.executeDateBegin = timeDate(new Date().getTime() - 63072000000);
        break;
    }
    onSearch();
  };
  // 法律法规
  const onLegalHierarchy = (value) => {
    if (value === '') legalHierarchySelected.value = [value];
    else {
      if (legalHierarchySelected.value.includes(value)) legalHierarchySelected.value.splice(legalHierarchySelected.value.indexOf(value), 1);
      else {
        if (legalHierarchySelected.value.includes('')) legalHierarchySelected.value.splice(legalHierarchySelected.value.indexOf(''), 1);
        legalHierarchySelected.value.push(value);
      }
    }
    if (legalHierarchySelected.value.length === 0) legalHierarchySelected.value = [''];
    queryParams.legalHierarchy = legalHierarchySelected.value.join(',');
    onSearch();
  };
  // 法规状态
  const onStatus = (value) => {
    if (value === '') statusSelected.value = [value];
    else {
      if (statusSelected.value.includes(value)) statusSelected.value.splice(statusSelected.value.indexOf(value), 1);
      else {
        if (statusSelected.value.includes('')) statusSelected.value.splice(statusSelected.value.indexOf(''), 1);
        statusSelected.value.push(value);
      }
    }
    if (statusSelected.value.length === 0) statusSelected.value = [''];
    queryParams.hierarchyStatus = statusSelected.value.join(',');
    onSearch();
  };
  // 分页
  const onChange = (pageNumber: number) => {
    onSearch({ pageNo: pageNumber });
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
  // 年月日/年月日时分
  const timeDate = (eventTime: string | number) => {
    const date = new Date(eventTime);
    let str = '';
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    str = Y + M + D;
    return str;
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
  const neicChange = (value, extra) => {
    if (value) {
      queryParams.tradeStandardCategort = extra.triggerNode.props.label;
    } else {
      queryParams.tradeStandardCategort = '';
    }
  };
  return {
    conditionsValue,
    value,
    onSearch,
    enterPressHadlerSearc,
    isContent,
    expandedKeys,
    treeData,
    count,
    executeSelected,
    onDateSelect,
    dataSource,
    renderDict,
    executeDate,
    onDate,
    page,
    onChange,
    selectTree,
    onView,
    listObj,
    onSuccess,
    breadcrumbText,
    legalHierarchyArr,
    legalHierarchySelected,
    onLegalHierarchy,
    statusArr,
    statusSelected,
    onStatus,
    queryParams,
    onReset,
    onExpandAll,
    onExpand,
    spinning,
    neicChange,
    tradeStandardCategortCode,
    treeLoading,
  };
};
export default useContent;
