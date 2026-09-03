import { ref, onMounted, reactive, nextTick, createVNode } from 'vue';
import { Modal, Form } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { useContextMenu } from '/@/hooks/web/useContextMenu';
import { useMessage } from '/@/hooks/web/useMessage';
import { getFileList, postFileList, add } from '../url';
import { treeList } from '../index';
export const useTree = (
  dataSource: any,
  treeLoading: any,
  formInfo: any,
  fileModelRef: any,
  nowChooseFile: any,
  authorizeRef: any,
  token: string
) => {
  const { createMessage } = useMessage();
  const [createContextMenu] = useContextMenu();
  // 是否显示删除提示
  const visibleTree = ref(null);
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
  // 新增修改表单
  const fromInfo = reactive({
    title: '',
  });
  const treeTitle = ref('');
  const treeFormItem = ref('');
  const rulesRef = reactive({
    title: [{ required: true, message: '请输入' }],
  });
  const visibleAdd = ref(false);
  const useForm = Form.useForm;
  const { resetFields, validate, validateInfos } = useForm(fromInfo, rulesRef);
  onMounted(() => {
    getTree();
  });
  // 调取tree接口
  const getTree = () => {
    treeLoading.value = true;
    menuId.value = selectedKeys.value;
    getFileList({ token: token })
      .then(async (res) => {
        allList.value = res;
        const newArr = JSON.parse(JSON.stringify(res));
        filesListGet(newArr);
        treeData.value = newArr;
        if (selectedKeys.value && selectedKeys.value.length) {
          clickBread(selectedKeys.value[0]);
          onExpandAll();
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
  // 拖住tree
  const onDragEnter = (info: { expandedKeys: string[] }) => {
    expandedKeys.value = info.expandedKeys;
  };
  const onDrop = (info: any) => {
    const dropKey = info.node.eventKey;
    const dragKey = info.dragNode.eventKey;
    const params = {
      action: 'move',
      source: dragKey, // 选中的
      temp: dragKey, // 选中的
      target: dropKey, // 过去的
    };
    if (isHasSameName(dragKey, dropKey)) {
      createMessage.info('同一目录同一级别下名称不可重复');
      return false;
    }
    const formData = getFormDateVal(params);
    postFileList(formData).then(() => {
      getTree();
    });
  };
  const isHasSameName = (id: string, fid: string) => {
    const value = getFiles(id, allList.value).value; // 选中的名字
    const list = getFiles(fid, allList.value); // 过去的子集
    let r_Data = false;
    list.data.forEach((item) => {
      if (item.isFolder === '1') {
        if (item.value === value) {
          if (item.id === id) {
            r_Data = false;
          } else {
            r_Data = true;
          }
        }
      }
    });
    return r_Data;
  };
  const onExpand = (data: string[]) => {
    expandedKeys.value = data;
  };
  // 右键
  const rTreeClick = async ({ event, node }) => {
    const key = node.id;
    clickBread(key);
    createContextMenu({
      event: event,
      items: [
        {
          label: '授权',
          icon: 'carbon:folder',
          visible: node.pos === '0-0' || node.identifying !== '1',
          handler: () => {
            onAuthorize();
          },
        },
        {
          label: '创建目录',
          icon: 'carbon:folder',
          visible: node.identifying !== '1',
          handler: () => {
            onAddChild();
          },
        },
        {
          label: '删除',
          icon: 'mi:delete',
          visible: node.pos === '0-0' || node.identifying !== '1',
          handler: () => {
            onDelete();
          },
        },
        {
          label: '更名',
          icon: 'uil:edit',
          visible: node.identifying !== '1',
          handler: () => {
            editMenuItem();
          },
        },
        {
          label: '上传',
          icon: 'bi:upload',
          visible: node.identifying !== '1',
          handler: () => {
            uploadFile();
          },
        },
      ],
    });
  };
  // 授权
  const onAuthorize = () => {
    authorizeRef.value(menuId.value[0]);
  };
  // 新增节点
  const onAddChild = () => {
    treeTitle.value = '创建目录';
    treeFormItem.value = '目录';
    resetFields();
    visibleAdd.value = true;
  };
  // 新增修改提示
  const validateNameNoSameAdd = () => {
    let is = false;
    const fid = menuId.value[0]; // fid
    const files = getFiles(fid, allList.value);
    const list = <string[]>[];
    files.data.forEach((item) => {
      if (item.isFolder === '1') {
        list.push(item.value);
      }
    });
    is = list.indexOf(fromInfo.title) !== -1;
    return is;
  };
  const hideModal = () => {
    validate().then(() => {
      let upid = menuId.value[0];
      // 判断下这个id是不是文件夹，如果是文件夹就取上一层
      const files = getFiles(upid, allList.value); // 找到自己的全部数据
      if (files.type !== 'folder' && treeTitle.value === '创建目录') {
        const breakIds = getBreakIdsById(upid);
        upid = breakIds.splice(-2, 1)[0];
      }
      if (validateNameNoSameAdd()) {
        return createMessage.info('同一目录同一级别下名称不可重复');
      }
      let params = {};
      if (treeTitle.value === '创建目录') {
        params = {
          id: new Date().getTime(),
          target: upid,
          source: fromInfo.title,
          action: 'create',
        };
        const formData = getFormDateVal(params);
        add(formData).then(async () => {
          resetFields();
          getTree();
          visibleAdd.value = false;
        });
      } else {
        params = {
          action: 'rename',
          source: upid,
          target: fromInfo.title,
        };
        const formData = getFormDateVal(params);
        postFileList(formData).then(() => {
          resetFields();
          getTree();
          visibleAdd.value = false;
        });
      }
    });
  };
  // 整合formData数据
  const getFormDateVal = (data: any) => {
    const formData = new FormData();
    const fd_keys = Object.keys(data) || [];
    fd_keys.forEach((item) => {
      formData.set(item, data[item]);
    });
    return formData;
  };
  const clickUp = () => {
    const breakIds = getBreakIdsById(selectedKeys.value[0]);
    onTreeSelect(breakIds.splice(-2, 1));
  };
  // 删除节点
  const onDelete = () => {
    Modal.confirm({
      content: '是否删除该文件夹/文件?',
      icon: createVNode(QuestionCircleOutlined),
      onOk() {
        const upid = menuId.value[0];
        const files = getFiles(upid, allList.value); // 找到自己的全部数据
        const params = {
          action: 'remove',
          source: upid,
        };
        const formData = getFormDateVal(params);
        postFileList(formData)
          .then(() => {
            if (files.isFolder === '1') {
              clickUp();
            }
            getTree();
          })
          .finally(() => {
            treeLoading.value = false;
          });
      },
    });
  };
  // 更名
  const editMenuItem = () => {
    treeTitle.value = '更名';
    treeFormItem.value = '更名为';
    visibleAdd.value = true;
    const data = getFiles(menuId.value[0], allList.value); // 找到自己的全部数据
    fromInfo.title = data.value;
  };
  // 上传
  const uploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (event: any) => {
      const file = event.target.files;
      // 判断下这个id是不是文件夹，如果是文件夹就取上一层
      let uid = menuId.value[0];
      const filesData = getFiles(uid, allList.value); // 找到自己的全部数据
      if (filesData.type !== 'folder') {
        const breakIds = getBreakIdsById(uid);
        uid = breakIds.splice(-2, 1)[0];
      }
      fileModelRef.value(file, uid);
    };
    input.click();
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
    onAddChild,
    visibleTree,
    onDelete,
    clickBread,
    pageBreak,
    expandedKeys,
    onDragEnter,
    onExpand,
    rTreeClick,
    fromInfo,
    visibleAdd,
    hideModal,
    validateInfos,
    treeTitle,
    treeFormItem,
    editMenuItem,
    uploadFile,
    getTree,
    menuId,
    onSearch,
    onExpandAll,
    onDrop,
    onAuthorize,
  };
};
export default useTree;
