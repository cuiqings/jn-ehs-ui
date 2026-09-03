
<template>
  <div class="person-info">
    <!-- 个人信息卡片 -->
    <div v-if="personData" class="person-card">
      <div class="person-header">
        <div class="person-name">
          {{ personData.workNo ? personData.realName + '（' + personData.workNo + '）' : personData.realName }}
        </div>
        <div class="person-status">
          <van-tag v-if="personData.userSign" type="success" size="medium">完成</van-tag>
        </div>
      </div>
      
      <div class="person-details">
        <div class="info-row">
          <span class="label">工号：</span>
          <span class="value">{{ personData.workNo || '002786' }}</span>
        </div>
        <div class="info-row">
          <span class="label">所属单位：</span>
          <span class="value">{{ personData.departCodeName ? personData.orgCodeName + '-' + personData.departCodeName : personData.orgCodeName }}</span>
        </div>
        <div class="info-row">
          <span class="label">身份证号：</span>
          <span class="value">{{ personData.idCard }}</span>
        </div>
        <div class="info-row">
          <span class="label">职务：</span>
          <span class="value">{{ personData.post }}</span>
        </div>
        <div class="info-row">
          <span class="label">年度培训课时要求：</span>
          <span class="value">{{ personData.duration }}</span>
        </div>
        <div class="info-row">
          <span class="label">本年度完成课时：</span>
          <span class="value">{{ personData.userDuration }}</span>
        </div>
      </div>

      <div class="person-actions">
        <van-button
          v-if="!personData.userSign"
          type="primary"
          size="small"
          @click="handleSelfSign"
        >
          本人签字
        </van-button>
        <van-button
          type="default"
          size="small"
          @click="handlePersonInfo"
        >
          人员信息
        </van-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-else class="loading-center" size="24px">加载中...</van-loading>

    <!-- 人员信息编辑弹窗 -->
    <PersonEditPopup
      v-model:show="showPersonEdit"
      :person-data="personData"
      @confirm="onPersonEditConfirm"
    />

    <!-- 本人签字弹窗 -->
    <SelfSignPopup
      v-model:show="showSelfSign"
      :person-data="personData"
      @confirm="onSelfSignConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '/@/store/modules/user'
import PersonEditPopup from './components/PersonEditPopup.vue'
import SelfSignPopup from './components/SelfSignPopup.vue'

// 引入API
import { list } from '/@/views/education/trainingManage/archive/archive.api'

// 定义人员数据类型
interface PersonData {
  id: string
  realName: string
  workNo: string
  userSign: string
  userId: string
  departCodeName: string
  orgCodeName: string
  idCard: string
  post: string
  duration: number
  userDuration: number
  [key: string]: any
}

const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)
console.log(userInfo, userInfo.value)

// 响应式数据
const personData = ref<PersonData | null>(null)

// 弹窗控制
const showPersonEdit = ref(false)
const showSelfSign = ref(false)

/**
 * 加载当前用户数据
 */
const loadPersonData = async () => {
  try {
    const params = {
      userId: userInfo.value.id,
      pageNo: 1,
      pageSize: 1
    }
    
    const result = await list(params)
    
    if (result && result.records && result.records.length > 0) {
      personData.value = result.records[0]
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast('加载数据失败')
  }
}

/**
 * 处理人员信息编辑
 */
const handlePersonInfo = () => {
  showPersonEdit.value = true
}

/**
 * 处理本人签字
 */
const handleSelfSign = () => {
  showSelfSign.value = true
}

/**
 * 人员信息编辑确认
 */
const onPersonEditConfirm = () => {
  showPersonEdit.value = false
  loadPersonData()
}

/**
 * 本人签字确认
 */
const onSelfSignConfirm = () => {
  showSelfSign.value = false
  loadPersonData()
}

// 组件挂载时加载数据
onMounted(() => {
  loadPersonData()
})
</script>

<style lang="less" scoped>
.person-info {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16px;

  .person-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .person-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .person-name {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      .person-status {
        flex-shrink: 0;
      }
    }

    .person-details {
      margin-bottom: 20px;

      .info-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.5;

        .label {
          color: #666;
          min-width: 140px;
          flex-shrink: 0;
        }

        .value {
          color: #333;
          flex: 1;
          word-break: break-all;
        }
      }
    }

    .person-actions {
      display: flex;
      gap: 12px;
      justify-content: center;

      .van-button {
        flex: 1;
        max-width: 120px;
      }
    }
  }

  .loading-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #999;
  }
}
</style>