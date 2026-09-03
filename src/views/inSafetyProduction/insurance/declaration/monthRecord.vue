<template>
    <div class="p-1">
        <BasicTable @register="registerTable">
            <template #status="{ record }">
                <a-tag color="green" v-if="record.insuranceType == 1">正常参保</a-tag>
                <a-tag color="blue" v-if="record.insuranceType == 2">灵活用工</a-tag>
            </template>
            <!--操作栏-->
            <template #action="{ record }">
                <TableAction :actions="getTableAction(record)" />
            </template>
        </BasicTable>
        <CheckModal @register="registerCheckModal" @submitSuccess="submitSuccess" />
    </div>
</template>

<script lang="ts" name="occupationalHealth-files" setup>
import { BasicTable, TableAction } from '/@/components/Table';
import { useMethods } from '/@/hooks/system/useMethods';
import { useContent } from './hooks/useContentMonth';
import CheckModal from './components/checkModal.vue';

const {
    registerTable, getTableAction, registerCheckModal,
    reload } = useContent();

const submitSuccess = () => {
    reload()
}


//导入模版下载
function onExportTemplateXls() {
    const { handleExportXls } = useMethods();
    let params = {};
    handleExportXls('职业健康监护档案', '/archives/importTemplate', params);
}


</script>
<style lang="less" scoped>
.p-1{
    :deep(.ant-table-title){
        display: none;
    }
}
</style>