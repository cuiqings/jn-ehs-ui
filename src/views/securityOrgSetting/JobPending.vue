<template>
  <div>
    <template v-if="cardData.length > 0">
      <a-checkbox-group v-model:value="workTypes" style="width: 100%">
        <a-row :span="24" :gutter="[10, 10]">
          <a-col :span="6" v-for="item in cardData" :key="item.id">
            <a-card class="fixed-height-card">
              <a-row :span="24">
                <a-col :span="24">
                  <div style="display: flex; justify-content: space-between">
                    <div>
                      <span style="font-weight: bold; display: inline-block">
                        {{ item.postName }}
                      </span>
                    </div>
                    <div>
                      <a-checkbox :value="item.post"></a-checkbox>
                    </div>
                  </div>
                </a-col>
                <a-col :span="24" style="margin-top: 10px">安全管理职责：</a-col>
                <div class="text-main">
                  <template v-for="child in item.list">{{ child.sort }}、{{ child.name }}<br /></template>
                </div>
              </a-row>
              <a-row :span="24" v-if="state == '1'" justify="end" :gutter="[20, 10]" style="margin-top: 15px">
                <a-button type="text" danger @click="del(item.post)">删除</a-button>
                <a-button type="link" @click="edit(item)"> 编辑</a-button>
                <a-button type="link" @click="viewDetail(item)"> 查看详情</a-button>
              </a-row>
            </a-card>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </template>
    <template v-else>
      <div style="text-align: center; width: 100%">暂无数据</div>
    </template>
    <Modal
      :width="700"
      :bodyStyle="{ padding: '4px 10px' }"
      v-model:visible="AddAnalysis"
      :title="title"
      :mask-closable="false"
      centered
      @cancel="closeModal"
      :footer="null"
    >
      <a-form
        :model="addAnalysisForm"
        ref="addAnalysisFormRef"
        :rules="rules"
        autocomplete="off"
        labelAlign="left"
        :label-col="{ span: 12, offset: 0 }"
        :wrapper-col="{ flex: 1, offset: 0 }"
        style="max-height: 600px; overflow-y: auto"
      >
        <a-form-item label="安全管理岗" name="post" :colon="false" required>
          <JDictSelectTag v-model:value="addAnalysisForm.post" placeholder="请选择安全管理岗" dictCode="safety_management_post" />
        </a-form-item>

        <a-form-item label="" :colon="false" required>
          <a-table bordered :data-source="addAnalysisForm.list" :pagination="false" :columns="title == '查看' ? columns2 : columns">
            <template #bodyCell="{ column, index, text, record }">
              <template v-if="column.dataIndex === 'sort'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'name'">
                <a-form-item
                  required
                  label=""
                  :name="['list', index, 'name']"
                  :colon="false"
                  :rules="{
                    required: true,
                  }"
                  style="padding: 0; margin: 0"
                >
                  <a-textarea
                    placeholder="请输入"
                    :disabled="title == '查看'"
                    :maxLength="300"
                    v-model:value="record.name"
                    :auto-size="{ minRows: 2, maxRows: 5 }"
                /></a-form-item>
              </template>
              <template v-else-if="column.dataIndex === 'handle'">
                <PlusOutlined style="font-size: 20px; color: #1890ff" @click="onAdd(index + 1)" />
                <MinusOutlined v-show="index != 0" @click="onDelete(index)" style="font-size: 20px; color: #ff4d4f" />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-form>
      <div style="text-align: center; padding: 16px 0" v-if="title != '查看'">
        <a-space align="center" :size="22">
          <a-button
            @click="
              AddAnalysis = false;
              addAnalysisFormRef.resetFields();
            "
            >取消
          </a-button>
          <a-button type="primary" @click="addAnalysisOk">确定</a-button>
        </a-space>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { Modal, message } from 'ant-design-vue';
  import { inject, reactive, Ref, ref, computed } from 'vue';
  import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
  import { securityAdd, securityList, securityDel, securityEdit } from './api';
  import type { searchJobList } from './type';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  let safety_management_post = computed(() => userStore.getAllDictItems.safety_management_post);
  const props = defineProps({
    show: {
      type: Boolean,
    },
    thisState: {
      type: String,
    },
  });

  const title = ref('新增');
  const workTypes = ref([]);
  // 状态
  const state = inject('state') as Ref<string>;
  //添加分析弹窗
  const AddAnalysis = ref(false);
  //添加
  const addAnalysisForm = reactive({
    post: null,
    postName: '',
    list: [{ name: '', sort: 1 }],
  });

  const columns = [
    {
      title: '序号',
      dataIndex: 'sort',
      width: '70px',
    },
    {
      title: '安全管理职责',
      dataIndex: 'name',
    },
    {
      title: '操作',
      align: 'center',
      dataIndex: 'handle',
    },
  ];
  const columns2 = [
    {
      title: '序号',
      dataIndex: 'sort',
      width: '70px',
    },
    {
      title: '安全管理职责',
      dataIndex: 'name',
    },
  ];

  //添加分析表单
  const addAnalysisFormRef = ref();

  // 总条数
  const total = ref(0);
  // 页数
  const current = ref<number>(1);
  // 页数和条数
  const pageSize = ref<number>(12);
  // 卡片数据
  let cardData = ref<any[]>([]);

  // 表单验证规则
  const rules = {
    workType: [
      {
        required: true,
        message: '请选择作业类型',
        trigger: 'change',
      },
    ],
  };

  const closeModal = () => {
    addAnalysisForm.workType = null;
    addAnalysisForm.list = [];
    addAnalysisFormRef.value.resetFields();
  };

  const onAdd = (idx) => {
    if (title.value == '查看') return;
    addAnalysisForm.list.splice(idx, 0, { name: '', sort: 0 });
  };

  const onDelete = (index) => {
    if (title.value == '查看') return;
    addAnalysisForm.list.splice(index, 1);
    addAnalysisForm.list.forEach((item, index) => {
      item.sort = index + 1;
    });
  };

  const del = (type, msg) => {
    Modal.confirm({
      title: '提示',
      content: msg || '是否确认删除？',
      onOk: async () => {
        await securityDel({ post: type });
        getList({});
        workTypes.value = [];
      },
    });
  };

  const edit = (item) => {
    addAnalysisForm.post = item.post;
    addAnalysisForm.list = JSON.parse(JSON.stringify(item.list));
    AddAnalysis.value = true;
    title.value = '编辑';
  };

  // 获取列表数据
  const getList = async (data: searchJobList) => {
    let params = { ...data };
    const res = await securityList(params);
    cardData.value = [];
    total.value = res.total;
    current.value = res.current;
    pageSize.value = res.size;
    cardData.value = res;
  };

  getList({});

  // 点击查看详情
  const viewDetail = async (item) => {
    addAnalysisForm.post = item.post;
    addAnalysisForm.list = item.list;
    AddAnalysis.value = true;
    title.value = '查看';
  };

  //添加分析
  const add = () => {
    title.value = '新增';
    AddAnalysis.value = true;
    addAnalysisForm.post = null;
    addAnalysisForm.list = [{ name: '', sort: 1 }];
  };
  // 添加分析弹窗关闭
  const addAnalysisOk = async () => {
    await addAnalysisFormRef.value.validate();
    addAnalysisForm.list.forEach((val, idx) => {
      val.sort = idx + 1;
    });
    safety_management_post.value.forEach(val => {
      if(addAnalysisForm.post == val.value) addAnalysisForm.postName = val.label;
    })
    if (title.value == '编辑') {
      securityEdit(addAnalysisForm).then((res) => {
        getList({});
        addAnalysisForm.post = null;
        addAnalysisForm.list = [{ name: '', sort: 1 }];
        AddAnalysis.value = false;
      });

      return;
    }
    securityAdd(addAnalysisForm).then((res) => {
      getList({});
      addAnalysisForm.list = [{ name: '', sort: 1 }];
      AddAnalysis.value = false;
    });
  };
  const batchDel = () => {
    if (workTypes.value.length == 0) return message.error('请选择要删除的数据');
    del(workTypes.value.toString(), `是否确认删除已选中的 ${workTypes.value.length} 项？`);
  };

  defineExpose({
    add,
    batchDel,
    getList,
  });
</script>

<style lang="less" scoped>
  .btn-wrap {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    button {
      margin-right: 5px;
      margin-bottom: 5px;
    }
  }
  .my-form-item {
    margin: 0 !important;
  }
  .fixed-height-card {
    border-radius: 7px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
  }
  :deep(.ant-select-selection-overflow) {
    flex-wrap: nowrap !important;
    overflow: auto !important;
  }
  .foot {
    display: flex;
    justify-content: center;
    padding: 16px;
    button {
      margin-right: 15px;
    }
  }
  .reason {
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
  }
  .text-main {
    height: 130px;
    overflow: hidden;
    -webkit-line-clamp: 6;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    p {
      padding: 0;
      margin: 0;
    }
  }
</style>
