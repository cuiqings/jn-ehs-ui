import { ref, onMounted, onBeforeMount } from 'vue';
import Excel from '/@/assets/images/epInfo/Excel.png';
import PDF from '/@/assets/images/epInfo/PDF.png';
import picture from '/@/assets/images/epInfo/picture.png';
import ppt from '/@/assets/images/epInfo/ppt.png';
import video from '/@/assets/images/epInfo/video.png';
import word from '/@/assets/images/epInfo/word.png';
import { treeList } from '../index';
import { getFileList, doPreview } from '../url/index';
import { getToken } from '/@/utils/auth';
export const useList = () => {
  const searchVal = ref('');
  // list列表数据
  const pageTree = ref<treeList[]>([]);
  // 面包屑
  const pageBreak = ref<treeList[]>([]);
  // 储存原始数据
  const pageList = ref<treeList[]>([]);
  //
  const isiOS = ref(false);
  onBeforeMount(() => {
    // 具体设备
    const u = navigator.userAgent;
    isiOS.value = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  });
  onMounted(() => {
    getList();
  });
  const getList = () => {
    getFileList({ type: 1, token: getToken() }).then((res) => {
      pageList.value = res;
      const getEpInfoList = window.localStorage.getItem('epInfoList');
      if (getEpInfoList) {
        const epInfoList = JSON.parse(getEpInfoList);
        pageTree.value = epInfoList.pageTree;
        pageBreak.value = epInfoList.pageBreak;
        searchVal.value = epInfoList.searchVal;
        window.localStorage.removeItem('epInfoList');
      } else {
        const newArr = JSON.parse(JSON.stringify(res));
        pageBreak.value = [];
        pageBreak.value.push(res[0]);
        pageTree.value = getsoltFiles(newArr[0].data);
      }
    });
  };
  // list数据整理
  const getsoltFiles = (list = <treeList[]>[]) => {
    const a_list = <treeList[]>[]; // 文件夹
    const b_list = <treeList[]>[]; // 文件
    list.forEach((item) => {
      if (item.isFolder === '1') {
        a_list.push(item);
      } else {
        b_list.push(item);
      }
    });
    a_list.sort((a, b) => {
      return Number(a.date) < Number(b.date) ? 1 : -1;
    });
    b_list.sort((a, b) => {
      return Number(a.date) < Number(b.date) ? 1 : -1;
    });
    const r_list = a_list.concat(b_list);
    return r_list;
  };
  const onSearch = (value: string) => {
    // 搜索功能
    if (value) {
      pageTree.value = getListFor(pageList.value, value);
      pageBreak.value = [];
    } else {
      pageBreak.value = [pageList.value[0]];
      pageTree.value = getsoltFiles(pageList.value[0].data);
    }
  };
  // 搜索遍历
  const getListFor = (list: treeList[], key: string) => {
    const sendData = <treeList[]>[];
    const getVal = (list: treeList[], key: string) => {
      list.forEach((item) => {
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
    return sendData;
  };
  // 面包屑点击事件
  const breadClick = (data: treeList, index: number) => {
    console.log(pageBreak.value.length, index, 111);
    if (index !== pageBreak.value.length - 1) {
      pageTree.value = getsoltFiles(data.data);
      const num = pageBreak.value.length - 1;
      pageBreak.value.splice(index + 1, num);
    }
  };
  const listItemClick = (data: treeList) => {
    if (data.isFolder === '1') {
      pageTree.value = getsoltFiles(data.data);
      pageBreak.value.push(data);
      searchVal.value = '';
    } else {
      doPreview(data.id).then((res) => {
        if (res) {
          // 存走之前的样子
          const epInfoList = {
            type: 'hasGo',
            pageTree: pageTree.value,
            pageBreak: pageBreak.value,
            searchVal: searchVal.value,
          };
          window.localStorage.setItem('epInfoList', JSON.stringify(epInfoList));
          const url = JSON.parse(res).url;
          if (isiOS.value) {
            window.location.href = url;
          } else {
            window.open(url, '_blank');
          }
        }
      });
    }
  };
  const getIconType = (type: string) => {
    // 图片: false , 图标： true
    const typeArr = ['doc', 'pdf', 'excel', 'ppt', 'video', 'image'];
    if (type === 'folder') {
      return true;
    } else if (typeArr.includes(type)) {
      return false;
    } else {
      return true;
    }
  };
  const getIcon = (type: string) => {
    let typeIcon = '';
    switch (type) {
      case 'doc':
        typeIcon = word;
        break;
      case 'pdf':
        typeIcon = PDF;
        break;
      case 'excel':
        typeIcon = Excel;
        break;
      case 'ppt':
        typeIcon = ppt;
        break;
      case 'video':
        typeIcon = video;
        break;
      case 'image':
        typeIcon = picture;
        break;
    }
    return typeIcon;
  };
  return {
    onSearch,
    searchVal,
    pageBreak,
    breadClick,
    getList,
    pageTree,
    listItemClick,
    getIconType,
    getIcon,
  };
};
export default useList;
