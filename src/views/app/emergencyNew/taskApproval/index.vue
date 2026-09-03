<template>
    <div class="ledger">
        <List 
            list-type="task"
            :total="total" 
            ref="listRef" 
            @openDetail="openDetail" 
            @onLoad="onLoad" 
            @onRefresh="onRefresh" 
            :list="list">
            <template #btn="{item}">
                <van-button type="primary"
                @click.stop="approveClick(item)">去审批</van-button>
                <van-button type="primary" @click.stop="openDetail(item)">查看详情</van-button>
            </template>
        </List>
    </div>
</template>
<script setup lang="ts">
import { approvalList, startDrill } from '/@/views/emergencyNew/api';
import List from '../components/list.vue';
import { useRouter } from 'vue-router';
import { ref, nextTick } from 'vue';
const listRef = ref<InstanceType<typeof List>|null>(null)
const list = ref([])
const total = ref(0)
const pageSize = ref(10)
const name = ref('')
const router = useRouter()
const onLoad = async (params) => {
    await pageInit(params)
    nextTick(() => {
      listRef.value?.loadEnd();
    });
}
const onSearch = () => {
    onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value
    })
}
const onRefresh = async (params) => {
    await pageInit(params)
    nextTick(() => {
      listRef.value?.refreshEnd();
    });
}
const pageInit = async (params) => {
  const res = await approvalList({...params, status: 0})
  total.value = res.total
  res.records.forEach(item => {
    try{
      item.drillEmergencyPlan = JSON.parse(item.drillEmergencyPlan).join(',')
    } catch(e) {
      console.log(e)
    }
  })
  list.value = res.records
}

const openDetail = (item) => {
  router.push({
    path: '/app/emergencyNew/taskDetail',
    query: {
      id: item.id
    }
  })
}
const approveClick = (item) => {
    router.push({
        path: '/app/emergencyNew/taskApprovalDetail',
        query: {
            id: item.id,
            title: '审批详情'
        }
    })
}


</script>
<style lang="less" scoped>
.ledger{
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    overflow-y: auto;
    padding: 10px 16px;
}
</style>
