<template>
    <div class="material">
        <div class="hd">
            <van-search v-model="queryParams.model" show-action placeholder="请输入搜索关键词" @search="onSearch">
                <template #action>
                    <div style="display: flex;align-items: center;">
                        <span @click="onSearch">搜索</span>
                        <div class="filter-btn" @click="openSearch">
                            <img src="../../../../assets/images/app/hazardous/filter.png" />
                        </div>
                    </div>
                </template>
            </van-search>
        </div>
        <div class="main">
            <div class="tab">
                <div class="mytab-body">
                    <div class="tab-item" @click="handleTabChange(item, idx)" :class="{active: activeIndex == idx}" v-for="(item, idx) in statisticsData">
                        {{ item.name + '('+item.number+')' }}
                    </div>
                </div>
            </div>
            <div class="tab-body">
                <List 
                    :isChecked="checkIng" list-type="material" 
                    :immediate-check="false" :total="total" ref="listRef" 
                    @openDetail="openDetail" 
                    @onLoad="onLoad" 
                    @onRefresh="onRefresh"
                    :list="list" />
            </div>
        </div>
        <div class="foot">
            <van-button type="primary" v-show="!checkIng" @click="checkIng = true">批量检验</van-button>
            <van-button type="default" v-show="checkIng" @click="checkCancle">取消</van-button>
            <van-button type="primary" v-show="checkIng" @click="checkConfirm">检验</van-button>
        </div>
    </div>
    <SearchWrap v-model:visible="isShowSearch" @confirm="onSearch" @reset="onCancel">
        <template #default>
             <van-field
                v-model="queryParams.orgCodeName"
                readonly
                name="orgCodeName"
                label="所属单位："
                placeholder="请选择"
                @click="showPicker.orgCode = true"
                />
            <van-field
                v-model="queryParams.workshopName"
                readonly
                name="workshopName"
                label="所属车间："
                placeholder="请选择"
                @click="showPicker.workshop = true"
                />
            <van-field
                v-model="queryParams.model"
                name="model"
                label="型号："
                placeholder="请输入"
                />
            <van-field
                v-model="queryParams.dutyUserName"
                name="dutyUserName"
                label="责任人："
                placeholder="请输入"
                />
        </template>
    </SearchWrap>
    <!--所属单位-->
    <van-popup v-model:show="showPicker.orgCode" position="bottom">
      <van-picker :columns-field-names="{text: 'departName', value: 'orgCode'}" :columns="selectList.orgCode" @cancel="showPicker.orgCode = false" @confirm="onConfirm($event, 'orgCode')" />
    </van-popup>
     <!--所属车间-->
    <van-popup v-model:show="showPicker.workshop" position="bottom">
      <van-picker :columns-field-names="{text: 'departName', value: 'orgCode'}" :columns="selectList.workshop" @cancel="showPicker.workshop = false" @confirm="onConfirm($event, 'workshop')" />
    </van-popup>
    <CheckDetail v-model:visable="checkVisable" :checkData="checkSelectList" @success="checkSuccess"/>
</template>
<script setup lang="ts">
import { suppliesPageList, statisticsApp } from '/@/views/emergencyNew/api';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import SearchWrap from '../../components/searchWrap.vue'
import CheckDetail from './checkDialog.vue';
import List from '../components/list.vue';
import { useRouter } from 'vue-router';
import { ref, nextTick } from 'vue';
import { showToast } from 'vant';
const listRef = ref<InstanceType<typeof List> | null>(null)
const list = ref([])
const total = ref(0)
const pageSize = ref(10)
const name = ref('')
const router = useRouter()
const queryParams = ref({
    orgCode: '',
    orgCodeName: '',
    workshop: '',
    workshopName: '',
    dutyUserName: '',
    model: '',
    category: ''
})
const showPicker = ref({
    orgCode: false,
    workshop: false
})
const selectList = ref({
    orgCode: [],
    workshop: []
})
const checkIng = ref(false)
const activeIndex = ref(0)

const onLoad = async (params) => {
    await getPageList(params)
    nextTick(() => {
        listRef.value?.loadEnd();
    });
}

