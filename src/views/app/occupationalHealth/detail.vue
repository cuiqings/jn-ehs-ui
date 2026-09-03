<template>
  <div class="plan-detail">
    <van-field readonly v-model="formState.name" label="姓名" />
    <van-field readonly v-model="formState.workNo" label="工号" />
    <van-field readonly v-model="formState.orgName" label="所属单位" />
    <van-field readonly v-model="formState.workshopName" label="所属车间" />
    <van-field readonly v-model="formState.post" label="岗位" />
    <van-collapse v-model="activeNames">
      <van-collapse-item title="职业健康检查结果：" name="1" v-if="['edit', 'update'].includes(pageType)">
        <van-form ref="formRef" label-width="110px">
          <template v-if="['edit'].includes(pageType)">
            <van-field readonly v-model="formState.typeName" label="体检种类" placeholder="请选择" required @click="showPicker.type = true">
              <!-- <template #input>{{ { 1: '岗前', 2: '在岗', 3: '离职' }[formState.type] }}</template> -->
            </van-field>

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.checkDate"
              required
              readonly
              label="检查日期"
              placeholder="请选择"
              @click="calendarShow = true"
              :rules="[{ required: true, message: '请选择' }]"
            />

            <van-field
              readonly
              v-model="formState.hazardFactorsName"
              label="本次体检危害因素"
              placeholder="请选择"
              required
              @click="showPicker.hazardFactors = true"
            >
            </van-field>

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.checkResultName"
              required
              readonly
              name="checkResult"
              label="检查结果："
              placeholder="请选择"
              @click="showPicker.checkResult = true"
              :rules="[{ required: true, message: '请选择' }]"
            />

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.inspectionAgency"
              label="检查机构"
              placeholder="请输入"
              required
              :rules="[{ required: true, message: '请选择' }]"
            />

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.post"
              label="岗位"
              required
              :rules="[{ required: true, message: '请选择' }]"
              placeholder="请输入"
            />

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.personnelHandlingName"
              readonly
              name="personnelHandlingName"
              required
              :rules="[{ required: true, message: '请选择' }]"
              label="人员处理情况："
              placeholder="请选择"
              @click="showPicker.personnelHandling = true"
            />

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.processingSituationName"
              readonly
              name="processingSituationName"
              required
              :rules="[{ required: true, message: '请选择' }]"
              label="现场处理情况："
              placeholder="请选择"
              @click="showPicker.processingSituation = true"
            />

            <van-field
              :disabled="pageType == 'detail'"
              v-model="formState.reportFile"
              readonly
              name="reportFile"
              label="体检报告："
              required
              :rules="[{ required: true, message: '请上传' }]"
              placeholder="请选择"
            >
              <template #input>
                <!-- <AppCustomizeUpload v-model:fileList="formState.reportFile" multiple
                                accept=".docx,.doc,.xlsx,.xls,.pdf,.png,.jpeg,.jpg" /> -->
                <AppUpload :watermarkText="watermarkText" v-model:fileList="formState.reportFile" />
              </template>
            </van-field>
          </template>
          <template v-if="['update'].includes(pageType)">
            <div class="infoItem" v-for="(item, idx) in formState.infoList">
              <van-field readonly v-model="item.typeName" label="体检种类" placeholder="请选择" required @click="updTypeClick('type', idx)">
              </van-field>

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.checkDate"
                required
                readonly
                label="检查日期"
                placeholder="请选择"
                @click="calendarShow = true"
                :rules="[{ required: true, message: '请选择' }]"
              />

              <van-field
                readonly
                v-model="item.hazardFactorsName"
                label="本次体检危害因素"
                placeholder="请选择"
                required
                @click="updTypeClick('hazardFactors', idx)"
              >
              </van-field>

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.checkResultName"
                required
                readonly
                name="checkResult"
                label="检查结果："
                placeholder="请选择"
                @click="updTypeClick('checkResult', idx)"
                :rules="[{ required: true, message: '请选择' }]"
              />

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.inspectionAgency"
                label="检查机构"
                placeholder="请输入"
                required
                :rules="[{ required: true, message: '请选择' }]"
              />

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.post"
                label="岗位"
                required
                :rules="[{ required: true, message: '请选择' }]"
                placeholder="请输入"
              />

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.personnelHandlingName"
                readonly
                name="personnelHandlingName"
                required
                :rules="[{ required: true, message: '请选择' }]"
                label="人员处理情况："
                placeholder="请选择"
                @click="updTypeClick('personnelHandling', idx)"
              />

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.processingSituationName"
                readonly
                name="processingSituationName"
                required
                :rules="[{ required: true, message: '请选择' }]"
                label="现场处理情况："
                placeholder="请选择"
                @click="updTypeClick('processingSituation', idx)"
              />

              <van-field
                :disabled="pageType == 'detail'"
                v-model="item.reportFile"
                readonly
                name="reportFile"
                label="体检报告："
                required
                :rules="[{ required: true, message: '请上传' }]"
                placeholder="请选择"
              >
                <template #input>
                  <AppUpload :watermarkText="watermarkText" v-model:fileList="item.reportFile" />
                </template>
              </van-field>
              <div class="delbtn">
                <a-button @click="deleteItem(item.id, idx)" size="small" type="primary" danger ghost>删除</a-button>
              </div>
            </div>
          </template>
        </van-form>
      </van-collapse-item>
      <van-collapse-item title="职业健康检查结果：" name="1" v-else>
        <van-form ref="formRef" label-width="110px" v-for="(item, idx) in formState.infoList" :style="{ background: idx % 2 === 1 ? '#f8f8f8' : '' }">
          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.checkDate"
            required
            readonly
            label="检查日期"
            placeholder="请选择"
            @click="calendarShow = true"
            :rules="[{ required: true, message: '请选择' }]"
          />

          <van-field readonly v-model="item.type" label="体检种类" required :disabled="pageType == 'detail'">
            <template #input>{{ { 1: '岗前', 2: '在岗', 3: '离职' }[item.type] }}</template>
          </van-field>

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.checkResultName"
            required
            readonly
            name="checkResult"
            label="检查结果："
            placeholder="请选择"
            @click="showPicker.checkResult = true"
            :rules="[{ required: true, message: '请选择' }]"
          />

          <van-field
            readonly
            v-model="item.hazardFactorsName"
            label="本次体检危害因素"
            placeholder="请选择"
            required
          >
          </van-field>

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.inspectionAgency"
            label="检查机构"
            placeholder="请输入"
            required
            :rules="[{ required: true, message: '请选择' }]"
          />

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.post"
            label="岗位"
            required
            :rules="[{ required: true, message: '请选择' }]"
            placeholder="请输入"
          />

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.personnelHandlingName"
            readonly
            name="personnelHandlingName"
            required
            :rules="[{ required: true, message: '请选择' }]"
            label="人员处理情况："
            placeholder="请选择"
            @click="showPicker.personnelHandling = true"
          />

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.processingSituationName"
            readonly
            name="processingSituationName"
            required
            :rules="[{ required: true, message: '请选择' }]"
            label="现场处理情况："
            placeholder="请选择"
            @click="showPicker.processingSituation = true"
          />

          <van-field
            :disabled="pageType == 'detail'"
            v-model="item.reportFile"
            readonly
            name="reportFile"
            label="体检报告："
            required
            :rules="[{ required: true, message: '请上传' }]"
            placeholder="请选择"
          >
            <template #input>
              <AppCustomizeUpload
                v-model:fileList="item.reportFile"
                multiple
                :disabled="pageType == 'detail'"
                accept=".docx,.doc,.xlsx,.xls,.pdf,.png,.jpeg,.jpg"
              />
            </template>
          </van-field>
        </van-form>
      </van-collapse-item>
    </van-collapse>

    <div class="foot" v-if="['edit', 'update'].includes(pageType)">
      <van-button size="small" @click="cancel">取消</van-button>
      <van-button size="small" type="primary" plain @click="handleSave">保存</van-button>
      <van-button size="small" type="primary" :loading="submitIng" @click="submit">提交</van-button>
    </div>
    <van-calendar :min-date="minDate" :max-date="maxDate" v-model:show="calendarShow" @confirm="onConfirm($event, 'checkDate')" />
    <!--检查结果：-->
    <van-popup v-model:show="showPicker.checkResult" position="bottom">
      <van-picker :columns="selectList.checkResult" @cancel="showPicker.checkResult = false" @confirm="onConfirm($event, 'checkResult')" />
    </van-popup>
    <!--人员处理情况：-->
    <van-popup v-model:show="showPicker.personnelHandling" position="bottom">
      <van-picker
        :columns="selectList.personnelHandling"
        @cancel="showPicker.personnelHandling = false"
        @confirm="onConfirm($event, 'personnelHandling')"
      />
    </van-popup>
    <!--体检种类-->
    <van-popup v-model:show="showPicker.type" position="bottom">
      <van-picker :columns="selectList.type" @cancel="showPicker.type = false" @confirm="onConfirm($event, 'type')" />
    </van-popup>
    <!-- 危害因素 -->
    <TreeSelect
      value-key="id"
      title-key="name"
      :value="curHazardFactorsValue"
      v-model:show="showPicker.hazardFactors"
      :not-tree="true"
      :items="selectList.hazardFactors"
      @change="onConfirm($event, 'hazardFactors')"
    />
    <!--现场处理情况-->
    <van-popup v-model:show="showPicker.processingSituation" position="bottom">
      <van-picker
        :columns="selectList.processingSituation"
        @cancel="showPicker.processingSituation = false"
        @confirm="onConfirm($event, 'processingSituation')"
      />
    </van-popup>
    <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
      <Sign v-model:value="signature" />
    </van-dialog>
    <van-popup v-model:show="htmlShow" closeable position="bottom" style="height: 100%" :title="htmlTitle" show-cancel-button>
      <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="100%"></iframe>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
  import AppUpload from '../components/AppUpload.vue';
  import {
    physicalExaminationEdit,
    physicalExaminationUpd,
    physicalExaminationInfo,
    physicalExaminationSave,
    physicalExaminationDetail,
    hazardFactors,
    deleteReport
  } from '/@/views/occupationalHealth/api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useRoute, useRouter } from 'vue-router';
  import Sign from '../components/sign.vue';
  import { computed, ref } from 'vue';
  import dayjs from 'dayjs';
  import { useUserStore } from '/@/store/modules/user';
  import TreeSelect from '../components/treeSelect.vue';
  import { FormInstance, showConfirmDialog } from 'vant';
