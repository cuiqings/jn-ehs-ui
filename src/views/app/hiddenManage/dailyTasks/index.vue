<!-- 审批任务 -->
<template>
  <div class="hd-edit">
    <div class="main">
      <van-form label-width="100px">
        <van-collapse v-model="activeNames">
          <van-collapse-item title="基本信息" name="1">
            <van-field readonly v-model="formData.orgName" name="orgName" label="所属单位" />
            <van-field readonly v-model="formData.departName" name="departName" label="所属车间" />
            <van-field readonly v-model="formData.planName" type="text" name="planName" label="计划名称" />
            <van-field readonly label="排查周期">
              <template #input>
                {{ filterDictTextByCache('sk_check_cycle', formData.checkCycle) }}
              </template>
            </van-field>
            <van-field readonly v-model="formData.checkDutyPersonName" type="text" name="checkDutyPersonName" label="排查责任人" />
          </van-collapse-item>
          <!-- <van-collapse-item title="检查记录" name="2">
            <van-field readonly v-model="formData.checkPersonName" type="text" name="checkPersonName" label="检查人" />
            <van-field readonly v-model="formData.checkTime" type="text" name="checkTime" label="检查时间" />
          </van-collapse-item> -->
          <van-collapse-item title="检查项" name="3">
            <div class="ex-result" v-for="(item, idx) in formData.itemList" :key="'c' + idx">
              <div class="ex-inner">
                <span class="label">{{ idx + 1 }}</span>
                <div class="projectinfo">
                  <div><label>辨识单元：</label>{{ item.recogUnit }}</div>
                  <div><label>风险部位：</label>{{ item.riskName }}</div>
                  <div><label>风险失控表现：</label>{{ item.riskFactor }}</div>
                </div>
              </div>
            </div>
          </van-collapse-item>
        </van-collapse>
      </van-form>
    </div>
    <div class="foot">
      <van-button type="warning" @click="transferClick" :loading="transferLoading">转处理</van-button>
      <van-button :loading="loading" @click="passClick" type="primary" style="margin-left: 30px">开始检查</van-button>
    </div>
    
    <!-- 人员选择弹窗 -->
    <UserSelectModal
      v-model="showUserModal"
      @confirm="onUserConfirm"
      @cancel="onUserCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { skYhPlanQueryById, setEmpty, changeHandler } from '../index.api';
  import { useUserStore } from '/@/store/modules/user';
  import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
  import { showToast } from 'vant';
  import UserSelectModal from './UserSelectModal.vue';

  interface IFormData {
    id?: string;
    org?: string;
    orgName?: string;
    departName?: string;
    planType: string;
    checkType?: string;
    checkTypeName?: string;
    planName?: string;
    checkCycle?: string;
    checkCycleName?: string;
    approveRoleName?: string;
    executeRoleName?: string;
    superviseRoleName?: string;
    checkDutyPerson?: string;
    checkDutyPersonName?: string;
    status?: number;
    itemList: any[];
    plan: any;
  }
  const activeNames = ref(['1']);
  const route = useRoute();
  const router = useRouter();
  const formData = reactive<IFormData>({
    plan: {},
    planType: '',
    itemList: [],
  });
  let pageName = ref(route.name);

  const userStore: any = useUserStore();
  const yh_inspection_cycleList = userStore.getAllDictItems.yh_inspection_cycle;
  const check_sortList = userStore.getAllDictItems.check_sort;

  const loading = ref(true);
  const transferLoading = ref(false);
  const showUserModal = ref(false);

  getDetail();
  function getDetail() {
    skYhPlanQueryById({
      id: route.query.id,
    })
      .then((res) => {
        Object.assign(formData, res);
        if (formData.status && formData.status > 0) {
          router.replace({ path: '/app/hiddenManage/dailyTasks/detail', query: { id: formData.id } });
        }
        // 添加状态安全检查
        const statusText = formData.status ? 
          (formData.status === 1 ? '待处理' : formData.status === 2 ? '处理中' : formData.status === 3 ? '已完成' : '未知状态') 
          : '状态未定义';
        loading.value = false;
        pageInit();
      })
      .catch((err) => (loading.value = false));
  }

  watch(route, (newRoute) => {
    pageName.value = newRoute.name;
  });

  function pageInit() {
    if (check_sortList.length && check_sortList.length > 0) {
      check_sortList.map((val) => {
        if (val.value == formData.checkType) {
          formData.checkTypeName = val.text;
        }
        if (formData.itemList.length && formData.itemList.length > 0) {
          formData.itemList.map((item) => {
            if (item.itemType == val.value) {
              item['itemTypeName'] = val.text;
            }
          });
        }
      });
    }

    if (yh_inspection_cycleList.length && yh_inspection_cycleList.length > 0) {
      yh_inspection_cycleList.map((val) => {
        if (val.value == formData.plan.checkCycle) {
          formData.plan.checkCycleName = val.text;
          return;
        }
      });
    }
  }

  // 通过
  const passClick = () => {
    router.replace({ path: '/app/hiddenManage/dailyTasks/executeTask', query: { id: route.query.id } });
  };

  /**
   * 转处理按钮点击事件
   * 显示用户选择弹窗
   */
  const transferClick = () => {
    showUserModal.value = true;
  };

  /**
   * 用户选择确认回调
   * @param {string} realNames 选中用户的真实姓名
   * @param {string} selectedNames 选中用户的显示名称
   * @param {string} orgCode 选中用户的机构代码
   * @param {Array} selectedUsers 选中的用户列表
   */
  const onUserConfirm = async (realNames: string, selectedNames: string, orgCode: string, selectedUsers: any[]) => {
    console.log('selectedUsers', selectedUsers);
    if (!selectedUsers || selectedUsers.length === 0) {
      showToast('请选择处理人员');
      return;
    }

    try {
      transferLoading.value = true;
      let executeIdList = []
      executeIdList.push(route.query.id)
      const params = {
        executeIdList:executeIdList,
        // userId: selectedUsers[0].id, // 取第一个选中用户的ID
        newUserName: selectedUsers[0].username, // 取第一个选中用户的姓名
      };
      await changeHandler(params);
      showToast('转处理成功');
      showUserModal.value = false;
      // 刷新页面数据
      getDetail();
    } catch (error) {
      showToast('转处理失败，请重试');
      console.error('转处理失败:', error);
    } finally {
      transferLoading.value = false;
    }
  };

  /**
   * 用户选择取消回调
   */
  const onUserCancel = () => {
    showUserModal.value = false;
  };

  const beforeClose = async (str) => {
    if (str === 'confirm') {
      setEmpty([{ id: route.query.id }]).then((res) => {
        getDetail();
      });
      return true;
    }
    return true;
  };