const onSearch = () => {
    onRefresh({});
    gerStatisticsData()
}
const onCancel = () => {
    queryParams.value.orgCode = '';
    queryParams.value.orgCodeName = '';
    queryParams.value.workshop = '';
    queryParams.value.workshopName = '';
    queryParams.value.dutyUserName = '';
    queryParams.value.model = '';
     if(selectList.value.orgCode.length == 1) {
        queryParams.value.orgCode = selectList.value.orgCode[0].orgCode
        queryParams.value.orgCodeName = selectList.value.orgCode[0].departName
     }
    onSearch();
}
const onRefresh = async (params) => {
    await getPageList(params)
    nextTick(() => {
        listRef.value?.refreshEnd();
    });
}
const statisticsData = ref<any>({items: []})
const pageInit = async () => {
    selectList.value.orgCode = await getDepart3ListWithSecurity();
    if(selectList.value.orgCode.length == 1) {
        queryParams.value.orgCode = selectList.value.orgCode[0].orgCode
        queryParams.value.orgCodeName = selectList.value.orgCode[0].departName
        getworkshopList();
    }
    await gerStatisticsData();
    onRefresh({});
}
pageInit();

async function gerStatisticsData() {
    statisticsData.value = await statisticsApp({orgCode: queryParams.value.orgCode, workshop: queryParams.value.workshop})
    queryParams.value.category = statisticsData.value[0].code
}

const handleTabChange = (item, idx) => {
    activeIndex.value = idx;
    checkIng.value = false;
    queryParams.value.category = item.code;
    onRefresh({});
}

const getPageList = async (params) => { 
    const res = await suppliesPageList({...params, ...queryParams.value})
    total.value = res.total
    list.value = res.records
}

const getworkshopList = async () => { 
    selectList.value.workshop = await selectDeptNew({orgCode: queryParams.value.orgCode});
}

const openDetail = (item) => {
    router.push({
        path: '/app/emergencyNew/materialdetail',
        query: {
            id: item.id
        }
    })
}
const isShowSearch = ref(false);
const openSearch = () => {
    isShowSearch.value = true
}
const onConfirm = (e, key) => {
    console.log(e, key);
    queryParams.value[key] = e.selectedValues[0];
    queryParams.value[key + 'Name'] = e.selectedOptions[0].departName;
    showPicker.value[key] = false;
}

// 检验
const checkVisable = ref(false);
const checkSelectList = ref([]);
const checkCancle = () => {
    checkIng.value = false;
}
const checkConfirm = () => { 
    checkSelectList.value = []
    list.value.forEach(item => {
        if(item.checked){
            checkSelectList.value.push(item)
        }
    })
    if(checkSelectList.value.length == 0) {
        showToast('请选择检验数据！');
        return;
    }
    checkVisable.value = true;
}
// 检验弹框关闭
const checkSuccess = () => {
    onSearch();
    checkIng.value = false;
}

</script>
<style lang="less" scoped>
.material {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;

    .hd {
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: #333;
    }

    .main {
        flex: 1;
        overflow-y: auto;
        background-color: #f5f5f5;
        display: flex;
        flex-direction: column;
        .tab-body{
            flex: 1;
            padding: 10px 16px;
        }
    }
    .foot{
        height: 45px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #ffffff;
    }

    .filter-btn {
        margin-left: 10px;

        img {
            width: 25px;
            height: 25px;
        }
    }
    .tab{
        width: 100%;
        height: 45px;
        display: flex;
        overflow: hidden;
        background-color: #ffffff;
        position: relative;
        .mytab-body{
            overflow: hidden;
            overflow-x: auto;
            display: flex;
            width: 100%;
            align-items: center;
            flex-wrap: nowrap;
            padding-bottom: 40px;
            box-sizing: content-box;
            position: absolute;
            top: 0;
            left: 0;
            .tab-item{
                padding: 0 10px;
                height: 45px;
                line-height: 45px;
                font-size: 14px;
                color: #333333;
                border-bottom: 2px solid transparent;
                white-space: nowrap;
                &.active{
                    font-weight: 600;
                    border-bottom: 2px solid #1989fa;
                }
            }
        }
    }
}
</style>
