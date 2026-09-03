import { ref } from 'vue';
import { useContextMenu } from '/@/hooks/web/useContextMenu';
import { downloadFile } from '/@/utils/common/renderUtils';
import { download, doPreview } from '../url';
import { treeList } from '../index';
export const useManage = (
  clickBread: any,
  onDelete: any,
  uploadFile: any,
  editMenuItem: any,
  onAddChild: any,
  menuId: any,
  nowChooseFile: any,
  logRef: any,
  getTree: any,
  onAuthorize: any
) => {
  const [createContextMenu] = useContextMenu();
  const fileType = ref([
    {
      type: 'file',
      name: '文件',
    },
    {
      type: 'text',
      name: '文本',
    },
    {
      type: 'pdf',
      name: 'PDF',
    },
    {
      type: 'pp',
      name: '演示文稿',
    },
    {
      type: 'folder',
      name: '文件夹',
    },
    {
      type: 'doc',
      name: '文档',
    },
    {
      type: 'excel',
      name: '表格',
    },
    {
      type: 'image',
      name: '图片',
    },
    {
      type: 'video',
      name: '视频',
    },
  ]);
  const columns = [
    {
      title: '文件名',
      dataIndex: 'value',
      align: 'left',
      ellipsis: true,
      slots: { customRender: 'fileName' },
    },
    {
      title: '上传日期',
      dataIndex: 'date',
      align: 'center',
      width: 200,
      slots: { customRender: 'date' },
    },
    {
      title: '下载次数',
      dataIndex: 'downCount',
      align: 'center',
      ellipsis: true,
      width: 120,
      slots: { customRender: 'downCount' },
    },
    {
      title: '阅读次数',
      dataIndex: 'readCount',
      width: 120,
      ellipsis: true,
      align: 'center',
      slots: { customRender: 'readCount' },
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      slots: { customRender: 'type' },
    },
    {
      title: '大小',
      dataIndex: 'size',
      align: 'center',
      ellipsis: true,
      width: 120,
      slots: { customRender: 'size' },
    },
  ];
  const functionRightTable = (record: treeList) => {
    return {
      onDblclick: async (event) => {
        event.preventDefault();
        if (record.type === 'folder') {
          clickBread(record.id, record.type);
        } else {
          nowChooseFile.value = record.id;
          await doPreview(record.id).then((res) => {
            const url = JSON.parse(res).url;
            window.open(url, '_blank');
          });
          await getTree();
        }
      },
      onContextmenu: (event: any) => {
        event.preventDefault();
        nowChooseFile.value = record.id;
        menuId.value = [nowChooseFile.value];
        createContextMenu({
          event: event,
          items: [
            {
              label: '授权',
              icon: 'carbon:folder',
              visible: (record.identifying === '1' || record.identifying === '0') && record.type !== 'folder',
              handler: () => {
                onAuthorize();
              },
            },
            {
              label: '预览',
              visible: record.type === 'folder',
              icon: 'octicon:search-24',
              handler: async () => {
                await doPreview(record.id).then((res) => {
                  const url = JSON.parse(res).url;
                  window.open(url, '_blank');
                });
                await getTree();
              },
            },
            {
              label: '查看日志',
              visible: record.type === 'folder',
              icon: 'octicon:search-24',
              handler: () => {
                logRef.value(record.id);
              },
            },
            {
              label: '创建目录',
              icon: 'carbon:folder',
              visible: (record.identifying === '1' || record.identifying === '0') && record.type !== 'folder',
              handler: () => {
                onAddChild();
              },
            },
            {
              label: '删除',
              icon: 'mi:delete',
              handler: () => {
                onDelete();
              },
            },
            {
              label: '更名',
              icon: 'uil:edit',
              visible: (record.identifying === '1' || record.identifying === '0') && record.type !== 'folder',
              handler: () => {
                editMenuItem();
              },
            },
            {
              label: '上传',
              icon: 'bi:upload',
              visible: record.type !== 'folder',
              handler: () => {
                uploadFile();
              },
            },
            {
              label: '下载',
              visible: record.type === 'folder',
              icon: 'bi:download',
              handler: () => {
                onDownloadFile(record.id);
              },
            },
          ],
        });
      },
    };
  };
  // 下载
  const onDownloadFile = (fileId: string) => {
    download(fileId).then(async (res) => {
      downloadFile(res);
      await getTree();
    });
  };
  const getSize = (size: number) => {
    let data = <number | string>0;
    if (size < 0.1 * 1024) {
      //如果小于0.1KB转化成B
      data = size.toFixed(2) + 'B';
    } else if (size < 0.1 * 1024 * 1024) {
      //如果小于0.1MB转化成KB
      data = (size / 1024).toFixed(2) + 'KB';
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      //如果小于0.1GB转化成MB
      data = (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      //其他转化成GB
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    const sizestr = data + '';
    const len = sizestr.indexOf('.');
    const dec = sizestr.substr(len + 1, 2);
    if (dec == '00') {
      //当小数点后为00时 去掉小数部分
      return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
    }
    return sizestr;
  };
  const getdateTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp)); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return Y + M + D + h + m + s;
  };
  const getFileType = (text: string) => {
    if (text) {
      const list = fileType.value.filter((item) => {
        return item.type === text;
      });
      return list[0].name;
    } else {
      return '文件';
    }
  };
  return {
    functionRightTable,
    columns,
    getSize,
    getdateTime,
    getFileType,
  };
};
export default useManage;
