<template>
  <div class="duty-fill-modal">
    <!-- 基本信息表单 -->
    <van-form ref="formRef" label-width="100px">
      <van-field readonly v-model="formData.orgCode" label="所属单位" />
      <van-field readonly v-model="formData.workshop" label="所属车间">
        <template #input>
          <span>{{ formData.workshop || '无' }}</span>
        </template>
      </van-field>
      <van-field readonly v-model="formData.post" label="岗位" />
      <van-field readonly v-model="formData.cycleDate" label="考评周期" />
      <van-field readonly v-model="formData.realName" label="姓名" />
      
      <!-- 未执行提醒 -->
      <van-field name="remind" label="未执行提醒" v-if="showFooter">
        <template #input>
          <van-radio-group v-model="formData.remind" direction="horizontal" :disabled="!showFooter">
            <van-radio name="0">不提醒</van-radio>
            <van-radio name="1">提醒</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      
      <!-- 提醒方式 -->
      <van-field 
        v-if="formData.remind === '1' && showFooter" 
        name="remindType" 
        label="提醒方式"
        required
        :rules="[{ required: formData.remind === '1', message: '请选择提醒方式' }]"
      >
        <template #input>
          <van-checkbox-group v-model="formData.remindType" direction="horizontal" :disabled="!showFooter">
            <van-checkbox name="APP">APP</van-checkbox>
            <van-checkbox name="WEB">WEB</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>
    </van-form>
    
    <!-- 详情表格 -->
    <div v-if="!showFooter" class="detail-table">
      <van-collapse v-model="activeNames">
        <van-collapse-item 
          v-for="(group, groupIndex) in groupedDataSource" 
          :key="groupIndex"
          :title="`${group.serialNumber}. ${group.listDuties}`"
          :name="groupIndex"
        >
          <div class="task-info">
            <div class="task-title">任务清单：{{ group.taskList }}</div>
            <div class="task-items">
              <div 
                v-for="(item, itemIndex) in group.items" 
                :key="itemIndex"
                class="task-item"
              >
                <van-cell-group>
                  <van-cell title="考评标准" :value="item.evaluationCriteria" />
                  <van-cell title="数据来源" :value="getSourceText(item.source)" />
                  <van-cell title="类型" :value="getDataTypeText(item.dataType)" />
                  <van-cell title="状态" :value="item.status" />
                  <van-cell title="操作">
                    <template #value>
                      <div class="action-buttons">
                        <van-button 
                          v-if="item.dataType == '0'" 
                          type="primary" 
                          size="small" 
                          style="margin-right: 8px;"
                          @click="handleRealFill(item)"
                        >
                          填报
                        </van-button>
                        <van-button 
                          type="default" 
                          size="small" 
                          @click="handleView(item)"
                        >
                          查看
                        </van-button>
                      </div>
                    </template>
                  </van-cell>
                </van-cell-group>
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
    
    <!-- 底部按钮 -->
    <div v-if="showFooter" class="footer-buttons">
      <van-button size="large" @click="handleCancel">取消</van-button>
      <van-button size="large" type="primary" :loading="submitLoading" @click="handleSubmit">
        提交
      </van-button>
    </div>
    
    <!-- 填报抽屉 -->
    <van-popup 
      v-model:show="drawerVisible" 
      position="bottom" 
      :style="{ height: '80%', display: 'flex', flexDirection: 'column' }"
      closeable
      close-icon="close"
    >
      <div class="drawer-header">
        <h3>{{ drawerData.isView ? '查看详情' : '填报' }}</h3>
      </div>
      <div class="drawer-content">
        <FillDrawer 
          v-if="drawerVisible"
          :record="drawerData.record" 
          :is-view="drawerData.isView"
          @success="handleFillSuccess"
          @close="drawerVisible = false"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts" name="duty-fill-modal">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { showToast, showConfirmDialog } from 'vant';
  import { getFillDetail, saveOrUpdateWithFile } from '/@/views/safetyResponsibility/dutyFill/dutyFill.api';
  import FillDrawer from './components/FillDrawer.vue';

  const route = useRoute();
  const router = useRouter();
  
  /**
   * 表单数据接口定义
   */
  interface FormData {
    orgCode?: string;
    workshop?: string;
    post?: string;
    cycleDate?: string;
    realName?: string;
    remind?: string;
    remindType?: string[];
    itemlist?: any[];
  }

  /**
   * 响应式数据
   */
  const formRef = ref();
  const formData = ref<FormData>({});
  const dataSource = ref([]);
  const activeNames = ref<number[]>([]);
  const submitLoading = ref(false);
  const drawerVisible = ref(false);
  const drawerData = ref({ record: null, isView: false });
  
  // 从路由参数获取配置
  const isUpdate = ref(!!route.query.isUpdate);
  const showFooter = ref(route.query.showFooter !== 'false');
  const rowId = ref(route.query.id as string || '');

  /**
   * 计算属性 - 分组数据源
   * 将相同序号的数据分组显示
   */
  const groupedDataSource = computed(() => {
    const groups = new Map();
    
    dataSource.value.forEach((item: any) => {
      const key = item.serialNumber;
      if (!groups.has(key)) {
        groups.set(key, {
          serialNumber: item.serialNumber,
          listDuties: item.listDuties,
          taskList: item.taskList,
          items: []
        });
      }
      groups.get(key).items.push(item);
    });
    
    return Array.from(groups.values());
  });

  /**
   * 获取详情数据
   * @param id 记录ID
   */
  async function getDetailData(id: string) {
    try {
      const result = await getFillDetail({ id: id });
      formData.value = result || {};
      dataSource.value = result?.itemlist || [];
      
      // 默认展开所有折叠面板
      activeNames.value = groupedDataSource.value.map((_, index) => index);
    } catch (error) {
      console.error('获取详情失败:', error);
      showToast('获取数据失败');
    }
  }

  /**
   * 获取数据来源文本
   * @param source 数据来源值
   */
  function getSourceText(source: number): string {
    const sourceMap = {
      1: '自评',
      2: '系统获取'
    };
    return sourceMap[source] || '';
  }

  /**
   * 获取数据类型文本
   * @param dataType 数据类型值
   */
  function getDataTypeText(dataType: number): string {
    const typeMap = {
      0: '常规',
      1: '自由填写',
      2: '加分',
      3: '减分'
    };
    return typeMap[dataType] || '常规';
  }

  /**
   * 提交表单
   */
  async function handleSubmit() {
    try {
      await formRef.value?.validate();
      submitLoading.value = true;
      
      // 创建 FormData 对象
      const formDataObj = new FormData();
      
      // 添加表单数据到 FormData
      Object.keys(formData.value).forEach(key => {
        const value = formData.value[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formDataObj.append(key, value.join(','));
          } else {
            formDataObj.append(key, value);
          }
        }
      });
      
      // 添加 ID 字段
      if (rowId.value) {
        formDataObj.append('id', rowId.value);
      }
      
      // 调用API
      const result = await saveOrUpdateWithFile(formDataObj, isUpdate.value);
      
      if (result.success) {
        showToast(result.message || '操作成功');
        router.back();
      } else {
        showToast(result.message || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      showToast('提交失败');
    } finally {
      submitLoading.value = false;
    }
  }

  /**
   * 取消操作
   */
  function handleCancel() {
    router.back();
  }

  /**
   * 填报操作
   * @param record 记录数据
   */
  function handleRealFill(record: any) {
    drawerData.value = {
      record: record,
      isView: false
    };
    drawerVisible.value = true;
  }

  /**
   * 查看操作
   * @param record 记录数据
   */
  function handleView(record: any) {
    drawerData.value = {
      record: record,
      isView: true
    };
    drawerVisible.value = true;
  }

  /**
   * 填报成功回调
   */
  function handleFillSuccess() {
    drawerVisible.value = false;
    // 刷新数据
    if (rowId.value) {
      getDetailData(rowId.value);
    }
  }

  /**
   * 页面初始化
   */
  onMounted(() => {
    if (rowId.value) {
      getDetailData(rowId.value);
    }
  });
</script>

<style scoped lang="less">
  .duty-fill-modal {
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    
    .detail-table {
      flex: 1;
    // overflow-y: auto;
      padding: 6px;
      .task-info {
        .task-title {
          margin-bottom: 12px;
          color: #333;
        }
        .task-items {
          .task-item {
            margin-bottom: 16px;
            .action-buttons {
              .van-button {
                min-width: 60px;
              }
            }
          }
        }
      }
    }
    
    .footer-buttons {
      padding: 16px;
      background-color: #fff;
      display: flex;
      gap: 16px;
      
      .van-button {
        flex: 1;
      }
    }
    
    .drawer-header {
      padding: 16px;
      border-bottom: 1px solid #eee;
      background-color: #fff;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }
    
    .drawer-content {
      flex: 1;
      overflow: hidden;
      padding: 16px;
    }
  }
  
  :deep(.van-form) {
    background-color: #fff;
    
    .van-field {
      padding: 12px 16px;
    }
  }
  
  :deep(.van-collapse-item__title) {
    font-weight: 500;
    color: #333;
  }
  
  :deep(.van-cell) {
    padding: 8px 16px;
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  :deep(.van-radio-group) {
    display: flex;
    gap: 16px;
  }
  
  :deep(.van-checkbox-group) {
    display: flex;
    gap: 16px;
  }
</style>