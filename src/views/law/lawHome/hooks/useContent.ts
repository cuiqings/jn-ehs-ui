import { ref, onMounted, watch, reactive } from 'vue';
import { list, getChildList, details } from '../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
export const useContent = () => {
  const conditionsValue = ref('标题');
  const value = ref('');
  const listArr: any = ref([]);
  const dataSource: any = ref([]);
  const isContent = ref('home');
  const expandedKeys: any = ref([]);
  const treeData: any = ref([]);
  const count = ref(0);
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
  });
  const listObj = ref({});
  const type = ref('');
  const spinning = ref(true);
  const treeLoading = ref(false);
  onMounted(() => {
    list({
      column: 'executeDate',
      order: 'desc',
      pageNo: 1,
      pageSize: 3,
      executeDateBegin: timeDate(new Date().getTime() - 7776000000),
      executeDateEnd: timeDate(new Date().getTime()),
    }).then((res) => {
      listArr.value = res.records;
    });
  });
  watch(
    () => isContent.value,
    async (val) => {
      if (val === 'content') {
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
            const num = item.lawCount + item.chinaStandardCount + item.internalStandardCount + item.areaStandardCount;
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
                  const num = ite.lawCount + ite.chinaStandardCount + ite.internalStandardCount + ite.areaStandardCount;
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
      }
    }
  );
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
      fileContent: conditionsValue.value === '内容' ? value.value : '',
      fileName: conditionsValue.value === '标题' ? value.value : '',
      executeDateBegin: queryParams.executeDateBegin,
      executeDateEnd: queryParams.executeDateEnd,
      topicCategory: queryParams.topicCategory,
      topicTwoCategory: queryParams.topicTwoCategory,
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
        type.value = 'content';
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
  const onSuccess = (value) => {
    isContent.value = value;
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
  const onBack = () => {
    isContent.value = 'home';
  };
  return {
    conditionsValue,
    value,
    onSearch,
    listArr,
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
    type,
    onExpandAll,
    onExpand,
    spinning,
    onBack,
    treeLoading,
  };
};
export default useContent;
