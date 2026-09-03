<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :width="getModalWidth"
    @ok="handleSubmit"
    :showOkBtn="showFooter"
    :showCancelBtn="showFooter"
  >
    <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="getLabelCol" :wrapper-col="getWrapperCol">
      <a-row :gutter="16">
        <!-- 类型 -->
        <a-col :span="getColSpan">
          <a-form-item label="类型" name="postType">
            <a-radio-group v-model:value="formData.postType" :disabled="!showFooter" @change="handlePostTypeChange">
              <a-radio value="2">科段级及以上</a-radio>
              <a-radio value="1">科段级以下</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <!-- 所属单位 -->
        <a-col :span="getColSpan">
          <a-form-item label="所属单位" name="orgCode">
            <a-select
              v-model:value="formData.orgCode"
              placeholder="请选择所属单位"
              :disabled="!showFooter"
              show-search
              :filter-option="filterOption"
              @change="handleOrgChange"
            >
              <a-select-option v-for="item in orgOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 所属车间 -->
        <a-col :span="getColSpan" v-if="formData.postType == '1'">
          <a-form-item label="所属车间" name="workshop" :rules="[{ required: true, message: '请选择所属车间', trigger: 'change' }]">
            <a-select
              v-model:value="formData.workshop"
              placeholder="请选择所属车间"
              :disabled="!showFooter"
              show-search
              :filter-option="filterOption"
            >
              <a-select-option v-for="item in departOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 考评周期 -->
        <a-col :span="getColSpan">
          <a-form-item label="考评周期" name="cycle">
            <a-select v-model:value="formData.cycle" placeholder="请选择考评周期" :disabled="!showFooter || !!formData.postType">
              <a-select-option value="1">每月</a-select-option>
              <a-select-option value="2">每季</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <!-- 未执行提醒 -->
        <a-col :span="getColSpan">
          <a-form-item label="未执行提醒" name="remind">
            <a-radio-group v-model:value="formData.remind" :disabled="!showFooter" @change="handleRemindTypeChange">
              <a-radio value="0">不提醒</a-radio>
              <a-radio value="1">提醒</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <!-- 提醒方式 -->
        <a-col :span="getColSpan" v-if="formData.remind === '1'">
          <a-form-item
            label="提醒方式"
            name="remindType"
            :rules="[{ required: formData.remind === '1', message: '请选择提醒方式', trigger: 'change' }]"
          >
            <a-checkbox-group v-model:value="formData.remindType" :disabled="!showFooter">
              <a-checkbox value="APP">APP</a-checkbox>
              <a-checkbox value="WEB">WEB</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </a-col>
        <!--        生效时间-->
        <a-col :span="getColSpan">
          <a-form-item label="生效时间" name="effectiveTime">
            <a-radio-group v-model:value="formData.effectiveTime">
              <a-radio value="1">本周期生效</a-radio>
              <a-radio value="2">下周期生效</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>

        <!-- 双清单及考评表 -->
        <a-col :span="getColSpan" v-if="showFooter">
          <a-form-item label="双清单及考评表" name="file">
            <a-upload
              v-model:file-list="formData.file"
              :before-upload="beforeUpload"
              :remove="handleRemove"
              :disabled="!showFooter"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            >
              <a-button v-if="showFooter" :disabled="formData.file.length >= 1"> <UploadOutlined /> 选择文件 </a-button>
            </a-upload>
            <div v-if="formData.file.length" class="file-display">
              <a :href="(formData as any).file[0].url" target="_blank" class="file-link">
                {{ getFileName((formData.file[0] as any).url) }}
              </a>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div v-if="!showFooter">
      <a-table :columns="columns" :data-source="dataSource" bordered :scroll="{ x: false }" :pagination="false">
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'name'">
            <a href="javascript:;">{{ text }}</a>
          </template>
        </template>
      </a-table>
    </div>
  </BasicModal>
</template>

