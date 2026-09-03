<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @register="registerModal"
      title="去填报"
      :width="getModalWidth"
      @ok="handleSubmit"
      :showOkBtn="showFooter"
      :showCancelBtn="showFooter"
    >
      <a-form ref="formRef" :model="formData" :label-col="getLabelCol" :wrapper-col="getWrapperCol">
        <a-row :gutter="16">
          <!-- 所属单位 -->
          <a-col :span="getColSpan">
            <a-form-item label="所属单位">
              <span>{{ formData.orgCode }}</span>
            </a-form-item>
          </a-col>
          <!-- 所属车间 -->
          <a-col :span="getColSpan">
            <a-form-item label="所属车间">
              <span>{{ formData.workshop || '无' }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="getColSpan">
            <a-form-item label="岗位">
              <span>{{ formData.post }}</span>
            </a-form-item>
          </a-col>
          <!-- 考评周期 -->
          <a-col :span="getColSpan">
            <a-form-item label="考评周期">
              <span>{{ formData.cycleDate }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="getColSpan">
            <a-form-item label="姓名">
              <span>{{ formData.realName }}</span>
            </a-form-item>
          </a-col>
          <!-- 未执行提醒 -->
          <a-col :span="getColSpan">
            <a-form-item label="未执行提醒" name="remind">
              <a-radio-group v-model:value="formData.remind" :disabled="!showFooter">
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
        </a-row>
      </a-form>
      <div v-if="!showFooter">
        <a-table :columns="columns" :data-source="dataSource" bordered :scroll="{ x: false }" :pagination="false">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'operation'">
              <div style="display: flex">
                <a-button type="link" size="small" v-if="record.dataType=='0'" @click="handleRealFill(record)">填报</a-button>
                <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </BasicModal>
    <!-- 填报抽屉 -->
    <FillDrawer @register="registerDrawer" @success="handleFillSuccess" />
  </div>
</template>

<script setup name="duty-fill-modal" lang="ts">
  import { ref, computed, unref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { getFillDetail, saveOrUpdateWithFile } from './dutyFill.api';
  import { useDrawer } from '/@/components/Drawer';
  import FillDrawer from './FillDrawer.vue';
  import { getDictItemsByCode } from '/@/utils/dict';

  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();

  /**
   * 修复 Ant Design Vue Modal 组件的 aria-hidden 无障碍问题
   * 移除带有 aria-hidden="true" 的元素的 tabindex 属性，防止焦点陷阱
   */
  function fixAriaHiddenAccessibility() {
    nextTick(() => {
      // 查找所有带有 aria-hidden="true" 的元素
      const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');
      
      ariaHiddenElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        // 如果元素有 tabindex 属性，移除它以防止焦点问题
        if (htmlElement.hasAttribute('tabindex')) {
          htmlElement.removeAttribute('tabindex');
        }
        
        // 或者使用 inert 属性（如果浏览器支持）
        if ('inert' in htmlElement) {
          htmlElement.inert = true;
        }
      });
    });
  }

  // 填报抽屉相关
  const [registerDrawer, { openDrawer: openFillDrawer }] = useDrawer();

  const isUpdate = ref(true);
  const showFooter = ref(true);
  const rowId = ref('');
  const dataSource = ref([]);
  const columns = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 80,
      customCell: (record, index) => {
        return getRowSpanProps(record, index, 'serialNumber');
      },
    },
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
      width: 100,
      customRender: ({ text }) => {
        if (text == 1) {
          return '自评';
        } else if (text == 2) {
          return '系统获取';
        } else {
          return '';
        }
      },
    },
    {
      title: '类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      customRender: ({ text }) => {
        return getDictItemText(text);
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
    },
  ];

  /**
   * 表单数据接口定义
   */
  interface FormData {
    orgCode?: string;
    workshop?: string;
    post?: string;
    cycleDate?: string;
    realName?: string;
    remind?: string;
    remindType?: string[];
    itemlist?: any[];
  }

  /**
   * 表单数据
   */
  const formData = ref<FormData>({})
  /**
   * 获取字典值
   */
  const getDictItemText = (key: string) => {
    const dictItems = getDictItemsByCode('lzqd_type');
    const item = dictItems.find((item) => item.value == key);
    return item ? item.text : key;
  };
  /**
   * 表单引用
   */
  const formRef = ref()
  /**
   * 弹窗配置
   */
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });

    isUpdate.value = !!data?.isUpdate;
    showFooter.value = data?.showFooter !== false;

    if (unref(isUpdate)) {
      // 编辑模式
      rowId.value = data.record.id;
      // 否则通过API获取详细数据
      getDetailData(data.record.id);
    } else {
      // 新增模式
      rowId.value = '';
    }

    // 修复 aria-hidden 无障碍问题
    fixAriaHiddenAccessibility();
  });
  /**
   * 获取详情数据
   * @param id 记录ID
   */
  async function getDetailData(id: string) {
    try {
      const result = await getFillDetail({ id: id });
      formData.value = result || {};
      dataSource.value = result?.itemlist || [];
    } catch (error) {
      console.error('获取详情失败:', error);
      createMessage.error('获取数据失败');
    }
  }

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
      return 8;
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
   * API 响应结果接口定义
   */
  interface ApiResult {
    success: boolean;
    message?: string;
    data?: any;
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      const values = await formRef.value?.validateFields();
      setModalProps({ confirmLoading: true });
      
      // 创建 FormData 对象
      const formDataObj = new FormData();
      
      // 添加表单数据到 FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formDataObj.append(key, values[key]);
        }
      });
      
      // 添加 ID 字段
      if (rowId.value) {
        formDataObj.append('id', rowId.value);
      }
      
      // 调用API，传递 FormData 和 isUpdate 参数
      const result: ApiResult = await saveOrUpdateWithFile(formDataObj, unref(isUpdate));
      
      if (result.success) {
        createMessage.success(result.message || '操作成功');
        closeModal();
        emit('success');
      } else {
        createMessage.error(result.message || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      createMessage.error('提交失败');
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

  /**
   * 填报
   */
  function handleRealFill(record: any) {
    openFillDrawer(true, {
      record: record,
      isView: false,
    });
  }

  /**
   * 查看
   */
  function handleView(record: any) {
    // 修复 aria-hidden 无障碍问题
    fixAriaHiddenAccessibility();
    openFillDrawer(true, {
      record: record,
      isView: true,
    });
  }

  /**
   * 填报抽屉成功回调
   */
  function handleFillSuccess() {
    // 刷新弹窗数据
    getDetailData(rowId.value);
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
