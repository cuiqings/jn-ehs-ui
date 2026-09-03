<template>
    <div>
      <BasicModal v-bind="$attrs" @register="registerModal" :width="700" :bodyStyle="{ padding: '10px 20px 0 0' }" title="选择证书" destroyOnClose>
        <div class="modalinner">
          <!-- <div class="left">
            <a-tree
              v-model:checkedKeys="checkedKeys"
              @select="treeSelectDepart"
              :fieldNames="{ title: 'title', key: 'code', children: 'children' }"
              :tree-data="treeData"
            ></a-tree>
          </div> -->
          <div class="right">
            <a-table
              rowKey="id"
              :columns="columns"
              :row-selection="rowSelection"
              :data-source="dataSource"
              :pagination="pagination"
              :loading="loading"
            ></a-table>
          </div>
        </div>
        <template #footer>
          <div style="text-align: center">
            <a-button style="margin-right: 15px" @click="close">取消</a-button>
            <a-button v-if="showOkBtn" type="primary" :loading="loading" @click="confirmClose">确定</a-button>
          </div>
        </template>
      </BasicModal>
    </div>
  </template>
  <script lang="ts" name="evaluate-fun-modal" setup>
    import { ref, onMounted, computed } from 'vue';
    import { BasicModal, useModalInner } from '/@/components/Modal';
    import { certificateList, getDeptNew, add, edit } from './url/index';
    import type { TableProps, TableColumnType } from 'ant-design-vue';
    import { loadTreeRoot } from './url/index';
    const emit = defineEmits(['success']);
    const showOkBtn = ref(true);
    const loading = ref(false);
    const checkedKeys = ref([]);
  
    const treeData = ref([]);
    const dataSource = ref([]);
  
    const [registerModal, { closeModal }] = useModalInner(async (data) => {
      console.log(data);
      getExam();
    //   loadTreeRoot({
    //     async: false,
    //     pcode: 'A02',
    //   }).then((res) => {
    //     console.log(res);
    //     treeData.value = res;
    //   });
      if(data){
        selectedRowKeys.value = [data.value.examPaperId]
      }
      
    });
  
    const chooseResult = ref<any>();
    const selectedRowKeys = ref<any[]>([]);
    const rowSelection: TableProps['rowSelection'] = {
      type: 'radio',
      onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
        chooseResult.value = selectedRows[0];
      }
    };
  
    const columns = [
      {
        title: '证书名称',
        dataIndex: 'name',
        sorter: true,
        width: '100%',
      },
    ];
  
    const treeSelectDepart = (v) => {
      console.log(v);
      queryParams.value.category = v[0];
      getExam();
    };
    const total = ref(0);
    const pagination = computed(() => ({
      total: total.value,
      current: queryParams.value.pageNo,
      pageSize: queryParams.value.pageSize
    }));
  
    const queryParams = ref({
      category: '',
      pageNo: 1,
      pageSize: 10
    });
  
    const getExam = () => {
      certificateList(queryParams.value).then((res) => {
        dataSource.value = res.records;
        total.value = res.total;
        console.log(res);
      });
    };
  
    const close = () => {
      closeModal();
    };
    const confirmClose = async () => {
      emit('success', chooseResult.value);
    };
    // 选择试卷
    const openExamConfig = () => {};
  </script>
  <style lang="less" scoped>
    .modalinner {
      width: 700px;
    //   .left {
    //     width: 200px;
    //   }
      .right {
        width: 100%;
      }
    }
  </style>
  