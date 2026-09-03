<template>
  <a-form
    ref="formRef"
    :model="formState"
    v-loading="loading"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    :rules="formRules"
    labelWrap
  >
    <a-row :gutter="12">
      <a-col :span="24">
        <div class="step-wrap">
          <a-steps labelPlacement="vertical" size="small">
            <a-step
              v-for="item in formState.workExamineNodeList"
              :key="item.sort"
              :status="item.state == '0' ? 'finish' : item.state == '1' ? 'error' : item.state == '' ? 'wait' : 'wait'"
            >
              <template #title>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.node }}</span>
              </template>
              <template #subTitle>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeOperator }}</span>
              </template>
              <template #description>
                <span :style="{ color: item.state == '0' ? 'blue' : '' }">{{ item.nodeTime }}</span>
              </template>
            </a-step>
          </a-steps>
        </div>
      </a-col>

      <a-col :span="12" v-if="workIndex == 0">
        <a-form-item label="作业内容" :colon="false" name="workContent">
          <my-input :type="readonly ? 'readonly' : 'input'" placeholder="请输入" :max-length="300" v-model="formState.workContent" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="workIndex == 0 && !unhazardousWork">
        <a-form-item label="高危作业等级" :colon="false" name="highWorkLevel">
          <a-select
            :disabled="readonly"
            v-model:value="formState.highWorkLevel"
            :options="levelList"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业类型" :colon="false" name="workType">
          <a-select
            :disabled="readonly"
            v-model:value="formState.workType"
            :options="formState.workTypeList"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="布控球" name="ballCameraCode">
          <a-input v-model:value="formState.ballCameraName" disabled />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请单位" :colon="false" name="applicationUnit">
          <a-tree-select
            disabled
            v-model:value="formState.applicationUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="申请人" :colon="false" name="applicant">
          <a-input v-model:value="formState.applicantName" disabled />
          <a-input type="hidden" v-model:value="formState.applicant" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="unhazardousWork">
        <a-form-item label="生产单位" :colon="false" name="workOrgCode">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.workOrgCode"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '1'">
        <a-form-item label="作业高度(m)" :colon="false" name="workHeight">
          <a-input disabled placeholder="请输入" :max-length="3" v-model:value="formState.workHeight" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '4'">
        <a-form-item label=" 起吊物重量(t)" :colon="false" name="hoistingWeight">
          <a-input placeholder="请输入" disabled :max-length="4" v-model:value="formState.hoistingWeight" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="['1', '3', '4'].includes(formState.workType as string)">
        <a-form-item label="作业等级" :colon="false" name="workGrade">
          <a-select
            :disabled="readonly"
            v-model:value="formState.workGrade"
            :options="workGradeList[formState.workType]"
            :field-names="{ label: 'label', value: 'value' }"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="所属单位" :colon="false" name="affiliation">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.affiliation"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="作业单位" name="workUnit">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.workUnit"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="departName"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="生产单位" :colon="false" name="workOrgCode">
          <a-tree-select
            :disabled="readonly"
            v-model:value="formState.workOrgCode"
            placeholder="请选择"
            :tree-data="applicationUnitList"
            showSearch
            tree-node-filter-prop="title"
            :field-names="{ label: 'title', value: 'key', children: 'children' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业地点" name="workLocation">
          <a-input disabled type="input" :max-length="100" v-model:value="formState.workLocation" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="unhazardousWork">
        <a-col :span="12">
          <a-form-item label="是否管修分离" name="cardFlag">
            <a-radio-group disabled v-model:value="formState.cardFlag">
              <a-radio value="1">是</a-radio>
              <a-radio value="2">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="formState.cardFlag == '1'">
          <a-form-item label="维修事业部作业负责人" name="compiler">
            <JUserModal disabled type="checkbox" v-model:value="formState.compiler" placeholder="请选择" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="岗位工"  name="postWorker">
            <JUserModal disabled type="checkbox" v-model:value="formState.postWorker" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <template v-if="formState.workType == '5'">
        <a-col :span="12">
          <a-form-item label="电源接入点"  name="powerPoint">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.powerPoint" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工作电压"  name="operatingVoltage">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.operatingVoltage" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用电设备功率"  name="consumerInfo">
            <a-input disabled type="input" :max-length="100" v-model:value="formState.consumerInfo" placeholder="请输入" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="有限空间名称" name="limitSpaceCode">
          <a-select
            placeholder="请选择"
            :show-arrow="false"
            v-model:value="formState.limitSpaceCode"
            showSearch
            :options="limitSpaceName"
            :filterOption="(input, option) => option.name.includes(input) || option.code.includes(input)"
            :field-names="{ label: 'label', value: 'code', options: 'children' }"
            :disabled="readonly"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="原有介质" name="limitSpaceOriginalMedium">
          <a-input type="input" disabled :maxLength="100" v-model:value="formState.limitSpaceOriginalMedium" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业负责人" name="sceneHead">
          <JUserModal disabled type="checkbox" v-model:value="formState.sceneHead" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="救援人员" name="rescuers">
          <JUserModal disabled type="checkbox" v-model:value="formState.rescuers" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业人员" name="operatorName">
          <a-input :disabled="readonly" readonly placeholder="请选择" v-model:value="formState.operatorName" @click="showSelectPerson" />
        </a-form-item>
        <a-form-item v-show="false" label="作业人员" name="operator">
          <a-input disabled placeholder="请选择" v-model:value="formState.operator" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '3'">
        <a-form-item label="作业证号" name="workIdNo">
          <a-input disabled readonly placeholder="请选择" v-model:value="formState.workIdNo" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="监护人" name="workUnitGuardian">
          <JUserModal disabled type="checkbox" v-model:value="formState.workUnitGuardian" placeholder="请选择" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="!unhazardousWork">
        <a-form-item label="安全措施确认人" :colon="false" name="securityMeasuresUser">
          <JUserModal
            disabled
            type="checkbox"
            v-model:value="formState.securityMeasuresUser"
            placeholder="请选择"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="作业时间" :colon="false" name="start">
          <a-range-picker
            v-model:value="formState.start"
            :placeholder="['年 月 日 时 分', '年 月 日 时 分']"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="readonly"
          >
            <template #separator>至</template>
            <template #suffixIcon></template>
          </a-range-picker>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '2'">
        <a-form-item label="四合一气体检测仪" :colon="false" name="applicationUnit">
          <a-input disabled type="input" :maxLength="100" v-model:value="formState.gasDetectorsName" placeholder="请输入" />
          <!-- <a-select
            disabled
            v-model:value="formState.applicationUnit"
            :options="applicantCompany"
            :field-names="{ label: 'departName', value: 'orgCode', options: '' }"
            placeholder="请选择"
          /> -->
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '3'">
        <a-form-item label="是否需要分析" :colon="false" name="cardFlag">
          <a-radio-group disabled v-model:value="formState.cardFlag">
            <a-radio value="1">是</a-radio>
            <a-radio value="2">否</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="formState.workType == '4'">
        <a-form-item label="吊车车牌号" :colon="false" name="hoistingCode">
          <a-input disabled type="input" :maxLength="100" v-model:value="formState.hoistingCode" placeholder="请输入" />
        </a-form-item>
      </a-col>
      <template v-if="formState.workType == '4'">
        <a-col :span="12">
          <a-form-item label="特殊工种作业证号" :colon="false" name="hoistingIdNumber">
            <a-input disabled readonly placeholder="请选择" v-model:value="formState.hoistingIdNumber" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="司索指挥人" :colon="false" name="commanderPriest">
            <JUserModal disabled type="checkbox" v-model:value="formState.commanderPriest" placeholder="请选择" />
          </a-form-item>
        </a-col>
      </template>
      <a-col :span="12" v-if="formState.workType == '5'">
        <a-form-item label="电工证号" :colon="false" name="operatorName">
          <a-input disabled readonly placeholder="请选择" v-model:value="formState.operator" @click="showSelectPerson" />
        </a-form-item>
        <a-form-item v-show="false" label="电工证号" :colon="false" name="operator">
          <a-input disabled placeholder="请选择" v-model:value="formState.operator" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="高危作业施工方案" :colon="false" name="annexUrl">
          <JUpload ref="uploadRef" disabled :maxCount="5" v-model:value="formState.annexUrl" text="上传附件" />
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="!['6', '7'].includes(formState.workType) && possibleDangerList && possibleDangerList.length > 0">
        <a-form-item label="风险辨识" :labelCol="{ span: 4 }" :wrapper-col="{ span: 20 }" :colon="false" name="possibleDanger">
          <a-checkbox-group @change="possibleChange" v-model:value="formState.possibleDanger" :options="getPossibleDangerList(formState.applicationTimeStr)" />
          <a-form-item
            name="possibleDangerInput"
            v-if="formState.possibleDanger.includes('其他伤害')"
            style="margin-top: 15px"
            :rules="{
              validator: otherTxtvalidator,
              message: '请输入',
            }"
          >
            <a-input
              type="input"
              v-model:value="formState.possibleDangerInput"
              :max-length="50"
              placeholder="请输入"
            />
          </a-form-item>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item label="安全措施" :labelCol="{ span: 4 }" :wrapper-col="{ flex: 1, offset: 3 }" :colon="false" name="securityMeasuresIds">
          <a-table
            :columns="colum"
            :dataSource="formState.securityMeasuresIdList"
            :pagination="false"
            rowKey="sort"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.securityMeasuresIds,
              fixed: false,
              onChange: checkChange,
              getCheckboxProps: () => {
                return disabled ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex == 'id'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex == 'annex'">
                <a-form-item
                  v-if="formState.securityMeasuresIds.includes(record.sort)"
                  :rules="[{ required: true, message: '请上传附件' }]"
                  :name="['securityMeasuresIdList', index, 'annex']"
                >
                  <JUpload :maxCount="10" v-model:value="record.annex" text="上传附件" />
                </a-form-item>
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item
          label="其他安全措施"
          :labelCol="{ span: 4, offset: 1 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          :title="formState.otherSecurityMeasures + otherSecurityMeasures"
          name="otherSecurityMeasures"
        >
          <div class="text-raea">
            {{ formState.otherSecurityMeasures }}
            <a-input
              style="width: 500px; margin: 0"
              placeholder="请输入补充其他安全措施"
              :disabled="disabled"
              v-model:value="otherSecurityMeasures"
            />
          </div>
        </a-form-item>
        <a-form-item
          v-if="formState.otherSecurityMeasures || otherSecurityMeasures"
          label="其他安全措施附件"
          :labelCol="{ span: 4, offset: 1 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          :rules="[{ required: formState.otherSecurityMeasures || otherSecurityMeasures, message: '请上传附件' }]"
          name="otherSecurityMeasuresAnnex"
        >
          <JUpload  :maxCount="10" v-model:value="formState.otherSecurityMeasuresAnnex" text="上传附件" />
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="['6', '7'].includes(formState.workType as string) && formState.protectiveEquipment && formState.protectiveEquipment.length > 0">
        <a-form-item
          label="现场防护设施准备情况"
          :labelCol="{ span: 4 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          name="securityMeasuresIds"
        >
          <a-table
            :columns="colum2"
            :dataSource="formState.protectiveEquipment"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.protectiveEquipment.map((item) => item.selected == 1 ? item.index : ''),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'count'">
                <a-input v-model:value="record.count" />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
      <a-col :span="24" v-if="['6', '7'].includes(formState.workType as string) && formState.procedure && formState.procedure.length > 0">
        <a-form-item
          label="操作步骤"
          :labelCol="{ span: 4 }"
          :wrapper-col="{ flex: 1, offset: 3 }"
          :colon="false"
          name="procedureIds"
        >
          <a-table
            v-if="formState.workType == '6'"
            :columns="colum3"
            :dataSource="dataSauce3"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.procedure.map((item) => item.selected == 1 ? item.index : ''),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
          <a-table
            v-if="formState.workType == '7'"
            :columns="colum3"
            :dataSource="dataSauce4"
            :pagination="false"
            rowKey="index"
            bordered
            :row-selection="{
              columnTitle: '是否涉及',
              columnWidth: 100,
              selectedRowKeys: formState.procedure.map((item) => item.selected == 1 ? item.index : ''),
              fixed: false,
              getCheckboxProps: () => {
                return readonly ? { disabled: true } : {};
              },
            }"
          >
            <template #bodyCell="{ column, index, record }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup lang="ts">
  import { Ref, computed, inject, reactive, ref, watch } from 'vue';
  import { getJobType, getLimitSpace, getWorkSecurityMeasuresByType } from '../api';
  import MyInput from '../components/MyInput.vue';
  import type { selectOption } from '../type';
  import { Rule } from '/@/components/Form';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { JUserModal } from '/@/components/Form';
  import { useContent } from '/@/views/hazardousOperation/workRequisition/hooks/useContent';
  import { usePublicData } from '/@/views/hazardousOperation/workRequisition/hooks/usePublicData';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const unhazardousWork = computed(() => ['UnhazardousWork-jobManagement', 'UnhazardousWork-JobApproval'].includes(route.name));
  const prop = withDefaults(
    defineProps<{
      readonly: boolean;
      value: string;
      formState: any;
      workIndex: number;
    }>(),
    {
      readonly: false,
      workIndex: 0,
      formState: {},
    }
  );

  const formRef = ref();
  const loading = ref(false);
  let applicantCompany = ref<selectOption[]>([]);
  let otherWorkList = reactive<selectOption[]>([]);
  let readOnly = inject<Ref<boolean>>('readOnly') as Ref<boolean>;

  let formRules = inject<Ref<Record<string, Rule[]>>>('formRules') as Ref<Record<string, Rule[]>>;
  const disabled = ref(readOnly.value);

  let limitSpaceName = ref<selectOption[]>([]);

  // 补充其他安全措施
  const otherSecurityMeasures = ref('');
  // const otherSecurityMeasuresChange = (e) => {
  //   prop.formState.otherSecurityMeasures += e.target.value;
  // };

  const { levelList, workGradeList, colum, colum0, colum2, colum3, possibleDangerList, getPossibleDangerList, dataSauce3, dataSauce4 } = usePublicData();

  const applicationUnitList = ref<any[]>([]);
  const init = async () => {
    const { applicationUnitList: list } = await useContent();
    applicationUnitList.value = list.value;
    if (!prop.formState.workType) return;
    if (!prop.formState.securityMeasuresIdList || prop.formState.securityMeasuresIdList.length == 0) {
      prop.formState.securityMeasuresIdList = await getWorkSecurityMeasuresByType({ workType: prop.formState.workType });
    }
    const res = await getLimitSpace({ orgCode: prop.formState.applicationUnit });
    limitSpaceName.value = res.map((v) => {
      return { label: `${v.name} (${v.code})`, value: v.code, ...v };
    });
  };
  init();
  //获取会涉及的其他作业
  getJobType().then((res) => {
    otherWorkList.push(...res, { value: '0', label: '无' });
  });
  //危险辨识
  const possibleDangerInput = computed({
    get: () => {
      return prop.formState.possibleDangers || '';
    },
    set: (value: string) => {
      //@ts-ignore
      prop.formState.possibleDangers = value;
      prop.formState.possibleDanger = prop.formState.possibleDanger || [];
      if (value !== '') {
        if (prop.formState.possibleDanger.includes('其他伤害')) {
        } else {
          //@ts-ignore
          prop.formState.possibleDanger.push('其他伤害');
        }
      } else {
        if (prop.formState.possibleDanger.includes('其他伤害')) {
          //@ts-ignore
          prop.formState.possibleDanger.splice(
            //@ts-ignore
            prop.formState.possibleDanger.findIndex((item) => item === '其他伤害'),
            1
          );
        }
      }
    },
  });

  const otherTxtvalidator = async (_rule: Rule, value: string) => {
    if (!value && prop.formState.possibleDanger.includes('其他伤害')) {
      return Promise.reject('请输入其他伤害');
    } else {
      return Promise.resolve();
    }
  };
  const possibleChange = (value: any) => {
    if (!value.includes('其他伤害') && possibleDangerInput.value) {
      possibleDangerInput.value = '';
    }
  };

  //安全措施
  const checkChange = (selectedRowKeys: any, val: any) => {
    prop.formState.securityMeasuresIds = selectedRowKeys;
    val.forEach((item) => {
      item.selected = 0;
    });
    // prop.formState.securityMeasuresIdList = val;
  };
  //回填安全措施19条
  // watch(
  //   () => prop.formState.hoistingWeight,
  //   (value) => {
  //     if (value !== undefined) {
  //       securityMeasuresIdList.value = securityMeasuresIdList.value.map((item, index) => {
  //         if (index == 18) {
  //           //@ts-ignore
  //           let str = item.name.split('t');
  //           return {
  //             ...item,
  //             name: `${str[0].replace(/\d/g, '')}${value}t${str[1]}`,
  //           };
  //         }
  //         return item;
  //       });
  //     }
  //   },
  //   { deep: true }
  // );

  // 标记点位

  //表单重置
  const reset = () => {
    formRef.value.resetFields();
  };
  //审批退回

  const submit = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        .validate()
        .then(() => {
          if(otherSecurityMeasures.value){
            if(prop.formState.otherSecurityMeasures) {
              prop.formState.otherSecurityMeasures += otherSecurityMeasures.value;
            } else {
              prop.formState.otherSecurityMeasures = otherSecurityMeasures.value;
            }
          }
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  };

  //暴露方法
  defineExpose({
    //重置表单
    reset,
    //回填表单
    init,
    submit,
  });
</script>

<style scoped lang="less">
  .my-form-item {
    margin: 0 !important;
  }
  .step-wrap {
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
  }
  .text-raea {
    vertical-align: middle;
    input {
      width: 120px;
      height: 32px;
      margin: 0 10px;
    }
  }
  .visitsList {
    > div {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .k {
      display: inline-block;
      height: 38px;
      width: 280px;
      border: 1px solid #ccc;
      line-height: 36px;
      padding-left: 15px;
      &:nth-child(2) {
        margin-left: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
</style>
