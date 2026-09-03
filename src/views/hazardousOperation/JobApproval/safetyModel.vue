<template>
  <BasicModal v-bind="$attrs" okText="签字确认" :mask="false" @register="registerModal" width="80%" :maskClosable="false" @ok="handleSubmit">
    <template #title>
      <span style="width: 100%; display: inline-block; text-align: center">安全交底</span>
    </template>
    <div class="modal-body">
      <a-form ref="formRef" :rules="rule" :model="jiaodiFormState" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <table class="table-form" style="width: 100%">
          <tr>
            <td style="width: 120px">作业地点</td>
            <td style="text-align: left;">
              {{ jiaodiFormState.workLocation }}
            </td>
            <td style="width: 120px">作业时间</td>
            <td style="text-align: left;"> {{ jiaodiFormState.startTimeStr }} - {{ jiaodiFormState.endTimeStr }} </td>
          </tr>
          <tr>
            <td style="width: 120px">作业内容</td>
            <td style="text-align: left;"> {{ jiaodiFormState.workContent }}</td>
            <td style="width: 120px">作业类别</td>
            <td style="text-align: left;"> {{ getWorkName() }}</td>
          </tr>
          <tr>
            <td style="width: 120px">辨识单位</td>
            <td>
              <a-form-item>
                <a-tree-select
                  style="width: 190px"
                  v-model:value="jiaodiFormState.identifyUnit"
                  placeholder="请选择"
                  :tree-data="applicationUnitList"
                  showSearch
                  tree-node-filter-prop="title"
                  :field-names="{ label: 'title', value: 'key', children: 'children' }"
                /> </a-form-item
            ></td>
            <td style="width: 120px">辨识人</td>
            <td>
              <a-form-item> <JUserModal type="checkbox" v-model:value="jiaodiFormState.identifyPerson" placeholder="请选择" /> </a-form-item>
            </td>
          </tr>
          <tr>
            <td style="width: 120px">交底人</td>
            <td>
              <a-form-item>
                <JUserModal
                  disabled
                  style="width: 190px"
                  type="checkbox"
                  v-model:value="jiaodiFormState.sceneHead"
                  placeholder="请选择"
                /> </a-form-item
            ></td>
            <td style="width: 120px">交底时间</td>
            <td style="text-align: left;"> {{ jiaodiFormState.disclosureTime }}</td>
          </tr>
          <tr>
            <td style="width: 120px">作业负责人</td>
            <td>
              <a-form-item
                ><JUserModal
                  disabled
                  style="width: 190px"
                  type="checkbox"
                  v-model:value="jiaodiFormState.sceneHead"
                  placeholder="请选择"
                /> </a-form-item
            ></td>
            <td style="width: 120px">监护人</td>
            <td>
              <a-form-item>
                <JUserModal
                  disabled
                  style="width: 190px"
                  type="checkbox"
                  v-model:value="jiaodiFormState.workUnitGuardian"
                  placeholder="请选择"
                /> </a-form-item
            ></td>
          </tr>
          <tr>
            <td style="width: 120px">基本要求</td>
            <td colspan="3" style="text-align: left">
              作业前，属地单位车问负责人应对能工作业人员进行安全交底和风险告知内容包括作业及作业环境、作业风险、防范指施(工艺、设备、个体防护等)应急措施及其他注意事项。作业人员应按照风险告知内容，逐条对接确认，落实到位后方可作业。
            </td>
          </tr>
          <tr>
            <td rowspan="5" style="width: 120px">安全交底内容</td>
            <td colspan="3" style="text-align: left">
              <a-form-item label="使用主要设备工具"> <a-input v-model:value="jiaodiFormState.tool" placeholder="请输入" /> </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="4">
              <a-form-item label="可能导致的伤害类型及存在主要风险" :labelCol="{ style: { width: '250px' } }" name="damageType">
                <a-textarea autosize style="width: 100%" v-model:value="jiaodiFormState.damageType" placeholder="请输入" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: left">
              <a-form-item label="防范措施" name="measure">
                <a-textarea autosize v-model:value="jiaodiFormState.measure" placeholder="请输入" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: left">
              <a-form-item label="应急措施" name="emergencyMeasure">
                <a-textarea autosize v-model:value="jiaodiFormState.emergencyMeasure" placeholder="请输入" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="4" style="text-align: left">
              <a-form-item label="其他注意事项"> <a-textarea autosize v-model:value="jiaodiFormState.other" placeholder="请输入" /> </a-form-item>
            </td>
          </tr>
          <tr>
            <td>风险辨识情况及管控落实情况小结</td>
            <td colspan="3" style="text-align: left">
              <div>
                已开展全面风险辨识，共辨识作业风险<a-form-item name="identifyNumber">
                  <a-input style="width: 100px" placeholder="请输入" v-model:value="jiaodiFormState.identifyNumber" /> </a-form-item
                >项；管控据施已全部落实。
              </div>
            </td>
          </tr>
          <tr>
            <td>辨识时间</td>
            <td colspan="3" style="text-align: left">
              <div>
                自<a-form-item name="identifyStartTime"
                  ><a-date-picker
                    v-model:value="jiaodiFormState.identifyStartTime"
                    style="width: 190px"
                    show-time
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择"
                  /> </a-form-item
                >分始至<a-form-item name="identifyEndTime">
                  <a-date-picker
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    v-model:value="jiaodiFormState.identifyEndTime"
                    style="width: 190px"
                    show-time
                    placeholder="请选择"
                  /> </a-form-item
                >分止</div
              >
            </td>
          </tr>
          <tr>
            <td>风险及管控措施告知（被交底人签字）</td>
            <td colspan="3" style="text-align: left"> 我已熟知此次作业存在的安全风险及管控指施，将严格道章作业，确保安全。 </td>
          </tr>
          <tr>
            <td>上传附件</td>
            <td colspan="3" style="text-align: left"> <JUpload ref="uploadRef" :maxCount="1" v-model:value="jiaodiFormState.annexUrl" text="上传附件" /> </td>
          </tr>
        </table>
      </a-form>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getWorkSecurityMeasuresByType } from '../api';
  import { useUserStore } from '/@/store/modules/user';
  import { getEduOrgList } from '/@/api/common/api';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  import { ref } from 'vue';

  const applicationUnitList = ref<any[]>([]);
  const userStore = useUserStore();
  const formState = ref<any>({ content: '' });
  const jiaodiFormState = ref<any>({
    workLocation: '',
    workContent: '',
    workType: '',
    startTimeStr: '',
    endTimeStr: '',
    identifyUnit: userStore.getUserInfo.orgCode, // 辨识单位
    identifyPerson: userStore.getUserInfo.id, // 辨识人
    sceneHead: '', // 作业负责人 交底人
    disclosureTime: '', // 交底时间
    workUnitGuardian: '', // 监护人
    tool: '', // 工具
    damageType: '', // 可能导致的伤害类型
    risk: '', // 存在主要风险
    measure: '', // 防范措施
    emergencyMeasure: '', // 应急措施
    other: '', // 其他注意事项
    identifyStartTime: '', // 辨识时间始
    identifyEndTime: '', // 辨识时间止
    identifyNumber: '', // 辨识数量
  });

  const emergencyMeasures = {
    1: '发生中毒或窒息等事故时，监护人员禁止盲目进入，立即上报领导，并拨打急救电话 19933178120，效援时，戴好空气呼吸器，迅速将人员转移到空气流通的地方，进行心肺复苏急救。',
    2: '发生事故现场人员立即撤离危险区，立即采取可靠措施，在保证抢救人员安全的前提下，迅速将患者救出危险区域，判断受害者的受害程度，对存在外伤流血或骨折的进行应急止血包扎及固定，发生事故尽快通知用人单位作业负责人并拨打急救电话:19933178120。',
    3: '发生触电或者灼伤现场人员大声呼叫，并拨打安全环保部门电话19933178120，再迅速查看人员受伤情况，首先确保呼吸顺畅，不能随意搬动伤者，等待救援'
  }
  
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    console.log('data:', data);
    let res = await getWorkSecurityMeasuresByType({ workType: data.workType });
    Object.assign(formState.value, data);
    formState.value.hazardFactors = data.possibleDanger.toString();
    Object.keys(jiaodiFormState.value).forEach((key) => {
      if(data[key]){
        jiaodiFormState.value[key] = data[key];
      }
    });
    jiaodiFormState.value.damageType = data.possibleDanger
    jiaodiFormState.value.risk = data.possibleDanger
    let measures:string[] = [];
    res.forEach((item) => {
      if(data.securityMeasuresIds.split(',').includes(item.sort)){
        measures.push(item.sort + '、' + item.name);
      }
    });

    // jiaodiFormState.value.measure = jiaodiFormState.value.measure.substring(0, jiaodiFormState.value.measure.length - 1);
    if(data.otherSecurityMeasures) measures.push('其他安全措施：、' + data.otherSecurityMeasures);
    if(data.otherWorkApply && data.otherWorkApply.length > 0){
      jiaodiFormState.value.measure = jiaodiFormState.value.measure + '\n'
      data.otherWorkApply.forEach(async (item) => { 
        jiaodiFormState.value.damageType += ','+item.possibleDanger
        let res = await getWorkSecurityMeasuresByType({ workType: item.workType });
        res.forEach((citem) => {
          if(item.securityMeasuresIds.split(',').includes(citem.sort)){
            measures.push(citem.sort + '、' + citem.name);
          }
        });
        jiaodiFormState.value.measure = [...new Set(measures)].join('\n')
      });
      // 风险辨识拼接去重
      jiaodiFormState.value.damageType = [...new Set(jiaodiFormState.value.damageType.split(',').filter(i => !!i))].join(',')
    } else {
      jiaodiFormState.value.measure = [...new Set(measures)].join('\n')
      jiaodiFormState.value.damageType = jiaodiFormState.value.damageType.split(',').filter(i => !!i).join(',')
    }
    
    if(emergencyMeasures[data.workType]) jiaodiFormState.value.emergencyMeasure = emergencyMeasures[data.workType];
    if(data.otherWorkApply){
      if(jiaodiFormState.value.emergencyMeasure) {
        jiaodiFormState.value.emergencyMeasure += ';\n'
      }
      jiaodiFormState.value.emergencyMeasure += data.otherWorkApply.map((item) => {
        let str = emergencyMeasures[item.workType] ? emergencyMeasures[item.workType] : ''
        return str +';\n'
      });
    }
    jiaodiFormState.value.disclosureTime = formatTime();
  });
  
  const rule = {
    identifyStartTime: [{ required: true, message: '请选择', trigger: 'change' }],
    identifyEndTime: [{ required: true, message: '请选择', trigger: 'change' }],
    identifyNumber: [{ required: true, message: '请输入', trigger: 'change' }],
    measure: [{ required: true, message: '请输入', trigger: 'change' }],
    damageType: [{ required: true, message: '请输入', trigger: 'change' }],
    emergencyMeasure: [{ required: true, message: '请输入', trigger: 'change' }],
  };
  const formRef = ref<any>();
  const emit = defineEmits(['submit']);

  const handleSubmit = async () => {
    await formRef.value.validate();
    formState.value.safetyDisclosureContent = jiaodiFormState.value;
    emit('submit', formState);
    closeModal()
  };
  const getWorkName = () => {
    let name = '';
    userStore.getAllDictItems.work_type.forEach((item) => {
      if (item.value == formState.value.workType) {
        name += item.label + ',';
      }
      if (formState.value.otherWorkApply && formState.value.otherWorkApply.length > 0) {
        formState.value.otherWorkApply.forEach((citem) => {
          if (item.value == citem.workType) {
            name += item.label + ',';
          }
        });
      }
    });
    return name.substring(0, name.length - 1);
  };
  const init = async () => {
    const res = await getEduOrgList({ level: 4 });
    applicationUnitList.value = splitDeptNames(res, '敬业');
  };
  init();
  function splitDeptNames(arr, name) {
    arr.forEach((item) => {
      if (item.key.length < 10) item.selectable = false;
      if (item.children) {
        splitDeptNames(item.children, item.title);
      }
      if (item.key.length == 12) {
        item.title = name + '-' + item.title;
      }
    });
    return arr;
  }
  // 格式化返回当前时间 年月日 时分秒 YYYY-MM-DD HH:mm:ss
  function formatTime() {
    return dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  }
</script>

<style scoped lang="less">
  .modal-body {
    height: 70vh;
    overflow-y: auto;
  }
  .table-form {
    border: 1px solid #e5e7eb;
    border-collapse: collapse;
    text-align: center;
    tr {
      height: 40px;
      td:nth-child(1),
      td:nth-child(3) {
        width: 260px;
      }
    }
    td {
      padding: 10px;
      border: 1px solid #e5e7eb;
      div {
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
    :deep(.ant-row) {
    }
    :deep(.ant-input) {
      border-top: none;
      border-left: none;
      border-right: none;
    }
    :deep(.ant-input:focus) {
      border-top: none;
      border-left: none;
      border-right: none;
      box-shadow: none;
    }
  }
</style>
