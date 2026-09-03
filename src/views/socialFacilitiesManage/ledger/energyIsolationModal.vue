<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :bodyStyle="{ padding: '10px 20px 0 0' }" :title="title" destroyOnClose>
      <div>
        <a-form
          ref="formRef"
          name="insulation_tool_form"
          class="ant-advanced-search-form"
          :model="formState"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          :rules="rules"
        >
          <a-row>
            <a-col :span="12">
              <a-form-item label="所属单位" name="org">
                <a-select
                  v-model:value="formState.org"
                  placeholder="请选择"
                  :options="orgOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                  @change="handleDepartmentChange"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="所属车间" name="depart">
                <a-select
                  v-model:value="formState.depart"
                  placeholder="请选择"
                  :options="departOptions"
                  show-search
                  :filter-option="(input: string, option: any) =>  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="区域" name="region">
                <a-input v-model:value="formState.region" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="设备设施" name="equipmentFacilities">
                <a-input v-model:value="formState.equipmentFacilities" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="作业指导书" name="workingInstruction">
                <a-input v-model:value="formState.workingInstruction" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="隔离点位名称" name="quarantineSiteName">
                <a-input v-model:value="formState.quarantineSiteName" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="能源介质类型" name="energyMediumType">
                <j-dict-select-tag
                  v-model:value="formState.energyMediumType"
                  dictCode="dev_ledger_energy_medium_type	"
                  placeholder="请选择"
                  :string-to-number="false"
                  :show-choose-option="false"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="位置" name="position">
                <a-input v-model:value="formState.position" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="能源隔离点编号" name="code">
                <a-input v-model:value="formState.code" placeholder="请输入" :maxlength="50" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="备注" name="remark">
                <a-input v-model:value="formState.remark" placeholder="请输入" :maxlength="100" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <template #footer>
        <div style="text-align: center">
          <a-button style="margin-right: 15px" @click="close">取消</a-button>
          <a-button type="primary" :loading="loading" @click="confirmClose">确定</a-button>
        </div>
      </template>
    </BasicModal>
  </div>
</template>

<script lang="ts" name="energy-isolation-modal" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import type { FormInstance } from 'ant-design-vue';
  import { JDictSelectTag } from '/@/components/Form';
  import { add, edit } from './api';
  const emit = defineEmits(['success']);
  const title = ref('新增能源隔离点位台账');
  const loading = ref(false);
  const formRef = ref<FormInstance>();
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const type = ref('add');
  const formState = reactive({
    id: '',
    ledgerType: '5',
    org: undefined,
    depart: undefined,
    region: '',
    equipmentFacilities: '',
    workingInstruction: '',
    quarantineSiteName: '',
    energyMediumType: undefined,
    position: '',
    code: '',
    remark: '',
  });

  const rules = {
    org: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
    depart: [{ required: true, message: '请选择所属车间', trigger: 'change' }],
    equipmentFacilities: [{ required: true, message: '请输入设备设施', trigger: 'blur' }],
    workingInstruction: [{ required: true, message: '请输入作业指导书', trigger: 'blur' }],
    quarantineSiteName: [{ required: true, message: '请输入隔离点位名称', trigger: 'blur' }],
    energyMediumType: [{ required: true, message: '请选择能源介质类型', trigger: 'change' }],
    position: [{ required: true, message: '请输入位置', trigger: 'blur' }],
    code: [{ required: true, message: '请输入能源隔离点编号', trigger: 'blur' }],
  };

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.type === 'edit' ? '编辑能源隔离点台账' : '新增能源隔离点台账';
    type.value = data.type;
    departOptions.value = [];
    await getOrgList();
    if (data.type !== 'add') {
      Object.assign(formState, data.record);
      getDepartList(data.record.org);
    } else {
      resetForm();
    }
  });

  const resetForm = () => {
    Object.assign(formState, {
      id: '',
      ledgerType: '5',
      org: undefined,
      depart: undefined,
      region: '',
      equipmentFacilities: '',
      workingInstruction: '',
      quarantineSiteName: '',
      energyMediumType: undefined,
      position: '',
      code: '',
      remark: '',
    });
    if (orgOptions.value.length === 1) {
      formState.org = orgOptions.value[0].value;
      getDepartList(orgOptions.value[0].value);
    }
  };
  const getOrgList = async () => {
    const res = await getDepart3ListWithSecurity();
    orgOptions.value = res.map((item) => ({
      label: item.departName,
      value: item.orgCode,
    }));
  };
  const getDepartList = (orgCode: string) => {
    selectDeptNew({ orgCode }).then((res) => {
      departOptions.value = res.map((item: any) => ({
        label: item.departName,
        value: item.orgCode,
      }));
    });
  };

  const handleDepartmentChange = (value: string) => {
    formState.depart = undefined;
    departOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };

  const close = () => {
    closeModal();
  };

  const confirmClose = async () => {
    await formRef.value?.validate();
    loading.value = true;
    if (type.value === 'edit') {
      edit(formState)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      add(formState)
        .then(() => {
          emit('success');
          closeModal();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
</script>

<style lang="less" scoped></style>
