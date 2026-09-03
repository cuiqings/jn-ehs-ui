<template>
  <div class="appCheckPlan">
    <div class="list">
      <div class="list_label">计划名称：</div>
      <div class="list_value">{{ info.checkPlanName }}</div>
    </div>
    <div class="list">
      <div class="list_label">检查频率：</div>
      <div class="list_value">{{ renderDict(info.checkFrequency, 'check_frequency') }}</div>
    </div>
    <div class="list">
      <div class="list_label">检查单位：</div>
      <div class="list_value">{{ info.organizationName }}</div>
    </div>
    <div class="list">
      <div class="list_label">检查人：</div>
      <div class="list_value">{{ info.checkUserPost }}{{ info.checkUser }}</div>
    </div>
    <div class="list" style="margin-bottom: 10px">
      <div class="list_label">检查时间：</div>
      <div class="list_value">{{ info.checkTime }}</div>
    </div>
    <a-table :columns="columns" :data-source="info.jnEnvironmentalCheckRecordSubList" bordered :pagination="false" :scroll="{ x: 1000 }">
      <template #checkPhoto="{ record }">
        <img
          v-if="record.checkPhoto"
          :src="getFileAccessHttpUrl(record.checkPhoto.split(',')[0])"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.checkPhoto">无</span>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" name="app-checkPlan-details" setup>
  import { ref, onMounted, h } from 'vue';
  import { checkRecordDetails } from '../url/index';
  import { useRoute } from 'vue-router';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  const route = useRoute();
  const columns = [
    { title: '工序', dataIndex: 'processes', align: 'center', width: 100 },
    { title: '检查项目', dataIndex: 'checkEntry', align: 'center' },
    { title: '检查要求', dataIndex: 'checkRecord', align: 'center' },
    {
      title: '检查结果',
      dataIndex: 'checkResult',
      align: 'center',
      width: 100,
      customRender: ({ text }) => {
        return h('span', { style: { color: text === '1' ? 'red' : '' } }, text === '0' ? '正常' : text === '1' ? '异常' : '');
      },
    },
    { title: '检查照片', dataIndex: 'checkPhoto', align: 'center', width: 100, slots: { customRender: 'checkPhoto' } },
    { title: '影响评估', dataIndex: 'impactAssessment', align: 'center', width: 250 },
  ];
  const info = ref<any>({});
  onMounted(() => {
    if (route.query.recordId) {
      checkRecordDetails({ recordId: route.query.recordId }).then((res) => {
        info.value = res;
      });
    }
  });
  const renderDict = (v, code) => {
    let text = '';
    let array = getDictItemsByCode(code) || [];
    let obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };
  const openImg = (record) => {
    const imageList = record.checkPhoto.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 350,
      rememberState: true,
      scaleStep: 10,
    });
  };
</script>
<style lang="less" scoped>
  .appCheckPlan {
    padding: 20px 15px 0 15px;
    height: 100%;
    overflow-y: auto;
    .list {
      display: flex;
      line-height: 30px;
      .list_label {
        width: 100px;
        text-align: left;
        color: rgb(127, 127, 127);
      }
    }
  }
</style>
