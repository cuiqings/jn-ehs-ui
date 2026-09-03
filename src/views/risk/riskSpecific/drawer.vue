<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="1200"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
    class="riskEvaluateDrawer"
    :zIndex="1001"
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <div class="nav"> 危险源信息</div>
      <a-form-item label="所属单位" name="orgCode" :rules="[{ required: showOkBtn }]">
        <a-select
          v-model:value="info.orgCode"
          :options="orgOptions"
          placeholder="请选择"
          allow-clear
          :disabled="orgOptions.length === 1 || !showOkBtn"
          showSearch
          :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
          @change="changeOrg"
        />
      </a-form-item>
      <a-form-item label="所属车间" name="departCode" :rules="[{ required: showOkBtn }]">
        <a-select
          v-model:value="info.departCode"
          :options="departOptions"
          placeholder="请选择"
          allow-clear
          :disabled="!showOkBtn"
          showSearch
          :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
          @change="changeDepart"
        />
      </a-form-item>
      <a-form-item label="辨识单元" name="recogId" :rules="[{ required: showOkBtn }]">
        <a-select
          v-model:value="info.recogId"
          :options="areaOptions"
          placeholder="请选择"
          allow-clear
          :disabled="!showOkBtn"
          showSearch
          :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
          @change="changePoint"
        />
      </a-form-item>
      <a-form-item :label="activeKey === '1' ? '设备名称' : '作业活动名称'" name="pointId" :rules="[{ required: showOkBtn }]">
        <a-select
          v-model:value="info.pointId"
          :options="pointOptions"
          placeholder="请选择"
          allow-clear
          :disabled="!showOkBtn"
          showSearch
          :filterOption="(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0"
        />
      </a-form-item>
      <a-form-item v-if="activeKey === '1'" label="检查项目" name="checkItem" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.checkItem" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item v-if="activeKey === '1'" label="不符合标准情况及后果" name="consequence" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.consequence" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item v-if="activeKey === '1'" label="标准" name="standard" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.standard" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item v-if="activeKey === '2'" label="作业步骤" name="workStep" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.workStep" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item
        class="label-item"
        v-if="activeKey === '2'"
        label="危险源或潜在事件（人、物、作业环境、管理）"
        name="dangerSource"
        :rules="[{ required: showOkBtn }]"
      >
        <InputTextArea v-model:value="info.dangerSource" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="可能发生的事故类型" name="accidentType" :rules="[{ required: showOkBtn }]">
        <JDictSelectTag
          v-model:value="info.accidentType"
          placeholder="请选择"
          mode="multiple"
          dictCode="bs_accident_category"
          :stringToNumber="false"
          :showChooseOption="false"
          :disabled="!showOkBtn"
        />
      </a-form-item>
      <div class="nav"> 现有管控措施</div>
      <a-form-item label="工程技术措施" name="existingGcjsMsr" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.existingGcjsMsr" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="组织管理措施" name="existingZzglMsr" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.existingZzglMsr" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="培训教育措施" name="existingPxjyMsr" :disabled="!showOkBtn" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.existingPxjyMsr" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="个人防护措施" name="existingGrfhMsr" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.existingGrfhMsr" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="应急处理措施" name="existingYjclMsr" :rules="[{ required: showOkBtn }]">
        <InputTextArea v-model:value="info.existingYjclMsr" :disabled="!showOkBtn" placeholder="请输入" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="风险评价" name="evaluate" required>
        <a-table :columns="columns" :data-source="info.evaluate" :pagination="false" bordered>
          <template #evaluateL="{ record }">
            <a-select
              v-model:value="record.evaluateL"
              :options="evaluateLOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
              allow-clear
              :disabled="!showOkBtn"
              @change="changeEvaluateL($event, record)"
            />
          </template>
          <template #evaluateE="{ record }">
            <a-select
              v-model:value="record.evaluateE"
              :options="evaluateEOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
              allow-clear
              :disabled="!showOkBtn"
              @change="changeEvaluateE($event, record)"
            />
          </template>
          <template #evaluateC="{ record }">
            <a-select
              v-model:value="record.evaluateC"
              :options="evaluateCOptions"
              label-field="departName"
              value-field="orgCode"
              placeholder="请选择"
              allow-clear
              :disabled="!showOkBtn"
              @change="changeEvaluateC($event, record)"
            />
          </template>
          <template #riskLevel="{ record }">
            <div
              style="color: #fff"
              :class="
                record.riskLevel === '1'
                  ? 'major'
                  : record.riskLevel === '2'
                  ? 'larger'
                  : record.riskLevel === '3'
                  ? 'generally'
                  : record.riskLevel === '4'
                  ? 'low'
                  : ''
              "
              >{{ record.riskLevel_dictText }}</div
            >
          </template>
        </a-table>
        <div><span class="evaluate" @click="handleRule">点击查看具体规则</span></div>
      </a-form-item>
      <div class="nav"> 改进措施</div>
      <a-form-item label="工程技术措施" name="improveGcjsMsr">
        <InputTextArea v-model:value="info.improveGcjsMsr" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="组织管理措施" name="improveZzglMsr">
        <InputTextArea v-model:value="info.improveZzglMsr" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="培训教育措施" name="improvePxjyMsr">
        <InputTextArea v-model:value="info.improvePxjyMsr" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="个人防护措施" name="improveGrfhMsr">
        <InputTextArea v-model:value="info.improveGrfhMsr" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
      <a-form-item label="应急处理措施" name="improveYjclMsr">
        <InputTextArea v-model:value="info.improveYjclMsr" placeholder="请输入" :disabled="!showOkBtn" autoSize :maxlength="300" />
      </a-form-item>
    </a-form>
  </BasicDrawer>
  <ruleDrawer @register="registerRuleDrawer" />
