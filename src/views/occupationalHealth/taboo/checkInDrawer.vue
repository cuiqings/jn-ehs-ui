<template>
  <BasicDrawer forceRender showFooter v-bind="$attrs" @register="register" title="检测录入" width="65%" @close="close" @ok="handleSubmit" destroyOnClose>
    <div style="width: 100%;">
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
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" label="检测机构" name="testingAgencies" :rules="[{ required: true, message: '请输入' }]">
                  <a-input v-model:value="formState.testingAgencies" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" label="检测时间" name="detectionTime" :rules="[{ required: true, message: '请输入' }]">
                  <a-date-picker style="width: 100%;" :disabledDate="disabledDate" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" v-model:value="formState.detectionTime" placeholder="请选择" />
                </a-form-item>
              </a-col>
              <a-col :span="24"> 
                检测结果：
              </a-col>
              </a-row>
              <a-row :gutter="12" v-for="(item, idx) in formState.detectionResult" :style="{'background-color': idx % 2 === 1 ? '#f5f5f5' : '', paddingTop: '16px'}">
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="接触危害因素名称" 
                    :name="['detectionResult', idx, 'hazardFactorsName']" 
                    :rules="[{ required: true, message: '请输入' }]">
                    <a-input disabled v-model:value="item.hazardFactorsName" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="检测结果" 
                    :name="['detectionResult', idx, 'detectionResult']" 
                    :rules="[{ required: true, message: '请输入' }]">
                    <a-input v-model:value="item.detectionResult" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="体检周期" 
                    :name="['detectionResult', idx, 'cycle']"
                    :rules="[{ required: true, message: '请输入' }]">
                    <a-radio-group v-model:value="item.cycle">
                      <a-radio v-for="citem in item.options" :value="citem">{{ citem }}</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="是否符合" 
                  :name="['detectionResult', idx, 'accordWith']" 
                  :rules="[{ required: true, message: '请输入' }]">
                    <a-radio-group v-model:value="item.accordWith">
                      <a-radio value="符合">符合</a-radio>
                      <a-radio value="不符合">不符合</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </a-col>
                <a-col :offset="1" :span="11">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="防护措施" 
                    :name="['detectionResult', idx, 'protectiveMeasures']" 
                    :rules="[{ required: true, message: '请输入' }]">
                    <a-input v-model:value="item.protectiveMeasures" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" label="备注" name="remark">
                    <a-input v-model:value="item.remark" placeholder="请输入" />
                  </a-form-item>
                </a-col>
            </a-row>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
import { detectionEntry, hazardFactors } from '../api'
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import type { FormInstance } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { ref, reactive } from 'vue';

const activeKey = ref(['1', '2'])
const formRef = ref<FormInstance|null>(null);
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
  detectionResult: []
});

const emits = defineEmits(['submitSuccess']);

const [register, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
  title.value = data.title;
  let res = await hazardFactors()
  data.data.hazardFactors = data.data.hazardFactors.split(',');
  Object.assign(formState, data.data);
  
  formState.hazardFactors.map(val => {
    res.map(item => {
      if (item.id == val) {
        console.log(item);
        formState.detectionResult.push({
          hazardFactorsName: item.name,
          hazardFactors: item.id,
          detectionResult: '',
          accordWith: '符合',
          cycle: '',
          options: item.options.split(','),
          protectiveMeasures: '',
          remark: '无',
        })
      }
    })
  })
});

const disabledDate = (current: Dayjs) => {
  return current && current > dayjs().endOf('day');
};

const close = () => {
  formRef.value?.resetFields();
  formState.detectionResult =[]
}

const handleSubmit = () => {
  formRef.value?.validate().then(() => {
    changeOkLoading(true);
    detectionEntry(formState).then(res => {
      changeOkLoading(false);
      emits('submitSuccess', res);
      closeDrawer();
      close();
    }).catch(err => {
      changeOkLoading(false);
    })
  }).catch(() => {
    changeOkLoading(false);
  })
};

</script>
