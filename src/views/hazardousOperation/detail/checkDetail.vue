<template>
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
        {{ record.transfer == '1' ? '是' : '否' }}
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
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import CheckImgView from '../components/CheckImgView.vue';
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
      width: 200,
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
  };
  defineExpose({
    pageInit,
  });
</script>
<style lang="less" scoped></style>