<script setup name="dual-modal" lang="ts">
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { getDetail, saveOrUpdateWithFile } from './dual.api';
  import { orgOptions, departOptions, getDepartList } from './dual.data';
  import { getDictItemsByCode } from '/@/utils/dict';
  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();

  const isUpdate = ref(true);
  const showFooter = ref(true);
  const rowId = ref('');
  const formRef = ref();
  const dataSource = ref([]);
  const columns = ref([
    {
      title: '履职清单',
      dataIndex: 'listDuties',
      key: 'listDuties',
      // width: 250, // 去掉固定宽度
      customCell: (record, index) => {
        return getRowSpanProps(record, index, 'serialNumber');
      },
    },
    {
      title: '任务清单',
      dataIndex: 'taskList',
      key: 'taskList',
      // width: 250, // 去掉固定宽度
      customCell: (record, index) => {
        return getRowSpanProps(record, index, 'serialNumber');
      },
    },
    {
      title: '考评标准',
      dataIndex: 'evaluationCriteria',
      key: 'evaluationCriteria',
      width: 180, // 适当减小宽度
    },
    {
      title: '数据来源',
      dataIndex: 'source',
      key: 'source',
      width: 100, // 适当减小宽度
      customRender: ({ text }) => {
        if (text == '1') {
          return '自评';
        }
        if (text == '2') {
          return '系统获取';
        }
        return text;
      },
    },
    {
      title: '类型（自评）',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      customRender: ({ text }) => {
        return getDictItemText(text);
      },
    },
    {
      title: '上传次数（自评）',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 90,
    },
    {
      title: '每次得分（自评）',
      dataIndex: 'scoreEveryTime',
      key: 'scoreEveryTime',
      width: 90,
    },
    {
      title: '应得分',
      dataIndex: 'scored',
      key: 'scored',
      width: 80, // 适当减小宽度
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      // width: 120, // 去掉固定宽度，让其自适应
    },
  ]);
  /**
   * 获取字典值
   */
  const getDictItemText = (key: string) => {
    const dictItems = getDictItemsByCode('lzqd_type');
    const item = dictItems.find((item) => item.value == key);
    return item ? item.text : key;
  };
  /**
   * 表单数据
   */
  const formData = reactive({
    postType: undefined as string | undefined,
    orgCode: undefined as string | undefined,
    workshop: undefined as string | undefined,
    cycle: undefined as string | undefined,
    remind: undefined as string | undefined,
    remindType: [] as string[], // 提醒方式：APP、WEB可多选
    file: [] as any[],
  });

  /**
   * 表单验证规则
   */
  const formRules = {
    postType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    orgCode: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    cycle: [{ required: true, message: '请选择考评周期', trigger: 'change' }],
    remind: [{ required: true, message: '请选择未执行提醒', trigger: 'change' }],
    file: [{ required: true, message: '双清单及考评表不可为空!', trigger: 'change' }],
  };

  /**
   * 弹窗配置
   */
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 重置表单
    resetForm();
    setModalProps({ confirmLoading: false });

    isUpdate.value = !!data?.isUpdate;
    showFooter.value = data?.showFooter !== false;

    if (unref(isUpdate)) {
      // 编辑模式
      rowId.value = data.record.id;
      // 否则通过API获取详细数据
      try {
        const result = await getDetail({ id: data.record.id });
        setFormData(result);
        dataSource.value = result.items;
      } catch (error) {
        console.error('获取详情失败:', error);
        createMessage.error('获取数据失败');
      }
    } else {
      // 新增模式
      rowId.value = '';
      // 设置默认值
      formData.remind = undefined;
    }
  });

  /**
   * 弹窗标题
   */
  const getTitle = computed(() => {
    if (!showFooter.value) {
      return '查看详情';
    }
    return !unref(isUpdate) ? '新增' : '编辑';
  });

  /**
   * 动态设置弹窗宽度
   * 查看模式：1400px，新增/编辑模式：800px
   */
  const getModalWidth = computed(() => {
    if (!showFooter.value) {
      // 查看模式
      return 1400;
    }
    // 新增/编辑模式
    return 800;
  });

  /**
   * 动态设置列宽度
   * 查看模式：每行两项(12)，新增/编辑模式：每行一项(24)
   */
  const getColSpan = computed(() => {
    if (!showFooter.value) {
      // 查看模式：每行两项
      return 12;
    }
    // 新增/编辑模式：每行一项
    return 24;
  });

  /**
   * 动态设置标签列宽度
   */
  const getLabelCol = computed(() => {
    if (!showFooter.value) {
      // 查看模式：标签占用更少空间
      return { span: 8 };
    }
    // 新增/编辑模式
    return { span: 6 };
  });

  /**
   * 动态设置包装列宽度
   */
  const getWrapperCol = computed(() => {
    if (!showFooter.value) {
      // 查看模式：内容占用更多空间
      return { span: 16 };
    }
    // 新增/编辑模式
    return { span: 18 };
  });

  /**
   * 重置表单
   */
  function resetForm() {
    formRef.value?.resetFields();
    Object.assign(formData, {
      postType: undefined,
      orgCode: undefined,
      workshop: undefined,
      cycle: undefined,
      remind: undefined,
      remindType: [],
      file: [],
    });
  }

  /**
   * 设置表单数据
   */
  function setFormData(data: any) {
    Object.assign(formData, data);

    // 如果有文件URL，设置文件列表显示
    if (data.file) {
      formData.file = [];
    }

    // 如果有orgCode，加载对应的车间列表
    if (data.orgCode) {
      getDepartList(data.orgCode);
    }
  }

  /**
   * 类型变化处理
   */
  function handlePostTypeChange(e: any) {
    const val = e.target.value;
    if (val === '2') {
      formData.cycle = '1'; // 科段级及以上 -> 每月
    } else if (val === '1') {
      formData.cycle = '2'; // 科段级以下 -> 每季
    }
  }

  /**
   * 提醒类型变化处理
   */
  function handleRemindTypeChange(e: any) {
    // 当选择"不提醒"时，清空提醒方式
    if (e.target.value === '0') {
      formData.remindType = [];
    }
  }

  /**
   * 所属单位变化处理
   */
  function handleOrgChange(val: string) {
    formData.workshop = undefined;
    if (val) {
      getDepartList(val);
    }
  }

  /**
   * 选择框过滤函数
   */
  function filterOption(input: string, option: any) {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  /**
   * 文件上传前处理
   */
  function beforeUpload(file: File) {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(file.type);

    if (!isValidType) {
      createMessage.error('只能上传 PDF、Word、Excel 格式的文件!');
      return false;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      createMessage.error('文件大小不能超过 10MB!');
      return false;
    }

    // 不自动上传，返回false;
    return false;
  }

  /**
   * 文件移除处理
   */
  function handleRemove() {
    formData.file = [];
    return true;
  }

  /**
   * 获取文件名
   */
  function getFileName(url: string) {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || '文件';
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      // 验证表单
      await formRef.value?.validate();

      // 检查文件
      if (!formData.file.length) {
        createMessage.error('请上传双清单及考评表文件');
        return;
      }
      if (formData.remind == '1') {
        if (formData.remindType.length) {
          formData.remindType = formData.remindType.join(',') as any;
        }
      }
      setModalProps({ confirmLoading: true });

      // 创建FormData对象
      const formDataToSubmit = new FormData();

      // 添加表单字段
      Object.keys(formData).forEach((key) => {
        if (key !== 'file' && formData[key] !== undefined && formData[key] !== '') {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      // 如果是编辑模式，添加id
      if (unref(isUpdate) && rowId.value) {
        formDataToSubmit.append('id', rowId.value);
      }

      // 添加文件到FormData
      if (formData.file.length > 0) {
        const file = formData.file[0] as any;
        if (file.originFileObj) {
          formDataToSubmit.append('file', file.originFileObj);
        }
      }
      // 提交数据
      await saveOrUpdateWithFile(formDataToSubmit, unref(isUpdate)).then((data) => {
        if (data.code == 200) {
          createMessage.success(data?.message || '操作成功');
        } else {
          createMessage.error(data?.message || '操作失败');
        }
      });
      closeModal();
      emit('success');
    } catch (error: any) {
      console.error('提交失败:', error);
      createMessage.error(error?.message || '提交失败');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 计算行合并属性
   * @param record 当前行数据
   * @param index 当前行索引
   * @param field 用于合并的字段名
   * @returns 返回rowSpan和colSpan属性
   */
  function getRowSpanProps(record: any, index: number, field: string) {
    const currentValue = record[field];
    const dataList = dataSource.value;

    // 如果是第一行或者与上一行的值不同，计算需要合并的行数
    if (index === 0 || dataList[index - 1][field] !== currentValue) {
      let rowSpan = 1;
      // 向下查找相同值的行数
      for (let i = index + 1; i < dataList.length; i++) {
        if (dataList[i][field] === currentValue) {
          rowSpan++;
        } else {
          break;
        }
      }
      return { rowSpan, colSpan: 1 };
    } else {
      // 如果与上一行值相同，则不显示此单元格
      return { rowSpan: 0, colSpan: 0 };
    }
  }
</script>

<style scoped lang="less">
  :deep(.ant-form-item-label) {
    font-weight: 500;
  }

  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.ant-select) {
    width: 100%;
  }

  .file-display {
    margin-top: 8px;
  }

  .file-link {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
  :deep(.scrollbar__bar.is-horizontal > div) {
    /* height: 100%; */
  }
</style>
