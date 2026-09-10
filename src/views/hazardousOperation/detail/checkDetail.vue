<template>
  <div ref="tableWrapRef" class="check-table-wrap">
    <a-table :pagination="false" :dataSource="workCheckList" :columns="columns">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'imgUrl'">
          <CheckImgView :record="record" />
        </template>
        <template v-if="column.key === 'confirmResult'">
          {{ record.confirmResult == '1' ? '合格' : record.confirmResult == '2' ? '不合格' : '' }}
        </template>
        <template v-if="column.key === 'zgimgUrl'">
          <JImageUpload disabled v-model:value="record.zgimgUrl" />
        </template>
        <template v-if="column.key === 'transfer'">
          <div v-if="record.transfer !== '1'">未转交</div>
          <div v-else>
            <div style="margin-bottom: 4px">
              <span style="color: #1890ff; font-weight: 600">(1)</span> 已转交
            </div>
            <div style="margin-bottom: 8px">
              <div><span style="color: #1890ff; font-weight: 600">(2)</span> 转交人:</div>
              <div style="padding: 4px 0; color: #333">{{ record.assignName }}</div>
            </div>
            <div style="margin-bottom: 8px">
              <div><span style="color: #1890ff; font-weight: 600">(3)</span> 转交原因:</div>
              <div style="padding: 4px 0; color: #333">{{ record.roleAssignRemark }}</div>
            </div>
            <div v-if="record.annex && record.annex.length">
              <div style="margin-bottom: 4px"><span style="color: #1890ff; font-weight: 600">(4)</span> 转交附件:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px">
                <template v-for="(url, idx) in record.annex" :key="idx">
                  <JImageUpload
                    v-if="isImg(url)"
                    :value="url"
                    disabled
                    text=""
                    bizPath="hiddenTrouble"
                  />
                  <span
                    v-else
                    style="color: #1890ff; cursor: pointer"
                    @click="previewAnnex(url)"
                  >{{ url.split('/').pop() }}</span>
                </template>
              </div>
            </div>
          </div>
        </template>
        <template v-if="column.key === 'unitType'">
          {{
            record.unitType == '1'
              ? '安全部'
              : record.unitType == '2'
              ? '副部长'
              : record.unitType == '3'
              ? '安全科'
              : record.unitType == '4'
              ? '车间主任'
              : record.unitType == '5'
              ? '班组长'
              : record.unitType == '6'
              ? '安全科长'
              : ''
          }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import CheckImgView from '../components/CheckImgView.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { previewFile } from '/@/api/common/api';

  const tableWrapRef = ref<HTMLElement | null>(null);

  let scrollContainer: HTMLElement | null = null;
  let thead: HTMLElement | null = null;

  function onScroll() {
    if (!scrollContainer || !thead || !tableWrapRef.value) return;

    
    const tableTop = tableWrapRef.value.getBoundingClientRect().top
      - scrollContainer.getBoundingClientRect().top
      + scrollContainer.scrollTop;

    const scrolled = scrollContainer.scrollTop;


    const offset = Math.max(0, scrolled - tableTop);

    thead.style.transform = `translateY(${offset}px)`;
    thead.style.position = 'relative';
    thead.style.zIndex = '2';
  }

  function bindScroll() {
    if (!tableWrapRef.value) return;

    let el: HTMLElement | null = tableWrapRef.value.parentElement;
    while (el) {
      if (el.classList.contains('scrollbar__wrap')) {
        scrollContainer = el;
        break;
      }
      el = el.parentElement;
    }

    if (!scrollContainer) return;

    
    thead = tableWrapRef.value.querySelector<HTMLElement>('.ant-table-thead');
    if (!thead) return;

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
  }

  function unbindScroll() {
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', onScroll);
    }
    scrollContainer = null;
    thead = null;
  }

  onMounted(() => {
    nextTick(bindScroll);
  });

  onBeforeUnmount(() => {
    unbindScroll();
  });

  const columns = [
    {
      title: '检查人',
      dataIndex: 'head',
      key: 'head',
      width: 150,
      scopedSlots: { customRender: 'head' },
    },
    {
      title: '检查层级',
      dataIndex: 'unitType',
      key: 'unitType',
      width: 150,
      scopedSlots: { customRender: 'unitType' },
    },
    {
      title: '检查时间',
      dataIndex: 'checkTime',
      key: 'checkTime',
      width: 150,
      scopedSlots: { customRender: 'checkTime' },
    },
    {
      title: '检查描述',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      scopedSlots: { customRender: 'remark' },
    },
    {
      title: '检查照片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 140,
      scopedSlots: { customRender: 'imgUrl' },
    },
    {
      title: '检查结果',
      dataIndex: 'result',
      key: 'result',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
    {
      title: '是否转交权限',
      dataIndex: 'transfer',
      key: 'transfer',
      width: 260,
      scopedSlots: { customRender: 'transfer' },
    },
    {
      title: '隐患类别',
      dataIndex: 'yhlb',
      key: 'yhlb',
      width: 190,
    },
    {
      title: '整改措施',
      dataIndex: 'zgresult',
      key: 'zgresult',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
    {
      title: '整改后照片',
      dataIndex: 'zgimgUrl',
      key: 'zgimgUrl',
      width: 140,
      scopedSlots: { customRender: 'zgimgUrl' },
    },
    {
      title: '整改人',
      dataIndex: 'headName',
      key: 'headName',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
    {
      title: '整改时间',
      dataIndex: 'reformTime',
      key: 'reformTime',
      width: 200,
    },
    {
      title: '整改确认',
      dataIndex: 'confirmResult',
      key: 'confirmResult',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
    {
      title: '确认人',
      dataIndex: 'confirmHeadName',
      key: 'confirmHeadName',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
    {
      title: '确认时间',
      dataIndex: 'confirmTime',
      key: 'confirmTime',
      width: 200,
      scopedSlots: { customRender: 'result' },
    },
  ];

  const workCheckList = ref([]);

  // 预览附件（图片直接预览，PDF新窗口预览，Word/Excel直接下载）
  const imgExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const pdfExts = ['pdf'];
  function isImg(url: string) {
    return imgExts.includes(url.split('.').pop()?.toLowerCase() || '');
  }
  function previewAnnex(url: string) {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    const fullUrl = getFileAccessHttpUrl(url);
    if (imgExts.includes(ext)) {
      // 图片：大图预览
      createImgPreview({ imageList: [fullUrl] });
    } else if (pdfExts.includes(ext)) {
      // PDF：浏览器可直接预览
      previewFile(url).then((res) => {
        window.open(res, '_blank');
      });
    } else {
      // Word / Excel 等：直接下载
      window.open(fullUrl, '_blank');
    }
  }

  const pageInit = (res) => {
    let columnSplit: number[] = [];
    let data: any = [];
    res.forEach((item) => {
      if (!item.reformList || item.reformList.length == 0) {
        data.push(item);
        columnSplit.push(1);
      } else {
        columnSplit.push(item.reformList.length);
        item.reformList.forEach((reformItem) => {
          delete reformItem.head;
          reformItem.zgresult = reformItem.result;
          delete reformItem.result;
          // 整改照片统一加 zg 前缀，否则下面的展开会覆盖掉检查照片的同名字段
          ['imgUrl', 'imgList', 'imgJson', 'imgType'].forEach((key) => {
            reformItem['zg' + key] = reformItem[key];
            delete reformItem[key];
          });
          data.push({
            ...item,
            ...reformItem,
          });
        });
      }
    });
    columns.forEach((column: any, cindex) => {
      if (cindex <= 4) {
        column['customCell'] = (row, rindex) => {
          let obj = { rowSpan: 1 };
          columnSplit.forEach((num, idx) => {
            if (num !== 1) {
              if (rindex === sum(columnSplit.slice(0, idx))) {
                obj = { rowSpan: num };
              }
              if (rindex > sum(columnSplit.slice(0, idx)) && rindex < sum(columnSplit.slice(0, idx + 1))) {
                obj = { rowSpan: 0 };
              }
            }
          });
          return obj;
        };
      }
    });
    function sum(arr) {
      var s = 0;
      for (var i = 0; i < arr.length; i++) {
        s += arr[i];
      }
      return s;
    }
    workCheckList.value = data;

    // 数据加载后重新查找 thead（a-table 可能在数据变化后重新渲染）
    nextTick(() => {
      if (tableWrapRef.value) {
        thead = tableWrapRef.value.querySelector<HTMLElement>('.ant-table-thead');
      }
      // 若滚动容器还未绑定（首次 pageInit 早于 onMounted），则重新绑定
      if (!scrollContainer) {
        bindScroll();
      }
    });
  };

  defineExpose({
    pageInit,
  });
</script>

<style lang="less" scoped>
.check-table-wrap {
  /* 表格宽度自适应，不产生横向滚动 */
  width: 100%;
  overflow: visible;
}

/* thead 使用 relative + translateY 来模拟 sticky，需要确保它能脱离正常流叠在内容上 */
:deep(.ant-table-thead) {
  position: relative;
  z-index: 2;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
}
</style>