</template>
<script lang="ts" name="riskEvaluate-drawer" setup>
  const emit = defineEmits(['success']);
  import { BasicDrawer, useDrawerInner, useDrawer } from '/@/components/Drawer';
  import { ref, onMounted, watch } from 'vue';
  import ruleDrawer from './ruleDrawer.vue';
  import { JDictSelectTag } from '/@/components/Form';
  import { Input } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { add, edit, getDepart3ListWithSecurity, getDeptNew, getListAll, findDevice, findWork } from './url/index';
  import { getPointList } from '../riskPointManagement/url/index';
  const InputTextArea = Input.TextArea;
  const { createMessage } = useMessage();
  const [registerRuleDrawer, { openDrawer }] = useDrawer();
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const areaOptions: any = ref([]);
  const pointOptions: any = ref([]);
  const type = ref('add');
  const activeKey = ref('1');
  const evaluateLOptions = ref([
    {
      label: 10,
      value: 10,
    },
    {
      label: 6,
      value: 6,
    },
    {
      label: 3,
      value: 3,
    },
    {
      label: 1,
      value: 1,
    },
    {
      label: 0.5,
      value: 0.5,
    },
    {
      label: 0.2,
      value: 0.2,
    },
    {
      label: 0.1,
      value: 0.1,
    },
  ]);
  const evaluateEOptions = ref([
    {
      label: 10,
      value: 10,
    },
    {
      label: 6,
      value: 6,
    },
    {
      label: 3,
      value: 3,
    },
    {
      label: 2,
      value: 2,
    },
    {
      label: 1,
      value: 1,
    },
    {
      label: 0.5,
      value: 0.5,
    },
  ]);
  const evaluateCOptions = ref([
    {
      label: 100,
      value: 100,
    },
    {
      label: 40,
      value: 40,
    },
    {
      label: 15,
      value: 15,
    },
    {
      label: 7,
      value: 7,
    },
    {
      label: 2,
      value: 2,
    },
    {
      label: 1,
      value: 1,
    },
  ]);
  const info = ref({
    id: '',
    orgCode: undefined,
    departCode: undefined,
    recogId: undefined,
    pointId: undefined,
    checkItem: '',
    consequence: '',
    standard: '',
    workStep: '',
    dangerSource: '',
    accidentType: undefined,
    existingGcjsMsr: '',
    existingZzglMsr: '',
    existingPxjyMsr: '',
    existingGrfhMsr: '',
    existingYjclMsr: '',
    evaluate: [
      {
        evaluateL: undefined,
        evaluateE: undefined,
        evaluateC: undefined,
        evaluateD: undefined,
        riskLevel: '',
        controlLevel: '',
      },
    ],
    improveGcjsMsr: '',
    improveZzglMsr: '',
    improvePxjyMsr: '',
    improveGrfhMsr: '',
    improveYjclMsr: '',
    evaluateL: undefined,
    evaluateE: undefined,
    evaluateC: undefined,
    evaluateD: undefined,
    riskLevel: '',
    controlLevel: '',
  });
  const columns = [
    {
      title: 'L',
      dataIndex: 'evaluateL',
      align: 'center',
      width: 136,
      slots: { customRender: 'evaluateL' },
    },
    {
      title: 'E',
      dataIndex: 'evaluateE',
      align: 'center',
      width: 136,
      slots: { customRender: 'evaluateE' },
    },
    {
      title: 'C',
      dataIndex: 'evaluateC',
      align: 'center',
      width: 136,
      slots: { customRender: 'evaluateC' },
    },
    {
      title: 'D',
      dataIndex: 'evaluateD',
      align: 'center',
      width: 136,
    },
    {
      title: '评价级别',
      dataIndex: 'riskLevel',
      align: 'center',
      width: 108,
      slots: { customRender: 'riskLevel' },
    },
    {
      title: '管控层级',
      dataIndex: 'controlLevel',
      align: 'center',
      width: 260,
    },
  ];
  const infoForm = ref();
  watch(
    () => [info.value.orgCode, info.value.departCode, info.value.recogId, info.value.pointId, info.value.checkItem, info.value.consequence],
    async (v) => {
      if (v.every((item) => item)) {
        const obj = await findDevice({
          orgCode: info.value.orgCode,
          departCode: info.value.departCode,
          recogId: info.value.recogId,
          pointId: info.value.pointId,
          checkItem: info.value.checkItem,
          consequence: info.value.consequence,
        });
        if (obj) watchInfo(obj);
      }
    }
  );
  watch(
    () => [info.value.orgCode, info.value.departCode, info.value.recogId, info.value.pointId, info.value.workStep, info.value.dangerSource],
    async (v) => {
      if (v.every((item) => item)) {
        const obj = await findWork({
          orgCode: info.value.orgCode,
          departCode: info.value.departCode,
          recogId: info.value.recogId,
          pointId: info.value.pointId,
          workStep: info.value.workStep,
          dangerSource: info.value.dangerSource,
        });
        if (obj) watchInfo(obj);
      }
    }
  );
  const watchInfo = (obj) => {
    obj.evaluate = [
      {
        evaluateL: obj.evaluateL,
        evaluateE: obj.evaluateE,
        evaluateC: obj.evaluateC,
        evaluateD: obj.evaluateD,
        riskLevel: obj.riskLevel,
        controlLevel: obj.controlLevel,
        riskLevel_dictText: obj.riskLevel === '1' ? '重大风险' : obj.riskLevel === '2' ? '较大风险' : obj.riskLevel === '3' ? '一般风险' : '低风险',
      },
    ];
    obj.accidentType = obj.accidentType.split(',');
    obj.sourceId = obj.id;
    Object.assign(info.value, obj);
  };
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
          id: item.id,
        };
      });
    });
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    type.value = data.type;
    activeKey.value = data.activeKey;
    departOptions.value = [];
    areaOptions.value = [];
    areaOptions.value = [];
    pointOptions.value = [];
    await infoForm.value.resetFields();
    Object.assign(info.value, {
      id: '',
      orgCode: undefined,
      departCode: undefined,
      recogId: undefined,
      pointId: undefined,
      checkItem: '',
      consequence: '',
      standard: '',
      workStep: '',
      dangerSource: '',
      accidentType: undefined,
      existingGcjsMsr: '',
      existingZzglMsr: '',
      existingPxjyMsr: '',
      existingGrfhMsr: '',
      existingYjclMsr: '',
      evaluate: [
        {
          evaluateL: undefined,
          evaluateE: undefined,
          evaluateC: undefined,
          evaluateD: undefined,
          riskLevel: '',
          controlLevel: '',
        },
      ],
      improveGcjsMsr: '',
      improveZzglMsr: '',
      improvePxjyMsr: '',
      improveGrfhMsr: '',
      improveYjclMsr: '',
      evaluateL: undefined,
      evaluateE: undefined,
      evaluateC: undefined,
      evaluateD: undefined,
      riskLevel: '',
      controlLevel: '',
    });
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    if (data.type === 'add') {
      if (orgOptions.value?.length === 1) {
        info.value.orgCode = orgOptions.value[0]?.value;
        getDepartList(orgOptions.value[0]?.value);
      }
    }
    if (data.type !== 'add') {
      getDepartList(data.data.orgCode);
      getAreaList(data.data.departCode);
      getPoint(data.data.recogId);
      const obj = JSON.parse(JSON.stringify(data.data));
      //表单赋值
      obj.accidentType = obj.accidentType.split(',');
      obj.evaluate = [
        {
          evaluateL: obj.evaluateL,
          evaluateE: obj.evaluateE,
          evaluateC: obj.evaluateC,
          evaluateD: obj.evaluateD,
          riskLevel: obj.riskLevel,
          controlLevel: obj.controlLevel,
          riskLevel_dictText: obj.riskLevel === '1' ? '重大风险' : obj.riskLevel === '2' ? '较大风险' : obj.riskLevel === '3' ? '一般风险' : '低风险',
        },
      ];
      info.value.id = obj.id;
      Object.assign(info.value, obj);
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then((res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  // 辨识单位
  const getAreaList = (departCode) => {
    getListAll({ departCode }).then((res) => {
      if (res) {
        areaOptions.value = res.map((item: any) => {
          return {
            label: item.recogUnit,
            value: item.id,
          };
        });
      }
    });
  };
  // 风险点
  const getPoint = (recogId) => {
    getPointList({ type: activeKey.value, recogId }).then((res) => {
      if (res) {
        pointOptions.value = res.map((item) => {
          return {
            label: item.pointName,
            value: item.id,
          };
        });
      }
    });
  };
  const changeOrg = (value) => {
    info.value.departCode = undefined;
    info.value.recogId = undefined;
    info.value.pointId = undefined;
    departOptions.value = [];
    areaOptions.value = [];
    pointOptions.value = [];
    if (value) {
      getDepartList(value);
    }
  };
  const changeDepart = (value) => {
    info.value.recogId = undefined;
    info.value.pointId = undefined;
    pointOptions.value = [];
    areaOptions.value = [];
    if (value) {
      getAreaList(value);
    }
  };
  const changePoint = (value) => {
    info.value.pointId = undefined;
    pointOptions.value = [];
    if (value) {
      getPoint(value);
    }
  };
  const handleSubmit = async () => {
    try {
      const values = await infoForm.value.validate();
      if (!values.evaluate[0].evaluateL || values.evaluate[0].evaluateL === '') {
        return createMessage.info('风险评价L是必填项！');
      }
      if (!values.evaluate[0].evaluateE || values.evaluate[0].evaluateE === '') {
        return createMessage.info('风险评价E是必填项！');
      }
      if (!values.evaluate[0].evaluateC || values.evaluate[0].evaluateC === '') {
        return createMessage.info('风险评价C是必填项！');
      }
      if (!values.evaluate[0].evaluateD || values.evaluate[0].evaluateD === '') {
        return createMessage.info('风险评价D是必填项！');
      }
      const obj = JSON.parse(JSON.stringify(info.value));
      obj.evaluateL = obj.evaluate[0].evaluateL;
      obj.evaluateE = obj.evaluate[0].evaluateE;
      obj.evaluateC = obj.evaluate[0].evaluateC;
      obj.evaluateD = obj.evaluate[0].evaluateD;
      obj.riskLevel = obj.evaluate[0].riskLevel;
      obj.controlLevel = obj.evaluate[0].controlLevel;
      setDrawerProps({ confirmLoading: true });
      obj.accidentType = obj.accidentType.join(',');
      if (type.value === 'add') {
        obj.type = activeKey.value;
        delete obj.id;
        obj.specialFlag = '2';
        await add({ ...obj }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        obj.type = activeKey.value;
        obj.specialFlag = '2';
        await edit({ ...obj }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  const changeEvaluateL = (_value, record) => {
    initEvaluateD(record);
  };
  const changeEvaluateE = (_value, record) => {
    initEvaluateD(record);
  };
  const changeEvaluateC = (_value, record) => {
    initEvaluateD(record);
  };
  const multiply = (...numbers) => {
    if (numbers.length === 0) return 0;
    if (numbers.length === 1) return numbers[0];
    // 找出每个数的小数位数
    const getDecimalPlaces = (num) => {
      if (Math.floor(num) === num) return 0;
      const str = num.toString();
      const decimalIndex = str.indexOf('.');
      return decimalIndex >= 0 ? str.length - decimalIndex - 1 : 0;
    };
    // 计算总共需要放大多少倍（10 的幂）
    let totalScale = 1;
    let result = 1;

    for (const num of numbers) {
      const places = getDecimalPlaces(num);
      const scale = Math.pow(10, places);
      totalScale *= scale;
      result *= num * scale;
    }
    // 最终结果缩小回原比例
    return result / totalScale;
  };
  const initEvaluateD = (record) => {
    if (record.evaluateL && record.evaluateE && record.evaluateC) {
      const value = multiply(record.evaluateL, record.evaluateE, record.evaluateC);
      record.evaluateD = value;
      let riskLevel = '';
      let riskLevel_dictText = '';
      let controlLevel = '';
      if (value > 320) {
        riskLevel = '1';
        riskLevel_dictText = '重大风险';
        controlLevel = '厂部/车间/班组/岗位';
      } else if (value > 160) {
        riskLevel = '2';
        riskLevel_dictText = '较大风险';
        controlLevel = '车间/班组/岗位';
      } else if (value > 70) {
        riskLevel = '3';
        riskLevel_dictText = '一般风险';
        controlLevel = '班组/岗位';
      } else {
        riskLevel = '4';
        riskLevel_dictText = '低风险';
        controlLevel = '岗位';
      }
      record.riskLevel = riskLevel;
      record.riskLevel_dictText = riskLevel_dictText;
      record.controlLevel = controlLevel;
    } else {
      record.evaluateD = null;
      record.riskLevel = '';
      record.riskLevel_dictText = '';
      record.controlLevel = '';
    }
  };
  const handleRule = () => {
    openDrawer(true);
  };
</script>
<style lang="less" scoped>
  .major {
    background: rgb(200, 0, 22);
  }
  .larger {
    background: rgb(236, 115, 14);
  }
  .generally {
    background: rgb(220, 228, 15);
  }
  .low {
    background: rgb(29, 209, 255);
  }
  .evaluate {
    cursor: pointer;
    line-height: 40px;
    color: #1890ff;
    margin-top: 10px;
  }
  .nav {
    color: #1890ff;
    margin-bottom: 10px;
    font-size: 16px;
    margin-left: 40px;
  }
</style>
<style lang="less">
  .riskEvaluateDrawer {
    .ant-form {
      .label-item {
        .ant-form-item-label > label {
          overflow-wrap: break-word;
          white-space: normal;
          word-break: break-all;
          display: inline-block;
        }
      }
    }
  }
</style>
