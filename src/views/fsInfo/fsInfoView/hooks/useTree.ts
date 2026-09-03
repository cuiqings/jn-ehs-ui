import { ref, onMounted, nextTick } from 'vue';
import { getToken } from '/@/utils/auth';
import { getFileList } from '../url';
import { treeList } from '../index';
export const useTree = (dataSource: any, treeLoading: any, formInfo: any, nowChooseFile: any) => {
  // 当前tree选中得信息
  const treeItem = ref({});
  // 当前选中的项
  const selectedKeys = ref<string[]>([]);
  const treeData = ref<treeList[]>([]);
  // tree所有数据
  const allList = ref<treeList[]>([]);
  const menuId = ref<string[]>([]);
  // 面包屑
  const pageBreak = ref<treeList[]>([]);
  // 展开指定的树节点
  const expandedKeys = ref<string[]>([]);
  const treeTitle = ref('');
  const treeFormItem = ref('');
  onMounted(() => {
    getTree();
  });
  // 调取tree接口
  const getTree = () => {
    treeLoading.value = true;
    getFileList({ type: 1, token: getToken() })
      .then(async (res) => {
        allList.value = res;
        const newArr = JSON.parse(JSON.stringify(res));
        filesListGet(newArr);
        treeData.value = newArr;
        if (selectedKeys.value && selectedKeys.value.length) {
          clickBread(selectedKeys.value[0]);
        } else {
          clickBread(newArr[0].id);
          await nextTick();
          onExpandAll();
        }
        menuId.value = selectedKeys.value;
      })
      .finally(() => {
        treeLoading.value = false;
      });
  };
  // 展开全部
  const onExpandAll = () => {
    let array = <string[]>[];
    const findId = (typeList: treeList[], arr: string[]) => {
      for (let i = 0; i < typeList.length; i++) {
        if (typeList[i].type === 'folder') {
          arr.push(typeList[i].id);
          if (typeList[i].data && typeList[i].data.length) {
            findId(typeList[i].data, arr);
          }
          array = [...array, ...arr];
        }
      }
    };
    findId(allList.value, []);
    const array_a = [...new Set(array)];
    onExpand(array_a);
  };
  const onExpand = (data: string[]) => {
    expandedKeys.value = data;
  };
  // 右侧列表排序
  const getsoltFiles = (list: treeList[] = []) => {
    const a_list = <treeList[]>[]; // 文件夹
    const b_list = <treeList[]>[]; // 文件
    list.forEach((item) => {
      if (item.isFolder === '1') {
        a_list.push(item);
      } else {
        b_list.push(item);
      }
    });
    a_list.sort(function (a, b) {
      return Number(a.date) < Number(b.date) ? 1 : -1;
    });
    b_list.sort(function (a, b) {
      return Number(a.date) < Number(b.date) ? 1 : -1;
    });
    const r_list = a_list.concat(b_list);
    return r_list;
  };
  //过滤文件夹
  const filesListGet = (list: treeList[]) => {
    let lnew = <treeList[]>[];
    lnew = list.filter((item) => {
      item.data = filesListGet(item.data);
      if (item.data.length === 0) {
        item.isLeaf = false;
        item.class = 'tree-file';
      }
      return item.type == 'folder';
    });
    return lnew;
  };
  // 找文件夹里的文件
  const getFiles = (Did: string, list = treeData.value) => {
    let myDate = <treeList>{};
    const findId = (id: string, typeList: treeList[], arr: object[]) => {
      for (let i = 0; i < typeList.length; i++) {
        if (typeList[i].id === id) {
          myDate = typeList[i];
          break;
        } else if (typeList[i].data && typeList[i].data.length) {
          findId(id, typeList[i].data, arr);
        }
      }
    };
    findId(Did, list, []);
    return myDate;
  };

  // 左侧tree点击触发
  const onTreeSelect = (keys: string[]) => {
    selectedKeys.value = keys; // 左侧选中数据id
    menuId.value = keys;
    const files = <treeList>getFiles(keys[0], allList.value); // 找到自己的全部数据
    dataSource.value = getsoltFiles(files.data); // 给右侧赋值
    formInfo.text = ''; // 搜索清空
    nowChooseFile.value = '';
    const breakIds = getBreakIdsById(keys[0]);
    pageBreak.value = [];
    if (breakIds && breakIds.length) {
      breakIds.forEach((item) => {
        pageBreak.value.push(getFiles(item, allList.value));
      });
    }
  };
  const clickBread = (id: string, type = 'folder') => {
    if (type === 'folder') {
      selectedKeys.value = [id]; // 左侧选中数据id
      menuId.value = selectedKeys.value;
      const files = <treeList>getFiles(selectedKeys.value[0], allList.value); // 找到自己的全部数据
      dataSource.value = getsoltFiles(files.data); // 给右侧赋值
      formInfo.text = ''; // 搜索清空
      nowChooseFile.value = '';
      const breakIds = getBreakIdsById(selectedKeys.value[0]);
      pageBreak.value = [];
      if (breakIds && breakIds.length) {
        breakIds.forEach((item) => {
          pageBreak.value.push(getFiles(item, allList.value));
        });
      }
    }
  };
  // 根据id推导面包屑
  const getBreakIdsById = (Did: string, list = allList.value) => {
    let array = <string[]>[];
    const findId = (id: string, typeList: treeList[], arr: string[]) => {
      for (let i = 0; i < typeList.length; i++) {
        arr.push(typeList[i].id);
        if (typeList[i].id === id) {
          array = [...arr];
          break;
        } else if (typeList[i].data && typeList[i].data.length) {
          findId(id, typeList[i].data, arr);
        }
        arr.pop();
      }
    };
    findId(Did, list, []);
    return array;
  };
  // 右键
  const rTreeClick = ({ node }) => {
    const key = node.id;
    clickBread(key);
  };
  // 表格搜索
  const onSearch = () => {
    if (formInfo.text !== '') {
      const files = getFiles(selectedKeys.value[0], allList.value); // 找到自己的全部数据
      dataSource.value = getListFor([files], formInfo.text);
    } else {
      onTreeSelect(selectedKeys.value);
    }
  };
  const getListFor = (list: treeList[], key: string) => {
    const sendData = <treeList[]>[];
    const getVal = (list: treeList[], key: string) => {
      list.forEach((item: treeList) => {
        if (item.value.indexOf(key) !== -1) {
          // 输出
          sendData.push(item);
        }
        if (item.data && item.data.length) {
          getVal(item.data, key);
        }
      });
    };
    getVal(list, key);
    const r_list = getsoltFiles(sendData);
    return r_list;
  };
  return {
    treeLoading,
    treeItem,
    selectedKeys,
    treeData,
    onTreeSelect,
    clickBread,
    pageBreak,
    expandedKeys,
    rTreeClick,
    treeTitle,
    treeFormItem,
    getTree,
    menuId,
    onSearch,
    onExpandAll,
    onExpand,
  };
};
export default useTree;
