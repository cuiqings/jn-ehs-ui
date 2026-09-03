<template>
  <div class="about-container">
    <div class="title">相关资料</div>
    <a-collapse v-model:activeKey="activeKey" accordion>
      <a-collapse-panel v-for="(item, index) in dataOne.filter((ite) => ite.nameTitle)" :key="index" :header="item.nameTitle">
        <div class="list" v-for="(ite, inx) in dataOne.filter((ite) => ite.type === index)" :key="inx">
          <p
            >{{ ite.key }}<span v-if="ite.required && type !== 'approval' && type !== 'view'" style="color: red; margin-right: 4px">*</span
            >{{ ite.name }}</p
          >
          <j-image-upload
            v-if="!disabled || (disabled && ite.img)"
            v-model:value="ite.img"
            :fileMax="5 - (ite.value === '' && !ite.value ? 0 : ite.value?.split(',').length)"
            :disabled="disabled"
            is-name
          />
          <customize-upload
            v-model:value="ite.value"
            :max-count="5 - (ite.img === '' && !ite.img ? 0 : ite.img?.split(',').length)"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            :disabled="disabled"
          />
          <div v-if="disabled && !ite.img && !ite.value" style="color: #999">无</div>
          <div v-if="Number(currentNode) > 1 || type === 'approval'" style="display: flex">
            审查结果：
            <a-radio-group v-model:value="ite.result" name="radioGroup" v-if="currentNode === '1'">
              <a-radio value="1">合格</a-radio>
              <a-radio value="2">不合格</a-radio>
            </a-radio-group>
            <div v-else>
              <span :style="{ color: ite.result === '1' ? '#09c199' : 'red' }">{{ ite.result === '1' ? '合格' : '不合格' }}</span>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts" name="about" setup>
  import { ref } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import CustomizeUpload from '../../../components/CustomizeUpload.vue';
  defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    // 审批进度
    currentNode: {
      type: String,
      default: '0',
    },
    bodyStyle: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: '',
    },
  });
  const activeKey = ref(0);
  // 入场申请
  const dataOne = ref([
    {
      id: '',
      type: 0,
      key: '1、',
      name: '营业执照',
      nameTitle: '资质审核',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'yyzz',
    },
    {
      id: '',
      type: 0,
      key: '2、',
      name: '企业施工资质',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'qysgzz',
    },
    {
      id: '',
      type: 0,
      key: '3、',
      name: '安全生产许可证',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'aqscxkz',
    },
    {
      id: '',
      type: 0,
      key: '4、',
      name: '质量管理体系认证证书(IS09001)',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'zlgltxrzzs',
    },
    {
      id: '',
      type: 0,
      key: '5、',
      name: '职业健康安全管理体系认证证书(IS045001)',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'zyjkaqgltxrzzs',
    },
    {
      id: '',
      type: 0,
      key: '6、',
      name: '环境管理体系认证证书(IS014001)',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'hjgltxrzzs',
    },
    {
      id: '',
      type: 0,
      key: '7、',
      name: '企业法人资格',
      required: true,
      isBottom: true,
      value: '',
      img: '',
      result: '',
      keys: 'qyfrzg',
    },
    {
      id: '',
      type: 1,
      key: '1、',
      name: '现场主要负责人、安全生产管理人员、特种作业人员证件复印件',
      nameTitle: '安全生产许可证办理资料',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'xczyfzr',
    },
    {
      id: '',
      type: 1,
      key: '2、',
      name: '工程总承包和分包合同等复印件',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'gczcbhfbhtdfyj',
    },
    {
      id: '',
      type: 1,
      key: '3、',
      name: '安全生产管理协议',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'aqscglxy',
    },
    {
      id: '',
      type: 1,
      key: '4、',
      name: '消防管理协议',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'xfglxy',
    },
    {
      id: '',
      type: 1,
      key: '5、',
      name: '安全生产责任制文件',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'aqsczrzwj',
    },
    {
      id: '',
      type: 1,
      key: '6、',
      name: '安全管理规章制度文件',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'aqglgzzdwj',
    },
    {
      id: '',
      type: 1,
      key: '7、',
      name: '应急救援预案',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'yjjyya',
    },
    {
      id: '',
      type: 1,
      key: '8、',
      name: '施工组织设计',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'aqsgfa',
    },
    {
      id: '',
      type: 1,
      key: '9、',
      name: '设置安全生产管理机构和配备专职安全员的文件',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'szaqscgljg',
    },
    {
      id: '',
      type: 1,
      key: '10、',
      name: '特种设备检验、检测合格证明材料',
      required: false,
      value: '',
      img: '',
      result: '',
      keys: 'tzsbjy',
    },
    {
      id: '',
      type: 1,
      key: '11、',
      name: '安全风险抵押金',
      required: true,
      value: '',
      img: '',
      result: '',
      keys: 'aqfxyj',
    },
    {
      id: '',
      type: 1,
      key: '12、',
      name: '施工场地布置图',
      required: false,
      isBottom: true,
      value: '',
      img: '',
      result: '',
      keys: 'sgcdbzt',
    },
  ]);

  defineExpose({ dataOne });
</script>
<style lang="less" scoped>
  .about-container {
    width: 100%;
    .title {
      height: 55px;
      line-height: 55px;
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
    }
    .list-border {
      border-top: none;
      border-radius: 5px;
      .list {
        border-left: 1px solid #d9d9d9;
        border-right: 1px solid #d9d9d9;
        padding: 15px;
        .name-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
      }
    }
    .list-top {
      border-top: 1px solid #d9d9d9;
      margin-top: 20px;
      border-radius: 5px 5px 0 0;
    }
    .list-top:first-child {
      margin-top: 0;
    }
    .list-bottom {
      border-bottom: 1px solid #d9d9d9;
      border-radius: 5px 5px 5px 5px;
      margin-bottom: 20px;
    }
  }
</style>
