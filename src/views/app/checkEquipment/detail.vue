<template>
  <div class="equipment-detail">
    <div class="main">
      <van-form label-width="130">
        <van-field input-align="right" readonly name="planName" label="检验类型：">
          <template #input>{{ deviceList[route.query.checkType] }}</template>
        </van-field>
        <van-field input-align="right" readonly v-model="detailInfo.remindStatus" name="itemName" label="检验提醒：">
          <template #input>
            <span v-if="detailInfo.remindStatus == 1" class="tag bl">正常</span>
            <span v-if="detailInfo.remindStatus == 2" class="tag or">即将到期</span>
            <span v-if="detailInfo.remindStatus == 3" class="tag">超期未检</span>
          </template>
        </van-field>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" title-class="titleclass" name="1">
            <template v-if="route.query.checkType == 6">
              <van-field readonly v-model="detailInfo.orgName" name="orgName" label="所属机构：" />
              <van-field readonly v-model="detailInfo.module" name="module" label="模块（工序）：" />
              <van-field readonly v-model="detailInfo.location" name="location" label="具体位置：" />
              <van-field readonly v-model="detailInfo.dutyPeopleName" name="dutyPeopleName" label="责任人：" />
              <van-field readonly v-model="detailInfo.facilityNo" name="facilityNo" label="消防设施（编号）：" />
              <van-field readonly v-model="detailInfo.equipmentName" name="equipmentName" label="器材名称：" />
              <van-field readonly v-model="detailInfo.number" name="number" label="数量：" />
              <van-field readonly v-model="detailInfo.checkDate" name="checkDate" label="检定日期：" />
              <van-field readonly v-model="detailInfo.nextCheckDate" name="nextCheckDate" label="下次检定日期：" />
              <van-field readonly v-model="detailInfo.remark" name="remark" label="备注：" />
            </template>
            <template v-else>
              <van-field readonly v-model="detailInfo.deviceType" name="deviceType" label="设备类型：">
                <template #input>
                  {{ filterDictTextByCache('special_device_type', detailInfo.deviceType, ) }}
                </template>
              </van-field>
              <van-field readonly v-model="detailInfo.useDepartment" name="useDepartment" label="使用单位：" />
              <van-field readonly v-model="detailInfo.deviceName" name="deviceName" label="设备名称：" />
            </template>
            <template v-if="route.query.checkType == 1">
              <van-field readonly v-model="detailInfo.deviceNumber" name="deviceNumber" label="用户设备编号：" />
              <van-field readonly v-model="detailInfo.useCertificateNumber" name="useCertificateNumber" label="使用登记证编号：" />
              <van-field readonly v-model="detailInfo.manuUnit" name="manuUnit" label="制造单位：" />
              <van-field readonly v-model="detailInfo.manuLicense" name="manuLicense" label="制造许可证：" />
              <van-field readonly v-model="detailInfo.factoryNumber" name="factoryNumber" label="出厂编号：" />
              <van-field readonly v-model="detailInfo.factoryDate" name="factoryDate" label="出厂日期：" />
              <van-field readonly v-model="detailInfo.verificationDate" name="verificationDate" label="下次检定日期：" />
            </template>
            <template v-if="route.query.checkType == 2">
              <van-field readonly v-model="detailInfo.deviceNumber" name="deviceNumber" label="公司内编号：" />
              <van-field readonly v-model="detailInfo.certificateNumber" name="certificateNumber" label="发证编号：" />
              <van-field readonly v-model="detailInfo.manuUnit" name="manuUnit" label="制造单位：" />
              <van-field readonly v-model="detailInfo.manuDate" name="manuDate" label="制造日期：" />
              <van-field readonly v-model="detailInfo.factoryNumber" name="factoryNumber" label="出厂编号：" />
              <van-field readonly v-model="detailInfo.factoryDate" name="factoryDate" label="出厂日期：" />
              <van-field readonly v-model="detailInfo.verificationDate" name="verificationDate" label="下次检定日期：" />
              <van-field readonly v-model="detailInfo.useDate" name="useDate" label="投入使用日期：" />
            </template>
            <template v-if="['3', '4'].includes(route.query.checkType)">
              <van-field readonly v-model="detailInfo.deviceNumber" name="deviceNumber" label="编号：" />
              <van-field readonly v-model="detailInfo.registrationNumber" name="registrationNumber" label="注册号：" />
              <van-field readonly v-model="detailInfo.factoryNumber" name="factoryNumber" label="出厂编号：" />
              <van-field readonly v-model="detailInfo.factoryDate" name="factoryDate" label="出厂日期：" />
              <van-field readonly v-model="detailInfo.manuUnit" name="manuUnit" label="制造单位：" />
              <van-field readonly v-model="detailInfo.manuDate" name="manuDate" label="制造日期：" />
              <van-field readonly v-model="detailInfo.verificationDate" name="verificationDate" label="下次检定日期：" />
              <van-field readonly v-model="detailInfo.useDate" name="useDate" label="投入使用日期：" />
            </template>
            <template v-if="route.query.checkType == 5">
              <van-field readonly v-model="detailInfo.registrationNumber" name="registrationNumber" label="注册号：" />
              <van-field readonly v-model="detailInfo.certificateNumber" name="certificateNumber" label="发证编号：" />
              <van-field readonly v-model="detailInfo.deviceModel" name="deviceModel" label="型号：" />
              <van-field readonly v-model="detailInfo.factoryNumber" name="factoryNumber" label="出厂编号：" />
              <van-field readonly v-model="detailInfo.factoryDate" name="factoryDate" label="出厂日期：" />
              <van-field readonly v-model="detailInfo.manuUnit" name="manuUnit" label="制造单位：" />
              <van-field readonly v-model="detailInfo.manuLicense" name="manuLicense" label="制造许可证：" />
              <van-field readonly v-model="detailInfo.manuDate" name="manuDate" label="制造日期：" />
              <van-field readonly v-model="detailInfo.useDate" name="useDate" label="投入使用日期：" />
              <van-field readonly v-model="detailInfo.verificationDate" name="verificationDate" label="下次检定日期：" />
            </template>
          </van-collapse-item>
          <van-collapse-item title="规格参数" v-if="route.query.checkType != 6" title-class="titleclass" name="2">
            <template v-if="route.query.checkType == 1">
              <van-field readonly v-model="detailInfo.deviceModel" name="deviceModel" label="型号：" />
              <van-field readonly v-model="detailInfo.weight" name="weight" label="载重：" />
              <van-field readonly v-model="detailInfo.span" name="span" label="跨度：" />
              <van-field readonly v-model="detailInfo.highly" name="highly" label="高度：" />
              <van-field readonly v-model="detailInfo.hoistSpeed" name="hoistSpeed" label="起升速度：" />
              <van-field readonly v-model="detailInfo.workLevel" name="workLevel" label="工作级别：" />
              <van-field label-width="145" readonly v-model="detailInfo.installPermit" name="installPermit" label="安装改造维修许可证：" />
              <van-field readonly v-model="detailInfo.installDate" name="installDate" label="安装日期：" />
              <van-field readonly v-model="detailInfo.installPlace" name="installPlace" label="安装地点：" />
            </template>
            <template v-if="route.query.checkType == 2">
              <van-field readonly v-model="detailInfo.deviceModel" name="deviceModel" label="设备型号：" />
              <van-field readonly v-model="detailInfo.protectNumber" name="protectNumber" label="环保车牌号：" />
              <van-field readonly v-model="detailInfo.weight" name="weight" label="载重量：" />
              <van-field readonly v-model="detailInfo.engineNumber" name="engineNumber" label="发动机编号：" />
              <van-field readonly v-model="detailInfo.frameNumber" name="frameNumber" label="车架编号：" />
              <van-field readonly v-model="detailInfo.registrationNumber" name="registrationNumber" label="注册代码：" />
              <van-field readonly v-model="detailInfo.fitting" name="fitting" label="带属具：">
                <template #input>
                  {{ detailInfo.fitting == 0 ? '是' : '否' }}
                </template>
              </van-field>
            </template>
            <template v-if="['3', '4'].includes(route.query.checkType)">
              <van-field readonly v-model="detailInfo.containerType" name="containerType	" label="容器类型：" />
              <van-field readonly v-model="detailInfo.designPressure" name="designPressure" label="设计压力：" />
              <van-field readonly v-model="detailInfo.designTemperature" name="designTemperature" label="设计温度：" />
              <van-field readonly v-model="detailInfo.withstandPressure" name="withstandPressure" label="耐压试验压力：" />
              <van-field readonly v-model="detailInfo.containerWeight" name="containerWeight" label="容器重量：" />
              <van-field readonly v-model="detailInfo.volume" name="volume" label="容积：" />
              <van-field readonly v-model="detailInfo.bores" name="bores" label="内径：" />
              <van-field readonly v-model="detailInfo.wallThickness" name="wallThickness" label="壁厚：" />
              <van-field readonly v-model="detailInfo.designYear" name="designYear" label="设计使用年限：" />
              <van-field readonly v-model="detailInfo.media" name="media" label="介质：" />
              <van-field readonly v-model="detailInfo.reliefValve" name="reliefValve" label="安全阀：" />
              <van-field readonly v-model="detailInfo.settingPressure" name="settingPressure" label="整定压力：" />
              <van-field readonly v-model="detailInfo.reliefDate" name="reliefDate" label="安全阀检验日期：" />
              <van-field label-width="145" readonly v-model="detailInfo.reliefNextDate" name="reliefNextDate" label="安全阀下次检验日期：" />
            </template>
            <template v-if="route.query.checkType == 5">
              <van-field readonly v-model="detailInfo.rateCapacity" name="rateCapacity" label="额定蒸发量：" />
              <van-field readonly v-model="detailInfo.rateSteam" name="rateSteam" label="额定蒸汽压力：" />
              <van-field readonly v-model="detailInfo.maxPressure" name="maxPressure" label="最高工作压力：" />
              <van-field readonly v-model="detailInfo.waterPressure" name="waterPressure" label="水压试验压力：" />
              <van-field readonly v-model="detailInfo.preTemperature" name="preTemperature" label="额定蒸汽温度：" />
              <van-field readonly v-model="detailInfo.waterTemperature" name="waterTemperature" label="给水温度：" />
              <van-field readonly v-model="detailInfo.useFuel" name="useFuel" label="运用燃料：" />
              <van-field readonly v-model="detailInfo.combusMode" name="combusMode" label="燃烧方式：" />
              <van-field readonly v-model="detailInfo.waterForm" name="waterForm" label="水处理型式：" />
              <van-field readonly v-model="detailInfo.boilerUse" name="boilerUse" label="锅炉用途：" />
            </template>
          </van-collapse-item>
          <van-collapse-item title="设备状态" v-if="route.query.checkType != 6" title-class="titleclass" name="3">
            <van-field readonly v-model="detailInfo.equipmentState" name="equipmentState" label="设备状态：">
              <template #input>
                {{ filterDictTextByCache('special_device_status', detailInfo.equipmentState) }}
              </template>
            </van-field>
            <van-field readonly v-model="detailInfo.remark" name="remark" label="备注：" />
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <div class="foot">
      <van-button @click="checkClick" round type="primary" size="small">设备检验</van-button>
    </div>
  </div>
  <CheckDialog @hideBatch="hideBatchClick" :single="true" :ids="checkedIds" v-model:show="checkDialogShow" />
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import CheckDialog from './components/checkDialog.vue';
  import { specialCheckDetail, saveCheckDate } from './index.api';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { useRoute } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  setAppTitle('设备检验详情');

  const activeNames = ref(['1', '2', '3']);
  const route = useRoute();
  const loading = ref(false);
  const detailInfo = reactive<any>({});
  const deviceList = { 6: '消防器材', 1: '起重机械', 2: '叉车', 3: '压力容器', 4: '安全阀', 5: '锅炉' };

  const getDetail = () => {
    loading.value = true;
    specialCheckDetail({
      ...route.query,
    })
      .then((res) => {
        Object.assign(detailInfo, res);
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  };
  getDetail();

  const checkedIds = ref<any>([]);
  const checkDialogShow = ref<boolean>(false);

  const checkClick = () => {
    checkDialogShow.value = true;
  };

  const hideBatchClick = (formData) => {
    if (formData.nextCheckDate) {
      formData.nextCheckDate += ' 00:00:00';
    }
    saveCheckDate({
      checkVos: [
        {
          id: route.query.id,
          checkType: route.query.checkType,
        },
      ],
      ...formData,
    }).then((res) => {
      getDetail();
      // showToast('批量检验成功！');
    });
  };
</script>

<style lang="less" scoped>
  .equipment-detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .main {
      flex: 1;
      overflow-y: auto;
    }

    :deep(.van-collapse-item__content) {
      padding-left: 5px;
      padding-right: 0;
    }

    :deep(.van-cell) {
      padding: 10px 15px;
    }

    :deep(.titleclass) {
      font-size: 14px;
      font-weight: 600;
      color: #1989fa;
    }

    .foot {
      height: 45px;
      padding: 8px 0;
      display: flex;
      justify-content: center;

      .van-button {
        width: 100px;
        margin-right: 15px;
      }
    }
  }
  .tag {
    font-size: 12px;
    display: inline-block;
    background-color: #f76262;
    color: #fff;
    font-size: 10px;
    border-radius: 4px;
    padding: 0 4px;
    margin-left: 10px;
  }

  .bl {
    background-color: #68b0f8;
  }

  .or {
    background-color: #f7aa36;
  }
  .nor {
    background-color: #f76262;
  }
</style>
