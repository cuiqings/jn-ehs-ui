<template>
  <BasicDrawer
    forceRender
    showFooter
    v-bind="$attrs"
    @register="register"
    title="检测录入详情"
    width="65%"
    @close="close"
    :show-ok-btn="false"
    destroyOnClose
  >
    <div style="width: 100%" v-loading="submitIng">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="姓名" name="name">
              <a-input disabled v-model:value="formState.name" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="工号" name="workNo">
              <a-input disabled v-model:value="formState.workNo" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属单位" name="orgName">
              <a-input disabled v-model:value="formState.orgName" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属车间" name="workshopName">
              <a-input disabled v-model:value="formState.workshopName" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="岗位" name="post">
              <a-input disabled v-model:value="formState.post" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-collapse v-model:activeKey="activeKey">
          <a-collapse-panel key="1" header="职业病危害因素检测结果">
            <div v-for="(result, i) in formState.detectionResult" :class="{firstT: i != 0}">
              <a-row :gutter="12">
                <a-col :span="11">
                  <a-form-item
                    :label-col="{ span: 5 }"
                    :wrapper-col="{ span: 19 }"
                    label="检测机构"
                    :name="[ 'detectionResult', i, 'testingAgencies']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-input disabled v-model:value="result.testingAgencies" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="11">
                  <a-form-item
                    :label-col="{ span: 5 }"
                    :wrapper-col="{ span: 19 }"
                    label="检测时间"
                    :name="[ 'detectionResult', i, 'detectionTime']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-date-picker disabled
                      style="width: 100%"
                      :disabledDate="disabledDate"
                      format="YYYY-MM-DD"
                      valueFormat="YYYY-MM-DD"
                      v-model:value="result.detectionTime"
                      placeholder="请选择"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="24"> 检测结果： </a-col>
              </a-row>
              <a-row
                :gutter="12"
                v-for="(item, idx) in result.detectionResult"
                :style="{ 'background-color': idx % 2 === 1 ? '#f5f5f5' : '', paddingTop: '16px' }"
              >
                <a-col :span="11">
                  <a-form-item
                    :label-col="{ span: 10 }"
                    :wrapper-col="{ span: 14 }"
                    label="接触危害因素名称"
                    :name="['detectionResult', i, 'detectionResult', idx, 'hazardFactorsName']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-input disabled v-model:value="item.hazardFactorsName" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="11">
                  <a-form-item
                    :label-col="{ span: 10 }"
                    :wrapper-col="{ span: 14 }"
                    label="检测结果"
                    :name="['detectionResult', i, 'detectionResult', idx, 'detectionResult']"
                    :rules="[{ required: ![27, 28].includes(item.hazardFactors), message: '请输入' }]"
                  >
                    <a-input-number disabled :addon-after="item.unit" v-if="item.hazardFactorsName == '噪声'" @change="(value, opt) => detectionResultChange(idx, value)" :min="0" :max="100" style="width: 100%" v-model:value="item.detectionResult" placeholder="请输入" />
                    <a-input disabled :addon-after="item.unit" v-else maxLength="8" style="width: 100%" v-model:value="item.detectionResult" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :offset="0" :span="11">
                  <a-form-item
                    :label-col="{ span: 10 }"
                    :wrapper-col="{ span: 14 }"
                    label="体检周期"
                    :name="['detectionResult', i, 'detectionResult', idx, 'cycle']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-radio-group disabled v-model:value="item.cycle" :disabled="item.hazardFactorsName == '噪声'">
                      <a-radio v-for="citem in item.options" :value="citem">{{ citem }}</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :span="11">
                  <a-form-item
                    :label-col="{ span: 10 }"
                    :wrapper-col="{ span: 14 }"
                    label="是否符合"
                    :name="['detectionResult', i, 'detectionResult', idx, 'accordWith']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-radio-group disabled v-model:value="item.accordWith">
                      <a-radio value="符合">符合</a-radio>
                      <a-radio value="不符合">不符合</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :offset="0" :span="11">
                  <a-form-item
                    :label-col="{ span: 10 }"
                    :wrapper-col="{ span: 14 }"
                    label="防护措施"
                    :name="['detectionResult', i, 'detectionResult', idx, 'protectiveMeasures']"
                    :rules="[{ required: true, message: '请输入' }]"
                  >
                    <a-input disabled v-model:value="item.protectiveMeasures" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="11">
                  <a-form-item 
                    :label-col="{ span: 10 }" 
                    :wrapper-col="{ span: 14 }" 
                    label="备注" name="remark">
                    <a-input disabled v-model:value="item.remark" placeholder="请输入" />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { detectionEntry, hazardFactors, archivesDetail, detectionEntryUpd, detectionEntryDel } from '../api';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import type { FormInstance } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { ref, reactive } from 'vue';

  const categoryOptions = ref<any[]>([]);
  const activeKey = ref(['1', '2']);
  const formRef = ref<FormInstance | null>(null);
  const title = ref('新增');
  const formState = reactive<any>({
    workNo: '',
    orgCode: '',
    workshop: '',
    post: '',
    name: '',
    id: '',
    testingAgencies: '',
    detectionTime: '',
    hazardFactors: [],
    detectionResult: [],
  });
  const submitIng = ref(false);
  const emits = defineEmits(['submitSuccess']);

  const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    categoryOptions.value = await hazardFactors();
    title.value = data.title;
    if(title.value == '详情') {
      submitIng.value = true;
      let res = await archivesDetail({ id: data.record.id });
      submitIng.value = false;
      Object.assign(formState, res);
      formState.hazardFactors = res.hazardFactors.split(',').map((item) => item * 1);
      formState.detectionResult && formState.detectionResult.forEach((item) => {
        item.detectionResult.forEach((citem) => {
          let c = categoryOptions.value.find((item) => item.id == citem.hazardFactors);
          citem.hazardFactorsName = c.name;
          citem.unit = c.unit;
          citem.options = c.options.split(',');
        });
      });
      return
    }
    data.record.hazardFactors = data.record.hazardFactors.split(',');
    Object.assign(formState, data.data);

    formState.hazardFactors.map((val) => {
      categoryOptions.value.map((item) => {
        if (item.id == val) {
          let obj = {
            hazardFactorsName: item.name,
            unit: item.unit,
            hazardFactors: item.id,
            detectionResult: '',
            accordWith: '符合',
            cycle: '',
            options: item.options ? item.options.split(',') : '',
            protectiveMeasures: '',
            remark: '无',
          };
          if(obj.options.length == 1) obj.cycle = obj.options[0];
          formState.detectionResult.push(obj);
        }
      });
    });
  });

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf('day');
  };

  const close = () => {
    formRef.value?.resetFields();
    formState.detectionResult = [];
  };

  const handleSubmit = () => {
    formRef.value
      ?.validate()
      .then(() => {
        changeOkLoading(true);
        if(title.value == '编辑录入'){
          let params = JSON.parse(JSON.stringify(formState));
          params.detectionResult.forEach(res => {
            res.detectionResult = JSON.stringify(res.detectionResult);
          })
          detectionEntryUpd(params.detectionResult).then((res) => {
            emits('submitSuccess', res);
            closeDrawer();
            close();
          })
          .finally(() => {
            changeOkLoading(false);
          });
          return;
        }
        detectionEntry(formState)
          .then((res) => {
            emits('submitSuccess', res);
            closeDrawer();
            close();
          })
          .finally(() => {
            changeOkLoading(false);
          });
      })
      .catch(() => {
        changeOkLoading(false);
      });
  };

  const detectionResultChange = (idx, value) => {
    if( formState.detectionResult[idx].hazardFactorsName != '噪声' ) return;
    if(value < 80) {
      formState.detectionResult[idx].cycle = '不检';
    } else if(value >= 80 && value < 85) {
      formState.detectionResult[idx].cycle = '2年1次';
    } else if (value >= 85) {
      formState.detectionResult[idx].cycle = '1年1次';
    }
  };
</script>
<style lang="less" scoped>
  .firstT{
    padding-top: 16px;
    border-top: 1px solid #dcdfe6;
    // 盒子底部外阴影
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .footbtn{
    display: flex;
    button{
      margin-right: 16px;
    }
  }
</style>