import { set } from 'nprogress';
  const route = useRoute();
  const router = useRouter();
  const activeNames = ref(['1', '2']);
  const show = ref(false);
  const signShow = ref(false);
  const signature = ref('');
  const formRef = ref<FormInstance|null>(null);
  const { userInfo } = useUserStore(); // 类型断言
  const pageType: any = computed(() => route.query.type);

  const showPicker = ref({
    checkResult: false,
    personnelHandling: false,
    processingSituation: false,
    type: false,
    hazardFactors: false,
  });

  const watermarkText = ref(`${userInfo.realname} ${userInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`);

  const nowDate = new Date();
  const minDate = ref(new Date(nowDate.getFullYear() - 10, 0, 1));
  const maxDate = ref(new Date(nowDate.getFullYear() + 10, 11, 31));
  const calendarShow = ref(false);
  const selectList = ref({
    checkResult: [
      {
        text: '未见异常',
        value: '1',
      },
      {
        text: '疑似职业病',
        value: '2',
      },
      {
        text: '禁忌证',
        value: '3',
      },
      {
        text: '其他疾患',
        value: '4',
      },
      {
        text: '复查',
        value: '5',
      },
    ],
    personnelHandling: [
      {
        text: '无',
        value: '1',
      },
      {
        text: '调离',
        value: '2',
      },
      {
        text: '暂时脱离工作岗位',
        value: '3',
      },
      {
        text: '复查',
        value: '4',
      },
      {
        text: '医学观察',
        value: '5',
      },
    ],
    processingSituation: [
      {
        text: '无',
        value: '1',
      },
      {
        text: '整改完成',
        value: '2',
      },
    ],
    type: [
      {
        text: '岗前',
        value: '1',
      },
      {
        text: '在岗',
        value: '2',
      },
      {
        text: '离职',
        value: '3',
      },
    ],
    hazardFactors: [],
  });
  const checkResult = {
    1: '未见异常',
    2: '疑似职业病',
    3: '禁忌证',
    4: '其他疾患',
    5: '复查',
  };
  const typeList = {
    1: '岗前',
    2: '在岗',
    3: '离职',
  };
  const personnelHandling = {
    1: '无',
    2: '调离',
    3: '暂时脱离工作岗位',
    4: '复查',
    5: '医学观察',
  };
  const processingSituation = {
    1: '无',
    2: '整改完成',
  };
  const formState = ref<any>({
    orgCode: undefined,
    workshop: undefined,
    location: '',
    type: '',
    model: '',
    number: '',
    dutyUser: '',
    checkDate: '',
    expirationDate: '',
    checkResult: '',
    personnelHandlingName: '',
  });

  const pageInit = async () => {
    formState.value.id = route.query.id;
    let res = await physicalExaminationDetail({ id: route.query.id });
    selectList.value.hazardFactors = await hazardFactors();
    selectList.value.hazardFactors.forEach((item: any) => {
      item.text = item.name;
      item.id = item.id.toString();
    });
    if (route.query.type === 'detail') {
      Object.assign(formState.value, res);
    }
    if (route.query.type === 'update') {
      Object.assign(formState.value, res);
    }
    if (route.query.type === 'edit') {
      Object.assign(formState.value, res, { physicalId: route.query.id });
      physicalExaminationInfo({ id: route.query.id }).then((r) => {
        if (r.infoList && r.infoList.length > 0) {
          r.infoList.forEach((item) => {
            item.checkResultName = checkResult[item.checkResult];
            item.personnelHandlingName = personnelHandling[item.personnelHandling];
            item.processingSituationName = checkResult[item.processingSituation];
            item.typeName = typeList[item.type];
          });
          Object.assign(formState.value, r.infoList[0], { physicalId: route.query.id });
          console.log(formState.value);
        } else {
          delete formState.value.id;
        }
      });
    }
    if (res.infoList) {
      res.infoList.forEach((item) => {
        item.checkResultName = checkResult[item.checkResult];
        item.personnelHandlingName = personnelHandling[item.personnelHandling];
        item.processingSituationName = checkResult[item.processingSituation];
        item.typeName = typeList[item.type];
        if(item.hazardFactors) {
          item.hazardFactors = item.hazardFactors.split(',').map(item => item);
          item.hazardFactorsName = '';
          selectList.value.hazardFactors.forEach((v: any) => {
            if(item.hazardFactors.includes(v.id)) {
              item.hazardFactorsName += v.text + ',';
            }
          })
          if(item.hazardFactorsName) {
            item.hazardFactorsName = item.hazardFactorsName.substring(0, item.hazardFactorsName.length - 1);
          }
        }
      });
    }
    if (userInfo?.signature) {
      if (/^http/i.test(userInfo.signature)) signature.value = userInfo.signature;
    }
  };
  pageInit();

  const submitIng = ref(false);
  const handleSave = async () => {
    submitIng.value = true;
    physicalExaminationSave(formState.value)
      .then((res) => {
        router.back();
      })
      .finally(() => {
        setTimeout(() => {
          submitIng.value = false;
        }, 500);
      });
  };
  const submit = async () => {
    await formRef.value?.validate();
    if (pageType.value === 'update') {
      submitIng.value = true;
      formState.value.infoList.forEach(item => {
        if(item.hazardFactors && Array.isArray(item.hazardFactors)) item.hazardFactors = item.hazardFactors.join(',');
      })
      physicalExaminationUpd(formState.value)
        .then((res) => {
          router.back();
        })
        .finally(() => {
          setTimeout(() => {
            submitIng.value = false;
          }, 500);
        });
      return;
    }
    submitIng.value = true;
    signShow.value = true;
  };
  const cancel = () => {
    router.back();
  };
  const beforeClose = async () => {
    return new Promise((resolve, reject) => {
      if(formState.value.infoList && formState.value.infoList.length > 0){
        formState.value.infoList.forEach(item => {
          if(item.hazardFactors && Array.isArray(item.hazardFactors)) item.hazardFactors = item.hazardFactors.join(',');
        })
      }
      physicalExaminationEdit({
        ...formState.value,
        sign: signature.value,
      })
        .then(() => {
          resolve(true);
          show.value = false;
          router.back();
        })
        .catch(() => {
          resolve(false);
        }).finally(() => {
          setTimeout(() => {
            submitIng.value = false;
          }, 500);
        })
    });
  };

  const htmlShow = ref(false);
  const htmlTitle = ref('');
  const htmlContent = ref('');
  const htmlRef = ref(null);
  const curHazardFactorsValue = ref('');
  const onConfirm = (value, key) => {
    switch (key) {
      case 'checkDate':
        formState.value.checkDate = dayjs(value).format('YYYY-MM-DD');
        calendarShow.value = false;
        break;
      case 'hazardFactors':
        if (curTypeIdx.value > -1) {
          formState.value.infoList[curTypeIdx.value][key] = value.ids;
          formState.value.infoList[curTypeIdx.value][key + 'Name'] = value.names;
          showPicker.value[key] = false;
          curTypeIdx.value = -1;
        } else {
          formState.value[key] = value.ids;
          formState.value[key + 'Name'] = value.names;
          showPicker.value[key] = false;
        }
        break;
      default:
        if (curTypeIdx.value > -1) {
          formState.value.infoList[curTypeIdx.value][key] = value.selectedValues[0];
          formState.value.infoList[curTypeIdx.value][key + 'Name'] = value.selectedOptions[0].text;
          showPicker.value[key] = false;
          curTypeIdx.value = -1;
        } else {
          formState.value[key] = value.selectedValues[0];
          formState.value[key + 'Name'] = value.selectedOptions[0].text;
          showPicker.value[key] = false;
        }
        break;
    }
  };
  const curTypeIdx = ref(-1);
  const updTypeClick = (type, idx) => {
    if(type == 'hazardFactors') {
      curHazardFactorsValue.value = formState.value.infoList[idx].hazardFactors;
      console.log(curHazardFactorsValue.value)
    }
    curTypeIdx.value = idx;
    showPicker.value[type] = true;
  };

  const deleteItem = (id, idx) => {
    showConfirmDialog({
      title: '提示',
      message: '确定要删除吗?',
    }).then(() => {
      deleteReport({ id: id }).then(() => {
              formState.infoList.splice(idx, 1);
        }).finally(() => {
          submitIng.value = false;
          pageInit();
        })
    });
  }

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
      background-color: #ffffff;
    }
  }

  .record-list {
    width: 100%;

    .tit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 36px;

      span {
        color: #1890ff;
      }
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
  :deep(.van-cell) {
    background-color: transparent !important;
  }
  :deep(.van-collapse-item__content) {
    padding: 0;
  }
  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }
  :deep(.van-field__control:disabled){
    color: #323233 !important;
    -webkit-text-fill-color: #323233 !important;
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
  .infoItem{
    box-shadow: inset 0 -3px 0 0 #e8e8e8;
    position: relative;
    .delbtn{
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
</style>
