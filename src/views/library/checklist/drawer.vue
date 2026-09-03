<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="检查表详情"
    @close="closeDrawer"
    :width="1920"
    show-footer
    show-ok-btn
    destroyOnClose
  >
    <template #footer>
      <div>
        <a-button @click="closeDrawer">取消</a-button>
      </div>
    </template>
    <Tabs :maxWidth="1888" :tabsList="tabsList" :activeKey="activeKey" @tabs-change="tabsChange" />
    <a-table style="padding: 5px" :loading="loading" :columns="columns" :data-source="dataSource" :pagination="false" bordered />
  </BasicDrawer>
</template>
<script setup lang="ts">
  import { getCheckTypeList, getcheckItemList } from './url/index';
  import Tabs from './Tabs.vue';
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  const loading = ref(false);
  const dataSource = ref([]);
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '70px',
      fixed: 'left',
      align: 'center',
      customRender: ({ text, record, index }) => `${index + 1}`,
    },
    {
      title: '检查内容',
      dataIndex: 'inspectionContent',
    },
    {
      title: '隐患描述',
      dataIndex: 'problemPoint',
      width: 300,
    },
    {
      title: '检查依据',
      dataIndex: 'basis',
      width: 300,
    },
    {
      title: '整改建议',
      dataIndex: 'standard',
      width: 350,
    },
    {
      title: '隐患级别',
      dataIndex: 'level',
      align: 'center',
      width: 200,
      customRender: ({ text }) => {
        if (text == 0) {
          return '一般隐患';
        } else if (text == 1) {
          return '重大隐患';
        }
      },
    },
    {
      title: '重大隐患判定标准',
      dataIndex: 'determine',
      width: 350,
    },
  ];
  const tabsList: any = ref([]);
  const activeKey = ref('');
  const [registerDrawer, { closeDrawer }] = useDrawerInner((data) => {
    tabsList.value = [];
    dataSource.value = [];
    activeKey.value = '';
    getCheckTypeList({
      id: data.id,
    }).then((res) => {
      if (res) {
        if (res.length > 0) {
          tabsList.value = res.map((item) => {
            return {
              title: item.name,
              key: item.id,
            };
          });
          activeKey.value = tabsList.value[0]?.key;
          init(tabsList.value[0]?.key);
        }
      }
    });
  });
  const tabsChange = (key) => {
    init(key);
  };
  const init = (id) => {
    loading.value = true;
    getcheckItemList({
      typeId: id,
    })
      .then((res) => {
        dataSource.value = res;
      })
      .finally(() => {
        loading.value = false;
      });
  };
</script>

<style scoped lang="less"></style>
