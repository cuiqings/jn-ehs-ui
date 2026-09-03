<template>
    <div class="ledger">
        <div class="hd">
            <van-search v-model="queryParams.name" show-action placeholder="请输入搜索关键词" @search="onSearch">
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
            <List list-type="ledger" :total="total" ref="listRef" @openDetail="openDetail" @onLoad="onLoad"
                @onRefresh="onRefresh" :list="list" />
        </div>
        <SearchWrap v-model:visible="isShowSearch" @confirm="onSearch" @reset="resetSearch">
            <template #default>
                <van-field readonly label-align="top" label="所属单位:" label-width="70px" placeholder="请选择">
                    <template #input>
                        <a-tree-select style="width: 100%" v-model:value="queryParams.orgCode" placeholder="请选择"
                            :tree-data="applicationUnitList" showSearch :dropdownStyle="{ zIndex: 3000 }"
                            tree-node-filter-prop="title"
                            :field-names="{ label: 'title', value: 'key', children: 'children' }" />
                    </template>
                </van-field>
                <van-field label-align="top" v-model="queryParams.categoryName" readonly name="categoryName" label="应急预案分类："
                    placeholder="请选择" @click="categoryShow = true" />
                <van-field label-align="top" v-model="queryParams.name" name="name" label="应急预案名称：" placeholder="请输入" />
            </template>
        </SearchWrap>
        <van-popup v-model:show="categoryShow" position="bottom">
            <van-picker :columns="categoryList"
                @cancel="categoryShow = false" @confirm="onConfirm" />
        </van-popup>
    </div>
</template>
<script setup lang="ts">
import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
import { ledgerPageList } from '/@/views/emergencyNew/api';
import SearchWrap from '../../components/searchWrap.vue';
import { ref, nextTick, onMounted } from 'vue';
import List from '../components/list.vue';
import { useRouter } from 'vue-router';
const listRef = ref<InstanceType<typeof List> | null>(null)
const list = ref([])
const total = ref(0)
const pageSize = ref(10)
const router = useRouter()
const applicationUnitList = ref<any[]>([]);
const queryParams = ref({
    name: '',
    pageNo: 1,
    pageSize: pageSize.value,
    orgCode: undefined,
    workshopName: '',
    category: '',
    categoryName: '',
})
const categoryShow = ref(false)
const categoryList = ref([
    {
        text: '综合应急预案',
        value: '1',
    },
    {
        text: '专项应急预案',
        value: '2',
    },
    {
        text: '现场处置方案',
        value: '3',
    },
    {
        text: '专项应急预案',
        value: '4',
    }
])

const onConfirm = (value) => {
    queryParams.value.category = value.selectedOptions[0].value
    queryParams.value.categoryName = value.selectedOptions[0].text
    categoryShow.value = false
}


onMounted(async () => {
    const { applicationUnitList: list } = await useDepartList(9, 1);
    applicationUnitList.value = list.value;
})
const onLoad = async (params) => {
    await pageInit(params)
    nextTick(() => {
        listRef.value?.loadEnd();
    });
}
const onSearch = () => {
    onRefresh({})
}
const onRefresh = async (params) => {
    await pageInit(params)
    nextTick(() => {
        listRef.value?.refreshEnd();
    });
}
const isShowSearch = ref(false)
const openSearch = () => {
    isShowSearch.value = true
}

const pageInit = async (params) => {
    const res = await ledgerPageList({...queryParams.value, ...params})
    total.value = res.total
    list.value = res.records
}

const openDetail = (item) => {
    router.push({
        path: '/app/emergencyNew/ledgerdetail',
        query: {
            id: item.id
        }
    })
}

const resetSearch = () => {
    isShowSearch.value = false
    queryParams.value = {
        name: '',
        pageNo: 1,
        pageSize: pageSize.value,
        orgCode: undefined,
        workshopName: '',
        category: '',
        categoryName: '',
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