</script>
<style scoped lang="less">
  .hd-edit {
    width: 100%;
    height: 100%;
    padding-bottom: 55px;
    .main {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      .ex-result {
        padding: 10px;
        .ex-inner {
          display: flex;
          padding-left: 16px;
          background: #eff1f5;
          align-items: center;
          border-radius: 4px;
          color: #333333;
          .label {
            width: 18px;
            height: 18px;
            border: 1px solid #999999;
            border-radius: 50%;
            text-align: center;
            line-height: 16px;
          }
          .van-cell {
            padding: 10px 5px;
          }
          .projectinfo {
            flex: 1;
            font-size: 14px;
            padding: 10px;
            line-height: 32px;
            color: #333333;
            label {
              width: 80px;
              text-align: left;
              font-weight: 600;
            }
          }
        }
      }
    }
    .foot {
      width: 100%;
      height: 55px;
      padding: 0 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #f5f5f5;
    }
  }
  :deep(.van-collapse-item) {
    .van-collapse-item__title {
      .van-cell__title {
        color: #1989fa !important;
      }
    }
  }
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .restmain {
    font-size: 14px;
    padding: 10px 30px;
    line-height: 32px;
    color: #333;
    span {
      display: inline-block;
      width: 70px;
      color: #111;
    }
  }
</style>
