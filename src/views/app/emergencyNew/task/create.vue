<template>
  <div class="plan-detail">
    <van-collapse v-model="activeNames">
      <van-collapse-item title="演练信息" name="1">
        <van-field readonly v-model="detailInfo.orgCode" label="演练单位" />
        <van-field readonly v-model="detailInfo.rehearsalContent" label="演练内容" />
        <van-field readonly v-model="detailInfo.rehearsalLocation" label="演练地点" />
        <van-field readonly v-model="detailInfo.rehearsalType" label="演练方式" />
        <van-field readonly v-model="detailInfo.enforceDate" label="实施时间" />
        <van-field readonly v-model="detailInfo.personNum" label="参演人数" />
        <van-field readonly v-model="detailInfo.remark" label="备注" />
      </van-collapse-item>
      <van-collapse-item title="演练记录" name="2">
        <van-form ref="formRef" label-align="top">
          <template v-if="title == '演练方案'">
            <van-field required v-model="formState.drillScheme" label="1、演练方案" :rules="[{ required: true, message: '请上传' }]">
              <template #input>
                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10" v-model:fileList="formState.drillScheme" />
              </template>
            </van-field>
            <van-field required label="2、演练应急预案" name="drillEmergencyPlan" :rules="[{ required: true, message: '请上传' }]">
              <template #input>
                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10" v-model:fileList="formState.drillEmergencyPlan" />
              </template>
            </van-field>
            <van-field required label="3、演练脚本" name="drillScript" :rules="[{ required: true, message: '请上传' }]">
              <template #input>
                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10" v-model:fileList="formState.drillScript" />
              </template>
            </van-field>
          </template>
          <template v-if="['影像资料'].includes(title)">
            <van-field required label="7、演练影像资料" name="drillVideoData" :rules="[{ required: true, message: '请上传' }]">
              <template #input>
                <AppCustomizeUpload accept=".jpg,.png,.mp4,.jpeg" :max-count="10" v-model:fileList="formState.drillVideoData" />
              </template>
            </van-field>
          </template>
          <template v-if="['动员培训'].includes(title)">
            <van-field
              required
              label="学习内容"
              v-model="formState.trainContent"
              name="trainContent"
              type="textarea"
              :maxlength="500"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入' }]"
            >
            </van-field>
          </template>
          <template v-if="title == '演练记录'">
            <van-field
              name="purpose1"
              v-model="formState.purpose1"
              label="演练目的"
              required
              placeholder="请输入"
              type="textarea"
              maxlength="200"
              rows="1"
              autosize
              :rules="[{ required: true, message: '请输入' }]"
            >
              <template #button>
                <van-button size="mini" @click="openModal('md', '演练目的填写模板')" type="primary">填写模板</van-button>
              </template>
            </van-field>
            <van-field
              v-model="formState.record1"
              name="record1"
              label="演练记录"
              required
              placeholder="请输入"
              type="textarea"
              maxlength="200"
              rows="1"
              autosize
              :rules="[{ required: true, message: '请输入' }]"
            >
              <template #button>
                <van-button size="mini" @click="openModal('jl', '演练记录填写模板')" type="primary">填写模板</van-button>
              </template>
            </van-field>
            <van-field
              name="rescue1"
              v-model="formState.rescue1"
              label-align="top"
              placeholder="请选择"
              type="textarea"
              maxlength="200"
              rows="1"
              autosize
              label="现场救援讲评"
              input-align="left"
              required
              :rules="[{ required: true, message: '请输入' }]"
            >
              <template #button>
                <van-button size="mini" @click="openModal('jp', '现场救援讲评填写模板')" type="primary">填写模板</van-button>
              </template>
            </van-field>
            <div class="tit">评估报告</div>
            <JUserModal
                type="checkbox"
                :elInfo="{ type: 'vant', attr: { label: '评审人', required: true, rules: [{ required: true, message: '请选择评估人' }] } }"
                v-model:value="formState.reviewer"
            />
            
            <JUserModal
                type="checkbox"
                :elInfo="{ type: 'vant', attr: { label: '批准人', required: true, rules: [{ required: true, message: '请选择批准人' }] } }"
                v-model:value="formState.approver"
            />
            <van-field
              required
              v-model="formState.aqb"
              label="安全部审批人"
              readonly
              placeholder="请输入"
            />
            <van-field
              required
              :rules="[{ required: true, message: '请输入' }]"
              v-model="formState.reviewPlace"
              label="评审地点"
              placeholder="请输入"
            />
            <van-field
              v-model="formState.reviewContent1"
              name="reviewContent1"
              label-align="top"
              placeholder="请选择"
              label="评审内容"
              type="textarea"
              maxlength="200"
              rows="1"
              autosize
              input-align="left"
              required
              :rules="[{ required: true, message: '请选择' }]"
            >
              <template #button>
                <van-button size="mini" @click="openModal('nr', '评审内容填写模板')" type="primary">填写模板</van-button>
              </template>
            </van-field>
            <van-field
              required
              label="评审过程"
              v-model="formState.reviewProcess"
              name="reviewProcess"
              type="textarea"
              :maxlength="500"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入' }]"
            >
            </van-field>
            <van-field
              required
              label="评审结论"
              v-model="formState.reviewResult"
              name="reviewResult"
              type="textarea"
              :maxlength="500"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入' }]"
            >
            </van-field>
            <div class="tit">演练评价表</div>
            <van-field
              v-for="item in pingkjia"
              :name="item.key"
              label-align="top"
              placeholder="请选择"
              readonly
              :label="item.text"
              input-align="left"
              required
              :rules="[{ required: true, message: '请选择' }]"
            >
              <template #input>
                <van-radio-group v-model="formState[item.key]" shape="square" direction="horizontal">
                  <template v-for="(citem, idx) in item.items" :key="idx">
                    <div class="othertext aling-top">
                      <van-radio icon-size="15px" :name="citem">{{ citem }}</van-radio>
                    </div>
                  </template>
                </van-radio-group>
              </template>
            </van-field>
          </template>
          <template v-if="title == '演练总结'">
            <van-field required :labelCol="{ span: 5 }" label="5、演练总结" name="drillSummary" :rules="[{ required: true, message: '请上传' }]">
              <template #input>
                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :maxCount="10" v-model:fileList="formState.drillSummary" />
              </template>
            </van-field>
            <van-field
              required
              :labelCol="{ span: 5 }"
              label="6、演练存在不足之处整改落实情况"
              name="drillCorrective"
              :rules="[{ required: true, message: '请上传' }]"
            >
              <template #input>
                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :maxCount="10" v-model:fileList="formState.drillCorrective" />
              </template>
            </van-field>
          </template>
        </van-form>
      </van-collapse-item>
    </van-collapse>

    <div class="foot">
      <van-button size="small" @click="cancel">取消</van-button>
      <van-button size="small" type="primary" :loading="submitIng" @click="submit">确认</van-button>
    </div>
  </div>
  
  <a-modal v-model:visible="visible" :width="800" :title="fillTitle" @cancel="() => (visible = false)" class="template-modal" :footer="null">
    <div class="template-content">
      <div v-for="(item, index) in fillData" :key="index" class="template-item">
        <div class="template-text">{{ item }}</div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
  import { taskDetail, videoData, drillScheme, trainContent, drillRecord, drillSummary } from '/@/views/emergencyNew/api';
  import { useData } from '/@/views/emergencyNew/task/hooks/useData';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { computed, ref, onMounted } from 'vue';
  import { FormInstance } from 'vant';
  const detailInfo = ref<any>({});
  const route = useRoute();
  const router = useRouter();
  const activeNames = ref(['1', '2']);
  const visible = ref(false);
  const fillTitle = ref('');
  const fillData = ref([]);

  const formRef = ref<FormInstance | null>(null);
  const formState = ref<any>({
    purpose: [],
    record: [],
    rescue: [],
    reviewContent: [],
    personArrival: [],
    workMaterial: [],
    personalProtection: [],
    overallOrganization: [],
    organizationDivision: [],
    practicalEffect: [],
    reportSuperior: [],
    safetyDepartment: [],
    rescueEffect: [],
    alertCooperation: [],
    drillSummary: '',
    drillCorrective: '',
    aqb: '应急演练安全部审批人'
  });
  const title = computed(() => route.query.title);
  const { fillTemplate, pingkjia } = useData();
  const pageInit = async () => {
    formState.value.id = route.query.id;
    let res = await taskDetail(route.query.id);
    if (res.annex) {
      res.annex = JSON.parse(res.annex).toString();
    }
    detailInfo.value = res;
    if (title.value == '演练记录') {
      Object.assign(formState.value, {
        personArrival: '迅速准确、按时到位',
        workMaterial: '充分、有效',
        personalProtection: '防护到位',
        overallOrganization: '准确、高效、满足要求',
        organizationDivision: '安全、快速',
        practicalEffect: '达到预期目标',
        reportSuperior: '报告及时',
        safetyDepartment: '按要求协作',
        rescueEffect: '按要求协作',
        alertCooperation: '按要求配合',
      });
      if(res.approvalStatus == 2) {
        const jsonObject = JSON.parse(<string>sessionStorage.getItem('drillId'))
        Object.assign(formState.value, jsonObject)
        let keys = ['purpose', 'record', 'rescue'];
        keys.map((k) => {
          if (jsonObject[k]) {
            formState.value[k+'1'] = jsonObject[k][0]
            formState.value[k] = [];
          }
        });
        if (jsonObject.reviewContent) {
          formState.value.reviewContent1 = jsonObject.reviewContent[0].content
          formState.value.reviewContent = []
        }
        let key2 = ['personArrival', 'workMaterial', 'personalProtection', 'overallOrganization', 'organizationDivision', 'practicalEffect', 'reportSuperior',
          'safetyDepartment', 'rescueEffect', 'alertCooperation'];
        key2.map(k => {
          if(jsonObject[k] && jsonObject[k].length) {
            formState.value[k] = jsonObject[k].filter(item =>  item.isSelect == 'true')[0].content
          }
        })
        console.log(formState.value)
      }
    }
  };
  onMounted(() => {
    pageInit();
  });
  const submitIng = ref(false);
  const submit = async (type) => {
    await formRef.value?.validate();
    submitIng.value = true;
    let params = JSON.parse(JSON.stringify(formState.value));
    if (title.value == '演练方案') {
      params.drillScheme = params.drillScheme.split(',');
      params.drillEmergencyPlan = params.drillEmergencyPlan.split(',');
      params.drillScript = params.drillScript.split(',');
      drillScheme(params)
        .then((res) => {
          submitIng.value = false;
          router.back();
        })
        .catch((err) => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '影像资料') {
      params.drillVideoData = params.drillVideoData.split(',');
      videoData(params)
        .then((res) => {
          submitIng.value = false;
          router.back();
        })
        .catch((err) => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '动员培训') {
      trainContent(params)
        .then((res) => {
          submitIng.value = false;
          router.back();
        })
        .catch((err) => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '演练记录') {
      let keys = ['purpose', 'record', 'rescue'];
      keys.map((k) => {
        if (params[k + '1']) {
          params[k].push(params[k + '1']);
        }
      });
      params.reviewContent = params.reviewContent.map((item, idx) => {
        let obj = {
          content: item,
          serialNumber: idx + 1,
          isSelect: true,
        };
        return obj;
      });
      if (params.reviewContent1) {
        params.reviewContent.push({
          content: params.reviewContent1,
          isSelect: true,
        });
      }
      pingkjia.map((item) => {
        params[item.key] = item.items.map((citem, i) => {
          if (params[item.key].includes(citem)) {
            return {
              serialNumber: i + 1,
              isSelect: true,
              content: citem,
            };
          } else {
            return {
              serialNumber: i + 1,
              isSelect: false,
              content: citem,
            };
          }
        });
      });
      console.log(params);
      drillRecord(params)
        .then((res) => {
          submitIng.value = false;
          router.back();
        })
        .catch((err) => {
          submitIng.value = false;
        });
      return false;
    }
    if (title.value == '演练总结') {
      params.drillSummary = params.drillSummary.split(',');
      params.drillCorrective = params.drillCorrective.split(',');
      drillSummary(params)
        .then((res) => {
          submitIng.value = false;
          router.back();
        })
        .catch((err) => {
          submitIng.value = false;
        });
    }
  };
  const cancel = () => {
    router.back();
  };

  const openModal = (str, tit) => {
    visible.value = true;
    fillTitle.value = tit;
    fillData.value = fillTemplate[str];
  };
</script>
<style lang="less" scoped>
  .plan-detail {
    width: 100%;
    height: 100%;
    padding-bottom: 85px;
    overflow: auto;

    .foot {
      width: 100%;
      position: fixed;
      bottom: 0;
      height: 45px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
  }

  .info {
    width: 100%;
    height: 100%;
    padding: 16px;

    .li {
      padding: 10px 0;
      display: flex;
      word-break: break-all;

      .lable {
        display: inline-block;
        width: 100px;
        color: #777;
      }

      .file {
        flex: 1;
        color: #1890ff;
      }
    }

    .list {
      padding-left: 10px;
      display: flex;
      align-items: center;
      background-color: #f5f5f5;

      .item {
        flex: 1;
        overflow: hidden;
      }

      .lable {
        width: 70px;
      }

      .text {
        flex: 1;
        word-break: break-all;
        word-wrap: break-word;
      }
    }

    .sort {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid #666;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }
  }

  :deep(.van-collapse-item__content) {
    // padding: 0;
  }

  .othertext {
    width: 100%;
    display: flex;
  }

  .aling-top {
    .van-checkbox {
      align-items: flex-start !important;
    }

    :deep(.van-checkbox__icon) {
      margin-top: 4px !important;
    }
  }
  // 模板模态框样式
  .template-modal {
    .ant-modal-body {
      padding: 0;
    }
  }

  .template-content {
    max-height: 300px;
    overflow-y: auto;
    padding: 16px;
  }

  .template-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f9ff;
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .template-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    margin-right: 16px;
    word-break: break-all;
  }
</style>
