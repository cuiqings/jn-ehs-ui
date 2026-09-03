<template>
    <div class="ledger">
        <div class="hd">
            <van-search v-model="queryParams.name" show-action placeholder="请输入姓名" @search="onSearch">
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
            <List :total="total" list-type="2" ref="listRef" @onLoad="onLoad" @openDetail="openDetail" @onRefresh="onRefresh"
                :list="datalist">
                <template #btn="{ item }">
                    <div style="display: flex;justify-content: flex-end;">
                        <van-button style="margin-left: 10px;" plain type="primary"
                            @click.stop="openDetail(item)">查看详情</van-button>
                    </div>
                </template>
            </List>
        </div>

        <SearchWrap v-model:visible="isShowSearch" @confirm="onSearch" @reset="resetSearch">
            <template #default>
                <van-field label-align="top" v-model="queryParams.orgCodeName" readonly name="orgCodeName" label="所属单位："
                    placeholder="请选择" @click="showPicker.orgCode = true" />

                <van-field label-align="top" v-model="queryParams.workshopName" readonly name="workshopName"
                    label="所属车间：" placeholder="请选择" @click="showPicker.workshop = true" />

                <van-field label-align="top" v-model="queryParams.post" name="post" label="岗位：" placeholder="请输入" />

                <van-field label-align="top" v-model="queryParams.name" name="name" label="姓名：" placeholder="请输入" />

                <van-field label-align="top" v-model="queryParams.statusName" readonly name="status" label="状态："
                    placeholder="请选择" @click="showPicker.status = true" />
            </template>
        </SearchWrap>

        <!--所属单位-->
        <van-popup v-model:show="showPicker.orgCode" position="bottom">
            <van-picker :columns-field-names="{ text: 'departName', value: 'orgCode' }" :columns="selectList.orgCode"
                @cancel="showPicker.orgCode = false" @confirm="onConfirm($event, 'orgCode')" />
        </van-popup>

        <!--所属车间-->
        <van-popup v-model:show="showPicker.workshop" position="bottom">
            <van-picker :columns-field-names="{ text: 'departName', value: 'orgCode' }" :columns="selectList.workshop"
                @cancel="showPicker.workshop = false" @confirm="onConfirm($event, 'workshop')" />
        </van-popup>

        <!--状态：-->
        <van-popup v-model:show="showPicker.status" position="bottom">
            <van-picker :columns="selectList.status" @cancel="showPicker.status = false"
                @confirm="onConfirm($event, 'status')" />
        </van-popup>
    </div>
</template>
<script setup lang="ts">
import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
import { archivesPageList, physicalExaminationDel } from '/@/views/occupationalHealth/api';
import SearchWrap from '../../components/searchWrap.vue'
import { ref, nextTick, onMounted } from 'vue';
import { showConfirmDialog } from 'vant';
import List from '../components/list.vue';
import { useRouter } from 'vue-router';
const listRef = ref<InstanceType<typeof List> | null>(null)
const datalist = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const name = ref('')
const router = useRouter()
const queryParams = ref({
    orgCode: '',
    orgCodeName: '',
    workshop: '',
    workshopName: '',
    post: '',
    name: '',
    status: '',
    statusName: '',
    checkResult: '',
    checkResultName: '',
    typeName: '',
    type: ''

})
const showPicker = ref({
    orgCode: false,
    workshop: false,
    status: false,
    checkResult: false,
    type: false
})
const selectList = ref({
    orgCode: [],
    workshop: [],
    status: [
        {
            text: '未完成',
            value: '0',
        },
        {
            text: '完成',
            value: '1',
        },
    ],
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
        text: '离岗',
        value: '3' ,
      }
    ]
})

const applicationUnitList = ref<any[]>([])
onMounted(async () => {
    const { applicationUnitList: list } = await useDepartList(9);
    applicationUnitList.value = list.value;
})
const isShowSearch = ref(false)
const openSearch = () => {
    isShowSearch.value = true
}
const onLoad = async (params) => {
    let res = await getList(params)
    datalist.value = [...datalist.value, ...res];
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
const resetSearch = () => {
    queryParams.value = {
        drillContent: '',
        orgCode: undefined,
        drillLocation: '',
        enforceDate: ''
    }
    onRefresh({
        name: name.value,
        pageNo: 1,
        pageSize: pageSize.value
    })
}
const onRefresh = async (params) => {
    let res = await getList(params);
    datalist.value = res;
    nextTick(() => {
        listRef.value?.refreshEnd();
    });
}
const pageInit = async () => {
    selectList.value.orgCode = await getDepart3ListWithSecurity();
    if (selectList.value.orgCode.length == 1) {
        queryParams.value.orgCode = selectList.value.orgCode[0].orgCode
        queryParams.value.orgCodeName = selectList.value.orgCode[0].departName
        getworkshopList();
    }
}
pageInit();

const getList = async (params) => {
    const res = await archivesPageList({  ...params, ...queryParams.value })
    total.value = res.total
    return res.records
}
const getworkshopList = async () => {
    selectList.value.workshop = await selectDeptNew({ orgCode: queryParams.value.orgCode });
}

const openDetail = (item) => {
    router.push({
        path: '/app/occupationalHealthFile/detail',
        query: {
            id: item.id,
            type: 'detail'
        }
    })
}
const onConfirm = (value, key) => {
    switch (key) {
        case 'orgCode':
            queryParams.value[key] = value.selectedValues[0];
            queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
            showPicker.value[key] = false
            getworkshopList();
            break;
        case 'workshop':
            queryParams.value[key] = value.selectedValues[0];
            queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
            showPicker.value[key] = false
            break;
        default:
            queryParams.value[key] = value.selectedValues[0];
            queryParams.value[key + 'Name'] = value.selectedOptions[0].text;
            showPicker.value[key] = false
            break;
    }
}


</script>
<style lang="less" scoped>
.ledger {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;

    .hd {
        height: 54px;
        line-height: 54px;
        font-size: 14px;
        color: #333;
    }

    .filter-btn {
        margin-left: 10px;

        img {
            width: 25px;
            height: 25px;
        }
    }

    .main {
        flex: 1;
        overflow-y: auto;
        padding: 10px 16px;
    }
}
</style>
