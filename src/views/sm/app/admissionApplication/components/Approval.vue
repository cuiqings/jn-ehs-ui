<template>
  <div class="approval">
    <a-steps :current="current" direction="vertical" class="accident-report-steps">
      <a-step v-for="(item, index) in manyHills" :key="item">
        <template #title>
          <div
            :class="
              item.handleResult !== 'agree' && item.handleResult && type !== 'add' && type !== 'edit'
                ? 'red'
                : current > Number(item.type) || Number(item.currentNode) > Number(item.type)
                ? 'approvalBlur'
                : ''
            "
            ><span v-if="isRequired(item)" style="color: red; margin-right: 5px">*</span>{{ item.name }}</div
          >
        </template>
        <template #description>
          <div v-if="item.type === '0' && (item.currentNode !== '0' || type === 'view')" class="approvalBlur">
            {{ item.handleTime }}&nbsp;{{ item.assigneeName }}
          </div>
          <div v-if="item.personnelList && item.personnelList.length > 0">
            <a-select
              v-if="(item.currentNode === '0' || (item.currentNode === '1' && item.type !== '1')) && type !== 'view'"
              style="width: 200px"
              v-model:value="item.approveType"
              :options="shanduogangArr"
              placeholder="请选择"
              @change="changeType($event, index)"
            />
            <div class="personnel-list">
              <div v-for="(ite, inx) in item.personnelList" :key="inx">
                <div v-if="(item.currentNode === '0' || (item.currentNode === '1' && item.type !== '1')) && type !== 'view'">
                  <JUserModal
                    :userStyle="{ width: '200px', marginTop: '20px' }"
                    v-model:value="ite.assignee"
                    type="checkbox"
                    @click-user="(cb) => changeUser(cb, item)"
                  />
                  <span v-if="item.approveType === '2' && inx === 0 && inx <= 4" style="color: #4498f0; margin-left: 20px" @click="add(index)"
                    >添加</span
                  >
                  <span v-if="item.approveType === '2' && inx !== 0" style="color: red; margin-left: 20px" @click="remove(index, inx)">删除</span>
                </div>
                <div
                  v-else
                  :class="
                    ite.handleResult === 'agree' ? 'approvalBlur' : ite.handleResult === 'disagree' || ite.handleResult === 'addBlack' ? 'red' : ''
                  "
                >
                  <span
                    >{{ ite.handleTime }}&nbsp;{{ ite.assigneeName
                    }}{{
                      ite.handleResult === 'agree'
                        ? '，审核通过'
                        : ite.handleResult === 'disagree'
                        ? `，审批退回${ite.disagreeReason}`
                        : ite.handleResult === 'addBlack'
                        ? `，加入黑名单${ite.blackRemark}`
                        : ''
                    }}</span
                  >
                  <div v-if="ite.signature" style="margin-top: 10px">
                    <img
                      :src="/^http/i.test(ite.signature) ? ite.signature : getFileAccessHttpUrl(ite.signature)"
                      style="width: 90px; height: 55px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </a-step>
      <a-step>
        <template #title>
          <div :class="current >= manyHills.length ? 'approvalBlur' : ''">任务结束</div>
        </template>
      </a-step>
    </a-steps>
  </div>
</template>
<script lang="ts" name="approval" setup>
  import { ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  const props = defineProps({
    applicationType: {
      type: String,
    },
    type: {
      type: String,
    },
  });
  const { createMessage } = useMessage();
  const current = ref(0);
  const shanduogangArr = [
    {
      label: '单岗单批',
      value: '1',
    },
    {
      label: '多岗多批',
      value: '2',
    },
  ];
  const manyHills: any = ref([
    {
      type: '0',
      currentNode: '0',
      handleResult: 'agree',
      name: '资料提交',
      handleTime: '',
      assigneeName: '',
    },
    {
      type: '1',
      name: '分厂安全员',
      approveType: '1',
      currentNode: '0',
      handleResult: '',
      personnelList: [
        {
          assignee: undefined,
          handleTime: '',
          assigneeName: '',
          handleResult: '',
          disagreeReason: '',
          blackRemark: '',
        },
      ],
    },
    {
      type: '2',
      name: '分厂安全科长',
      approveType: '1',
      currentNode: '0',
      handleResult: '',
      personnelList: [
        {
          assignee: undefined,
          handleTime: '',
          assigneeName: '',
          handleResult: '',
          disagreeReason: '',
          blackRemark: '',
        },
      ],
    },
    {
      type: '3',
      name: '一把手',
      approveType: '1',
      currentNode: '0',
      handleResult: '',
      personnelList: [
        {
          assignee: undefined,
          handleTime: '',
          assigneeName: '',
          handleResult: '',
          disagreeReason: '',
          blackRemark: '',
        },
      ],
    },
    {
      type: '4',
      name: '安全部',
      approveType: '1',
      currentNode: '0',
      handleResult: '',
      personnelList: [
        {
          assignee: undefined,
          handleTime: '',
          assigneeName: '',
          handleResult: '',
          disagreeReason: '',
          blackRemark: '',
        },
      ],
    },
  ]);
  const add = (index) => {
    let data = manyHills.value[index].personnelList;
    data.push({
      assignee: undefined,
      handleTime: '',
      assigneeName: '',
      handleResult: '',
      disagreeReason: '',
      blackRemark: '',
    });
  };
  // 单/多切换
  const changeType = (value, index) => {
    let data = manyHills.value[index];
    data.personnelList = [{ assignee: undefined, handleTime: '', assigneeName: '', handleResult: '', disagreeReason: '' }];
  };
  const changeUser = (cb, item) => {
    let userIds: any = [];
    if (item?.approveType === '2') {
      userIds = item.personnelList
        .filter((item) => item.assignee !== undefined) // 过滤掉 user 是 undefined 的项
        .flatMap((item) => item.assignee.split(','));
    }
    cb(userIds);
  };
  const remove = (index, inx) => {
    let data = manyHills.value[index];
    data.personnelList.splice(inx, 1);
  };
  const isRequired = (item) => {
    if (props.type !== 'view') {
      if (item.type === '1' && item.currentNode === '0') {
        return true;
      } else if ((item.type === '2' || item.type === '3') && item.currentNode === '1') {
        return true;
      }
    }
    return false;
  };
  const validate = () => {
    return new Promise((resolve, reject) => {
      let arr = manyHills.value;
      const data = arr.filter((item) => item.personnelList && item.personnelList?.length > 0);
      for (let i = 0; i < data.length; i++) {
        if (
          (data[i].currentNode === '0' && data[i].type === '1') ||
          (data[i].currentNode === '1' && data[i].type === '2') ||
          (data[i].currentNode === '1' && data[i].type === '3')
        ) {
          const personnelList = data[i].personnelList;
          for (let j = 0; j < personnelList.length; j++) {
            if (personnelList[j].assignee === '' || !personnelList[j].assignee) {
              reject();
              return createMessage.info(`${data[i].name}为必填项！`);
            }
          }
        }
      }
      resolve({});
    });
  };
  defineExpose({ manyHills, current, validate });
</script>
<style lang="less" scoped>
  .approval {
    :deep(.ant-steps-item-title) {
      margin-bottom: 10px;
    }
    :deep(.ant-select-arrow) {
      top: 17px;
    }
    :deep(.ant-select-clear) {
      top: 15px;
    }
  }
  .approvalBlur {
    color: #4498f0;
  }
  .red {
    color: red;
  }
</style>
