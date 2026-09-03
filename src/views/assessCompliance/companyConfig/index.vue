<template>
  <div class="companyconfig">
    <a-form v-loading="loading" style="width: 100%" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="所属行业" :wrapperCol="{ span: 6 }">
        <JDictSelectTag @handleChange="onChange"  :disabled="readonly" v-model:value="formState.industry" placeholder="请选择" dictCode="trade" />
      </a-form-item>
      <a-form-item label="所属制造业" :wrapperCol="{ span: 6 }">
        <JDictSelectTag
          :allowClear="true"
          :disabled="readonly"
          v-model:value="formState.manufacturing"
          placeholder="请选择"
          dictCode="class_manufacturing_industries"
        />
      </a-form-item>
      <a-form-item v-for="(item, index) in options" :label="item.label" :key="item.key">
        <a-checkbox-group :disabled="readonly" v-model:value="formState[item.key]">
          <a-checkbox v-for="citem in item.options" :value="citem" name="type">{{ citem }}</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" v-show="readonly" @click="readonly = !readonly">编辑</a-button>
        <a-button type="primary" :laoding="loading" v-show="!readonly" style="margin-left: 10px" @click="onSubmit">保存</a-button>
        <a-button v-show="!readonly" :laoding="loading" style="margin-left: 10px" @click="readonly = !readonly">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, toRaw } from 'vue';
  import { JDictSelectTag } from '/@/components/Form';
  import { comGetInfo, updateOrAdd } from '../url/index';
  const readonly = ref(true);
  const loading = ref(false);
  interface FormState {
    industry: string;
    manufacturing: string;
  }
  const formState: FormState = reactive({
    industry: '2',
    manufacturing: '',
    workshopType: '',
    warehouseType: '',
    specialEquipment: '',
    specialWork: '',
    precursorChemicals: '',
    chemicals: '',
    wasteGases: '',
    castoff: '',
    occupationalDiseaseHazards: '',
  });
  const onSubmit = () => {
    let keys = Object.keys(formState);

    keys.forEach((key) => {
      if (!formState[key]) {
        formState[key] = '';
      }
      if (formState[key] instanceof Array) {
        formState[key] = formState[key].join(',');
      }
    });
    loading.value = true;
    updateOrAdd(formState).then((res) => {
      console.log(res);
      readonly.value = true;
      loading.value = false;
    }).catch(_ => {
      loading.value = false;
    }) 
  };
  const labelCol = { style: { width: '150px' } };
  const wrapperCol = { span: 14 };
  const onChange = (e, val) => {
    console.log(e, val);
  }
  const options = [
    {
      label: '车间类型',
      options: ['甲类', '乙类', '丙类', '丁类', '戊类'],
      key: 'workshopType',
    },
    {
      label: '仓库类型',
      options: ['甲类', '乙类', '丙类', '丁类', '戊类'],
      key: 'warehouseType',
    },
    {
      label: '特种设备',
      options: ['锅炉', '压力容器', '压力管道', '压力管道元件', '电梯', '起重机械', '客运索道', '大型游乐设施', '场（厂）内专用机动车辆'],
      key: 'specialEquipment',
    },
    {
      label: '特种作业',
      options: [
        '电工作业',
        '焊接与热切割作业',
        '高处作业',
        '制冷与空调作业',
        '煤矿安全作业',
        '金属非金属矿山安全作业',
        '石油天然气安全作业',
        '冶金（有色）生产安全作业',
        '危险化学品安全作业',
        '烟花爆竹安全作业',
        '安全监管总局认定的其他作业',
      ],
      key: 'specialWork',
    },
    {
      label: '易制毒化学品',
      options: ['第一类（如苯丙酮）', '第二类（如乙醚）', '第三类（如甲苯）'],
      key: 'precursorChemicals',
    },
    {
      label: '化学品',
      options: ['爆炸品', '剧毒化学品', '放射性物品'],
      key: 'chemicals',
    },
    {
      label: '废气',
      options: ['工艺废气', '锅炉', '食堂油烟', '应急发电机', '活性炭吸附', '催化燃烧', '集中焚烧'],
      key: 'wasteGases',
    },
    {
      label: '废弃物',
      options: ['危险废弃物', '电子废弃物', '医疗废物', '放射性废物', '厨余垃圾'],
      key: 'castoff',
    },
    {
      label: '职业病危害因素',
      options: ['粉尘', '矽肺粉尘', '有机挥发性气体', '有毒致敏化学品', '噪声', 'X射线仪', '震动'],
      key: 'occupationalDiseaseHazards',
    },
  ];
  pageInit();
  function pageInit() {
    loading.value = true;
    comGetInfo().then((res) => {
      let keys = Object.keys(res);
      keys.forEach((key) => {
        if (res[key].indexOf(',') > -1) {
          res[key] = res[key].split(',');
        }
      });
      Object.assign(formState, res);
      loading.value = false;
    }).catch(_ => {
      loading.value = false;
    });
  }
</script>
<style lang="less" scoped>
  .companyconfig {
    width: 100%;
    height: calc(100vh - 98px);
    background-color: #ffffff;
    padding: 16px;
    display: flex;
    overflow: hidden;
  }
</style>
