<template>
  <BasicDrawer v-bind="$attrs" @register="register" :title="title" @close="onClose" width="68%">
    <a-form
      v-loading="loading"
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
      style="padding-bottom: 60px"
    >
      <!-- 计划信息 -->
      <a-row :gutter="16">
        <a-col :span="7">
          <a-form-item :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" label="计划年度" name="year" required>
            <a-select v-model:value="formData.year" placeholder="请选择" @change="yearChange">
              <a-select-option v-for="item in yearList" :key="item.label" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="7">
          <a-form-item label="计划单位" name="orgCode" required>
            <a-select
              v-model:value="formData.orgCode"
              :options="unitList"
              :field-names="{ label: 'departName', value: 'orgCode' }"
              placeholder="请选择"
              style="width: 100%"
              @change="unitChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item label="计划名称" name="planName" required>
            <a-input v-model:value="formData.planName" placeholder="请输入计划名称" readonly style="width: 100%">
              <template #addonBefore> {{ formData.year }}-{{ formData.orgCodeName }}</template>
            </a-input>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-bottom: 10px">
        <a-col :span="4">
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="importOpen">导入</a-button>
        </a-col>
        <a-col :span="20" style="text-align: right; line-height: 32px; font-size: 16px">
          <a style="text-decoration: underline; cursor: pointer" @click="downloadTemplate">导入模板下载</a>
        </a-col>
      </a-row>
      <!-- 项目信息 -->
      <a-collapse v-model:activeKey="activeKey">
        <a-collapse-panel :key="idx" v-for="(item, idx) in formData.projectList" :header="item.projectNameTitle || '项目信息'">
          <a-row>
            <a-col :span="24">
              <a-form-item :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" required label="项目名称" :name="['projectList', idx, 'projectName']">
                <a-select
                  v-model:value="item.projectName"
                  :options="projectNameList"
                  :field-names="{ label: 'text', value: 'value' }"
                  placeholder="请选择"
                  style="width: 100%"
                  @change="(val, item) => changeProjectName(val, item, idx)"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                :label="`${formData.year - 1}年预算`"
                :name="['projectList', idx, 'lastYearBudget']"
              >
                <a-input-number :max="999999999" v-model:value="item.lastYearBudget" placeholder="请输入" style="width: 100%" :precision="2" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                :label="`${formData.year - 1}年1-9月实际金额`"
                :name="['projectList', idx, 'lastYearActualAmount']"
              >
                <a-input-number
                  :max="999999999"
                  v-model:value="item.lastYearActualAmount"
                  placeholder="请输入实际金额"
                  style="width: 100%"
                  :precision="2"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                required
                :label="`${formData.year - 1}年预计金额`"
                :name="['projectList', idx, 'lastYearEstimatedAmount']"
              >
                <a-input-number
                  :max="999999999"
                  v-model:value="item.lastYearEstimatedAmount"
                  placeholder="请输入金额"
                  style="width: 100%"
                  :precision="2"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                :label="`${formData.year}年预算金额`"
                :name="['projectList', idx, 'currentYearBudgetAmount']"
                required
              >
                <a-input-number
                  @change="changeCurrentYearBudgetAmount(item, idx)"
                  :max="999999999"
                  v-model:value="item.currentYearBudgetAmount"
                  placeholder="根据依据明细自动计算"
                  style="width: 100%"
                  :precision="2"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                :label="`与${formData.year - 1}年预算对比`"
                :name="['projectList', idx, 'compareLastYear']"
                required
              >
                <a-input-number
                  v-model:value="item.compareLastYear"
                  :placeholder="`对比=${formData.year}年预算-${formData.year - 1}年预算`"
                  style="width: 100%"
                  :precision="2"
                  disabled
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                label="增降比例"
                :name="['projectList', idx, 'increaseDecreaseRatio']"
              >
                <a-input-number
                  addon-after="%"
                  v-model:value="item.increaseDecreaseRatio"
                  :placeholder="`增降比例=对比/${formData.year - 1}年预算`"
                  style="width: 100%"
                  :precision="2"
                  disabled
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 预算依据明细 -->
          <div class="tit">预算依据明细</div>
          <a-table :columns="budgetColumns" :data-source="item.detailsJson" :pagination="false" size="small" bordered>
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'project'">
                <a-form-item
                  style="margin-bottom: 0"
                  :name="['projectList', idx, 'detailsJson', index, 'project']"
                  :rules="{ required: true, message: '请输入' }"
                >
                  <a-input v-model:value="record.project" placeholder="请输入项目" maxlength="50" size="small" />
                </a-form-item>
              </template>
              <template v-else-if="column.key === 'unit'">
                <a-form-item
                  style="margin-bottom: 0"
                  :name="['projectList', idx, 'detailsJson', index, 'unit']"
                  :rules="{ required: true, message: '请输入' }"
                >
                  <a-input v-model:value="record.unit" placeholder="请输入单位" maxlength="5" size="small" />
                </a-form-item>
              </template>
              <template v-else-if="column.key === 'number'">
                <a-form-item
                  style="margin-bottom: 0"
                  :name="['projectList', idx, 'detailsJson', index, 'number']"
                  :rules="{ required: true, message: '请输入' }"
                >
                  <a-input-number
                    v-model:value="record.number"
                    :min="0"
                    :precision="2"
                    maxlength="10"
                    placeholder="数量"
                    size="small"
                    style="width: 100%"
                  />
                </a-form-item>
              </template>
              <template v-else-if="column.key === 'price'">
                <a-form-item
                  style="margin-bottom: 0"
                  :name="['projectList', idx, 'detailsJson', index, 'price']"
                  :rules="{ required: true, message: '请输入' }"
                >
                  <a-input-number v-model:value="record.price" :min="0" :precision="2" placeholder="单价" size="small" style="width: 100%" />
                </a-form-item>
              </template>
              <template v-else-if="column.key === 'totalCost'">
                <a-input-number :value="totalCost(record)" :precision="2" disabled size="small" style="width: 100%" />
              </template>
              <template v-else-if="column.key === 'remark'">
                <a-input v-model:value="record.remark" maxlength="100" placeholder="请输入备注" size="small" />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="addBudgetItem(idx)">+</a-button>
                  <a-button type="link" size="small" v-if="item.detailsJson.length > 1" @click="removeBudgetItem(index, idx)" style="color: #ff4d4f"
                    >删除</a-button
                  >
                </a-space>
              </template>
            </template>
            <template #summary>
              <a-table-summary>
                <a-table-summary-row>
                  <a-table-summary-cell :col-span="budgetColumns.length - 2">合计</a-table-summary-cell>
                  <a-table-summary-cell>
                    {{ projectTotalCost(item, idx) }}
                  </a-table-summary-cell>
                  <a-table-summary-cell />
                </a-table-summary-row>
              </a-table-summary>
            </template>
          </a-table>
          <!-- 备注 -->
          <div style="margin: 10px">备注：</div>
          <a-form-item name="remark">
            <a-textarea v-model:value="item.remark" placeholder="请输入备注信息" :rows="4" />
          </a-form-item>
          <div style="margin-top: 8px">
            <a-button type="link" @click="addProjectItem">+ 添加项目</a-button>
            <a-button type="link" danger @click="delProjectItem(idx)">删除</a-button>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-form>

    <template #footer>
      <div class="btns">
        <a-space :size="24">
          <a-button @click="onClose">取消</a-button>
          <a-button type="primary" @click="save" :loading="submitIng">保存</a-button>
          <a-button type="primary" @click="submit" :loading="submitIng">提交</a-button>
        </a-space>
      </div>
    </template>
    <a-modal v-model:visible="openImport" title="导入" :footer="null">
      <div style="padding: 12px 20px">
        <a-upload-dragger
          v-model:fileList="fileList"
          :max-count="1"
          :before-upload="beforeUpload"
          :customRequest="dummyRequest"
          name="file"
          :multiple="false"
          @change="handleChange"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined style="font-size: 32px; color: #1890ff" />
          </p>
          <p class="ant-upload-text">点击或拖拽上传附件</p>
        </a-upload-dragger>
      </div>
    </a-modal>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { inputPlanAdd, inputPlanSave, inputPlanInfo, queryLastYearBudget, importData } from './api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getDepart3ListWithSecurity, uploadFile } from '/@/api/common/api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { FormInstance } from 'ant-design-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { InboxOutlined } from '@ant-design/icons-vue';
  const userStore: any = useUserStore();
  const { createMessage } = useMessage();
  const submitIng = ref(false);
  const title = ref('创建计划');
  const openImport = ref(false);
  const disabled = ref(false);
  const formRef = ref<FormInstance>();
  const unitList = ref([]);
  const activeKey = ref([0]);
  const yearList = ref([
    { label: new Date().getFullYear() + '年', value: new Date().getFullYear() },
    { label: new Date().getFullYear() + 1 + '年', value: new Date().getFullYear() + 1 },
  ]);
  const fileList = ref([]);
  const loading = ref(false);
  const projectNameList = ref<any[]>([]);
  projectNameList.value = userStore.getAllDictItems?.project_name;
  // 表单数据
  const formData = reactive<any>({
    year: new Date().getFullYear() + 1,
    orgCode: userStore.userInfo?.orgCode?.slice(0, 9) || undefined,
    planName: '安全投入费用预算',
    orgCodeName: '',
    projectList: [
      {
        projectName: undefined,
        lastYearBudget: '',
        lastYearActualAmount: '',
        lastYearEstimatedAmount: null,
        currentYearBudgetAmount: '',
        compareLastYear: '',
        increaseDecreaseRatio: '',
        detailsJson: [
          {
            item: '',
            unit: '',
            number: '',
            price: '',
            totalCost: '',
            reduce: '',
          },
        ],
        remark: '',
      },
    ],
    remark: '',
  });

  // 加载单位列表
  const loadUnitList = async () => {
    try {
      const res = await getDepart3ListWithSecurity();
      unitList.value = res;
      if (res.length == 1) {
        formData.orgCode = res[0].orgCode;
        formData.orgCodeName = res[0].departName;
      }
    } catch (error) {
      console.error('加载单位列表失败:', error);
    }
  };

  // 组件挂载时加载单位列表
  onMounted(async () => {
    await loadUnitList();
  });

  // 表单验证规则
  const rules = {
    year: [{ required: true, message: '请选择计划年度', trigger: 'change' }],
    orgCode: [{ required: true, message: '请选择计划单位', trigger: 'change' }],
    planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
    lastYearEstimatedAmount: [{ required: true, message: '请输入', trigger: 'blur' }],
    currentYearBudgetAmount: [{ required: true, message: '请输入', trigger: 'blur' }],
    compareLastYear: [{ required: true, message: '请输入预算对比', trigger: 'blur' }],
  };

  const totalCost = (record: any) => {
    const total = (Number(record.number) || 0) * (Number(record.price) || 0);
    record.totalCost = total;
    return total;
  };

  // 预算明细表格列配置
  const budgetColumns = [
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      width: 200,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: '数量',
      dataIndex: 'number',
      key: 'number',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
    },
    {
      title: '费用',
      key: 'totalCost',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
    },
  ];

  const [register, { closeDrawer }] = useDrawerInner((data) => {
    title.value = data.title;
    disabled.value = data.disabled || false;
    if (data.record && data.record.id) {
      loading.value = true;
      // 编辑模式，加载数据
      inputPlanInfo({ id: data.record.id })
        .then((res) => {
          res.planName = res.planName.split('-')[2];
          Object.assign(formData, res);
          if (formData.projectList && formData.projectList.length > 0) {
            formData.projectList.forEach((item) => {
              item.projectNameTitle = projectNameList.value.find((val: any) => val.value == item.projectName)?.text;
            });
          }
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      // 新增模式，重置表单
      Object.assign(formData, {
        year: new Date().getFullYear() + 1,
        orgCode: userStore.userInfo?.orgCode?.slice(0, 9) || undefined,
        planName: '安全投入费用预算',
        projectList: [
          {
            projectName: undefined,
            lastYearBudget: 0,
            lastYearActualAmount: 0,
            lastYearEstimatedAmount: null,
            currentYearBudgetAmount: 0,
            compareLastYear: 0,
            increaseDecreaseRatio: 0,
            detailsJson: [
              {
                item: '',
                unit: '',
                number: 0,
                price: 0,
                totalCost: 0,
              },
            ],
            remark: '',
          },
        ],
      });
    }
  });

  const changeProjectName = (val: any, item: any, idx) => {
    formData.projectList[idx].projectNameTitle = item.text;
    getLastYearBudget(idx);
  };

  async function getLastYearBudget(idx) {
    if (!formData.projectList[idx].projectNameTitle || !formData.year || !formData.orgCode) return;
    queryLastYearBudget({ name: formData.projectList[idx].projectNameTitle, year: formData.year, orgCode: formData.orgCode }).then((res) => {
      if (res) {
        formData.projectList[idx].lastYearBudget = res.lastYearBudget;
        formData.projectList[idx].lastYearActualAmount = res.lastYearActualAmount;
        formData.projectList[idx].lastYearEstimatedAmount = res.lastYearEstimatedAmount;
      }
    });
  }

  const emits = defineEmits(['success']);

  // 计算项目合计
  const projectTotalCost = (item: any, idx: number) => {
    const total = item.detailsJson.reduce((sum, item) => sum + (Number(item.number) || 0) * (Number(item.price) || 0), 0).toFixed(2);
    // formData.projectList[idx].currentYearBudgetAmount = total;
    // formData.projectList[idx].compareLastYear = total - item.lastYearBudget;
    // formData.projectList[idx].increaseDecreaseRatio =
    //   item.lastYearBudget == 0 ? 0 : (((total - item.lastYearBudget) / item.lastYearBudget) * 100).toFixed(2);
    return total;
  };

  const changeCurrentYearBudgetAmount = (item: any, idx: number) => {
    formData.projectList[idx].compareLastYear = item.currentYearBudgetAmount - item.lastYearBudget;
    formData.projectList[idx].increaseDecreaseRatio =
      item.lastYearBudget == 0 ? 0 : (((item.currentYearBudgetAmount - item.lastYearBudget) / item.lastYearBudget) * 100).toFixed(2);
  };

  // 添加预算项目
  const addBudgetItem = (idx: number) => {
    formData.projectList[idx].detailsJson.push({
      item: '',
      unit: '',
      number: 0,
      price: 0,
      totalCost: 0,
      remark: '',
      reduce: 0,
    });
  };
  const addProjectItem = () => {
    activeKey.value.push(formData.projectList.length);
    formData.projectList.push({
      projectName: '',
      lastYearBudget: 0,
      lastYearActualAmount: 0,
      lastYearEstimatedAmount: null,
      currentYearBudgetAmount: 0,
      compareLastYear: 0,
      increaseDecreaseRatio: 0,
      detailsJson: [{ item: '', unit: '', number: 0, price: 0, totalCost: 0, reduce: 0 }],
    });
  };
  const delProjectItem = (idx: number) => {
    if (idx == 0) return;
    formData.projectList.splice(idx, 1);
  };

  // 删除预算项目
  const removeBudgetItem = (index: number, idx: number) => {
    formData.projectList[idx].detailsJson.splice(index, 1);
  };

  const yearChange = (value: number) => {
    formData.year = value;
    formData.projectList.forEach((item, idx) => {
      getLastYearBudget(idx);
    });
  };
  const unitChange = (value: string, val, s) => {
    formData.orgCode = value;
    formData.orgCodeName = val.departName;
    formData.projectList.forEach((item, idx) => {
      getLastYearBudget(idx);
    });
  };

  // 保存
  const save = async () => {
    await formRef.value?.validate();
    submitIng.value = true;
    const params = { ...formData };
    params.planName = `${params.year}-${params.orgCodeName}-${params.planName}`;
    if (title.value === '编辑计划') {
      await inputPlanSave(params);
    } else {
      await inputPlanSave(params);
    }
    emits('success');
    closeDrawer();
    setTimeout(() => {
      submitIng.value = false;
    }, 500);
  };

  // 提交
  const submit = async () => {
    await formRef.value
      ?.validate()
      .catch(() => {
        createMessage.error('请检查必填项');
      })
      .then(async () => {
        submitIng.value = true;
        const params = { ...formData, status: 'pending' };
        params.planName = `${params.year}-${params.orgCodeName}-${params.planName}`;
        await inputPlanAdd(params).finally(() => {
          submitIng.value = false;
        });
        emits('success');
        closeDrawer();
      });
  };
  const importOpen = () => {
    openImport.value = true;
  };
  const downloadTemplate = () => {
    const { handleExportXlsx } = useMethods();
    let params = {};
    handleExportXlsx('安全生产投入计划项目导入模板', '/investPlan/downloadTemplate', params);
  };
  const onClose = () => {
    formRef.value?.resetFields();
    console.log(formRef.value);
    formData.projectList = [
      {
        projectName: '',
        lastYearBudget: '',
        lastYearActualAmount: '',
        lastYearEstimatedAmount: null,
        currentYearBudgetAmount: '',
        compareLastYear: '',
        increaseDecreaseRatio: '',
        detailsJson: [
          {
            item: '',
            unit: '',
            number: '',
            price: '',
            totalCost: '',
            reduce: '',
          },
        ],
      },
    ];
    closeDrawer();
  };
  // 上传相关
  const beforeUpload = (file: File) => {
    const isAllowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type);
    if (!isAllowed) {
      createMessage.error('仅支持xls、xlsx格式的文件');
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 30;
    if (!isLt10M) {
      createMessage.error('文件大小不能超过30MB');
      return false;
    }
    return true;
  };
  const dummyRequest = (options: any) => {
    const form = new FormData();
    form.append('file', options.file);
    importData(form)
      .then((res) => {
        console.log(res, 'options');
        if (res.length > 0) {
          //关闭弹窗
          fileList.value = [];
          openImport.value = false;
          formData.projectList = res;
        }
      })
      .catch((err) => {
        fileList.value = [];
        openImport.value = false;
      });
  };
  const handleChange = () => {};
</script>

<style scoped lang="less">
  .btns {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :deep(.ant-card-head) {
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-form-item-label) {
    font-weight: 500;
  }

  :deep(.ant-input),
  :deep(.ant-select),
  :deep(.ant-input-number) {
    border-radius: 4px;
  }

  :deep(.ant-input:focus),
  :deep(.ant-select-focused .ant-select-selector),
  :deep(.ant-input-number-focused) {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  .tit {
    font-size: 16px;
    font-weight: 500;
    height: 48px;
    line-height: 48px;
    display: flex;
    align-items: center;
    margin-top: 10px;
    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 16px;
      background-color: #1890ff;
      margin-right: 8px;
    }
  }
</style>
