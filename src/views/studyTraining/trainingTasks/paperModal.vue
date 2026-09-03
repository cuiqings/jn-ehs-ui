<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="900" :bodyStyle="{ padding: '10px 20px 0 0' }" title="选择试卷" destroyOnClose>
      <div class="modalinner">
        <div class="left">
          <a-directory-tree
            style="margin: 15px"
            selectable
            draggable
            :treeData="treeData"
            :selectedKeys="selectedKeys"
            check-strictly
            v-model:expandedKeys="expandedKeys"
            @select="onSelect"
          >
            <template #icon="{ expanded, isLeaf }">
              <template v-if="expanded && !isLeaf">
                <FolderOpenOutlined />
              </template>
              <template v-else>
                <FolderOutlined />
              </template>
            </template>
          </a-directory-tree>
        </div>
        <div class="right">
          <div style="margin-bottom: 10px">
            <a-input-search v-model:value="paperName" placeholder="请输入" enter-button @search="onSearch" />
          </div>
          <a-table
            rowKey="id"
            :columns="columns"
            :row-selection="rowSelection"
            :data-source="dataSource"
            :pagination="pagination"
            :loading="loading"
            @change="handleTableChange"
          >
            <template #paperName="{ record }">
              <div
                style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; word-break: keep-all; width: 488px"
                :title="record.paperName"
              >
                <Icon icon="mingcute:paper-fill" style="color: #1890ff" />
                {{ record.paperName }}
              </div>
            </template>
          </a-table>
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
  <a-modal v-model:visible="visible" :body-style="{ margin: '20px' }" title="考试设置" z-index="1100" @ok="handleReturnOk">
    <template #footer>
      <a-button key="back" @click="() => (visible = false)">取消</a-button>
      <a-button key="submit" type="primary" @click="handleReturnOk">确认</a-button>
    </template>
    <a-form :model="info" ref="infoRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="试题顺序" name="questionsSort" :rules="[{ required: true, message: '试题顺序为必填项！' }]">
        <a-radio-group v-model:value="info.questionsSort" name="radioGroup">
          <a-radio value="1">固定排序</a-radio>
          <a-radio value="2">打乱顺序</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="选项顺序" name="optionsSort" :rules="[{ required: true, message: '选项顺序为必填项！' }]">
        <a-radio-group v-model:value="info.optionsSort" name="radioGroup">
          <a-radio value="1">固定排序</a-radio>
          <a-radio value="2">打乱顺序</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="考试次数" name="examNum" :rules="[{ required: true, message: '考试次数为必填项！' }]">
        <a-radio-group v-model:value="info.examNum" name="radioGroup">
          <a-radio value="1" v-if="type === 1">1次</a-radio>
          <a-radio value="2" v-if="type === 1">2次</a-radio>
          <a-radio value="3" v-if="type === 2 || type === 1">不限</a-radio>
          <a-radio value="4" v-if="type === 1">及格为止</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="考试时间" name="examTime" :rules="[{ required: true, message: '考试时间为必填项！' }]">
        <a-input-number
          style="width: 100%"
          addon-after="分钟"
          v-model:value="info.examTime"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="1"
          :max="180"
        />
      </a-form-item>
      <a-form-item label="及格分" name="passScore" :rules="[{ required: true, message: '及格分为必填项！' }]">
        <a-input-number
          style="width: 70%"
          addon-after="分"
          v-model:value="info.passScore"
          placeholder="请输入"
          :controls="false"
          :precision="0"
          :min="type === 2 ? Number(info.score) * 0.85 : 1"
          :max="info.score"
          :maxlength="3"
        /><div style="line-height: 32px; display: inline-block">（总分：{{ info.score }}）</div>
      </a-form-item>
      <a-form-item label="考试验证" name="smsFlag" :rules="[{ required: true, message: '考试验证为必填项！' }]">
        <a-radio-group v-model:value="info.smsFlag" name="radioGroup">
          <a-radio value="0">短信验证</a-radio>
          <a-radio value="1">无</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="防切屏" name="cutScreen" :rules="[{ required: true, message: '请选择' }]">
        <a-switch v-model:checked="info.cutScreen" :checkedValue="true" :unCheckedValue="false" />
        <span style="color: #999; font-size: 12px; margin-left: 10px">（开启后考试切屏超过10秒将自动交卷）</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { TableProps } from 'ant-design-vue';
  import { loadTreeData, getExamPaper } from './url/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();
  const paperName = ref('');
  const showOkBtn = ref(true);
  const loading = ref(false);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys: any = ref([]);
  const dataSource = ref([]);
  const visible = ref(false);
  const info = ref({
    id: '',
    questionsSort: '2',
    optionsSort: '2',
    examTime: 30,
    passScore: 0,
    score: '',
    smsFlag: '1',
    examName: '',
    examNum: '2',
    cutScreen: true,
  });
  const infoRef = ref();
  const chooseResult = ref<any>({});
  const selectedRowKeys: any = ref([]);
  const paperId = ref('');
  const obj = ref({});
  const trainProjectCode = ref('');
  // 试卷类型(1:试卷,2:模拟试卷)
  const type = ref(1);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    info.value = {
      id: '',
      questionsSort: '2',
      optionsSort: '2',
      examTime: 30,
      passScore: 0,
      score: '',
      smsFlag: '1',
      examName: '',
      examNum: '2',
      cutScreen: true,
    };
    obj.value = {};
    paperId.value = '';
    getExam();
    loadRootTreeData();
    selectedRowKeys.value = [];
    chooseResult.value = {};
    trainProjectCode.value = data.trainProjectCode;
    type.value = data.type;
    if (data.exam) {
      selectedRowKeys.value = [data.exam.id];
      chooseResult.value = {
        id: data.exam.id,
        paperName: data.exam.examName,
        passScore:
          Number(data.exam.score) * 0.85 >= Number(data.exam.passScore) && type.value === 2
            ? Number(data.exam.score) * 0.85
            : Number(data.exam.passScore),
        score: Number(data.exam.score),
      };
      paperId.value = data.exam.id;
      obj.value = JSON.parse(JSON.stringify(data.exam));
      Object.assign(info.value, { ...data.exam });
    }
    info.value.examNum = type.value === 2 ? '3' : '2';
    info.value.cutScreen = type.value === 2 ? false : true;
  });
  const rowSelection = computed((): TableProps['rowSelection'] => {
    return {
      type: 'radio',
      selectedRowKeys: selectedRowKeys.value, // 绑定响应式的 key
      onChange: (_selectedRowKeys: string[], selectedRows: any[]) => {
        selectedRowKeys.value = _selectedRowKeys; // 只会包含一个选中的 key
        chooseResult.value = selectedRows[0]; // 保存选中的行
      },
    };
  });
  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'paperName',
      width: 488,
      slots: { customRender: 'paperName' },
    },
  ];
  // 默认选中
  const setSelectedKey = (key: string) => {
    selectedKeys.value = [key];
  };
  const total = ref(0);
  const pagination = computed(() => ({
    total: total.value,
    current: queryParams.value.pageNo,
    pageSize: queryParams.value.pageSize,
  }));
  const handleTableChange = ({ current }) => {
    queryParams.value.pageNo = current;
    getExam();
  };
  const queryParams = ref({
    category: '',
    pageNo: 1,
    pageSize: 10,
  });

  const getExam = () => {
    getExamPaper({ ...queryParams.value, paperName: paperName.value, category: selectedKeys.value[0] }).then((res) => {
      dataSource.value = res.records;
      total.value = res.total;
    });
  };
  // 类型
  const loadRootTreeData = async () => {
    try {
      treeData.value = [];
      const result = await loadTreeData({
        async: false,
        pcode: 'A02',
      });
      if (Array.isArray(result)) {
        treeData.value = result;
        treeData.value.unshift({
          title: '全部',
          key: '',
          code: '',
          children: [],
        });
        processTreeData(treeData.value);
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          const item = treeData.value[0];
          if (item) {
            // 默认选中第一个
            setSelectedKey(item.key);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  const processTreeData = (data) => {
    return data.map((item) => {
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        item.children = processTreeData(item.children);
      }
      item.key = item.code;
      return item;
    });
  };
  // 自动展开父节点，只展开一级
  const autoExpandParentNode = () => {
    const item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      // 默认选中第一个
      setSelectedKey(item.key);
    }
  };
  // 树选择事件
  const onSelect = (selKeys) => {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
    queryParams.value.pageNo = 1;
    getExam();
  };
  const close = () => {
    closeModal();
  };
  const confirmClose = async () => {
    if (selectedRowKeys.value.length > 0) {
      visible.value = true;
      info.value.id = chooseResult.value.id;
      if (paperId.value === '' || (paperId.value !== selectedRowKeys.value[0] && paperId.value !== '')) {
        info.value = {
          id: chooseResult.value.id,
          questionsSort: '2',
          optionsSort: '2',
          examTime: 30,
          passScore: 0,
          score: '',
          smsFlag: '1',
          examName: '',
          examNum: '2',
          cutScreen: true,
        };
        info.value.passScore =
          Number(chooseResult.value.score) * 0.85 >= Number(chooseResult.value.passScore) && type.value === 2
            ? Number(chooseResult.value.score) * 0.85
            : Number(chooseResult.value.passScore);
        info.value.score = chooseResult.value.score;
      } else {
        Object.assign(info.value, { ...obj.value });
      }
    } else {
      createMessage.info('请先选择试卷！');
    }
    info.value.examNum = type.value === 2 ? '3' : '2';
    info.value.cutScreen = type.value === 2 ? false : true;
  };
  const handleReturnOk = async () => {
    await infoRef.value.validate();
    info.value.examName = chooseResult.value.paperName;
    emit('success', info.value, type.value);
    visible.value = false;
    close();
  };
  const onSearch = () => {
    getExam();
  };
</script>
<style lang="less" scoped>
  .modalinner {
    display: flex;
    .left {
      width: 300px;
    }
    .right {
      flex: 1;
    }
  }
</style>
