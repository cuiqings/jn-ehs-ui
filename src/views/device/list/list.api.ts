import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
    list = '/device/listDevicePage',
    save = '/device/save',
    edit = '/device/save',
    delete = '/device/delDeviceBatch',
    deleteBatch = '/device/delDeviceBatch',
    exportXls = '/device/exportDevicePage',
    importExcel = '/device/importExcelDevice',
    orgList = '/sys/sysDepart/selectLine',
    deviceList = '/hiddenDangerChecks/jnYhCheckItem/getDevice',
    riskPointsList = '/hiddenDangerChecks/jnYhCheckItem/getRisk',
    deviceById = '/hiddenDangerChecks/jnYhCheckItem/getDeviceById',
    riskPointsById = '/hiddenDangerChecks/jnYhCheckItem/getRiskById',
    isExist = '/hiddenDangerChecks/jnYhCheckItem/isExist',
    channelList = '/device/listChannel',
    attributeList = '/daqPoint/listNotBoundPointPage',
    paramListByDeviceId = '/device/listDeviceParamPage',
    atributeListByDeviceId = '/device/listPointByDeviceId',
    deleteAttribute = '/device/delDeviceToPoint',
}

/**
 * 导出url
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入url
 */
export const getImportUrl = Api.importExcel;
/**
 * 查询租户列表
 * @param params
 */
export const getList = (params) => {
    return defHttp.get({ url: Api.list, params });
};
/**
 * 保存或者更新通告
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
    let url = isUpdate ? Api.edit : Api.save;
    return defHttp.post({ url: url, params });
};

/**
 * 删除
 * @param params
 */
export const deleteRecord = (params, handleSuccess) => {
    return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
    });
};

/**
 * 批量删除
 * @param params
 */
export const batchDeleteRecord = (params, handleSuccess) => {
    Modal.confirm({
        title: '确认删除',
        content: '是否删除选中数据',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
            return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
                handleSuccess();
            });
        },
    });
};
export const getChannelNumber = () => {
    return defHttp.get({ url: Api.channelList });
}
export const getAttributeList = (params) => {
    return defHttp.get({ url: Api.attributeList, params });
}
export const getParamListByDeviceId = (params) => {
    return defHttp.get({ url: Api.paramListByDeviceId, params });
}
export const getAttributeListByDeviceId = (params) => {
    return defHttp.get({ url: Api.atributeListByDeviceId, params });
}
/**
 * 删除属性
 * @param params
 */
export const deleteAttribute = (params) => {
    return defHttp.delete({ url: Api.deleteAttribute, data: params }, { joinParamsToUrl: true });
};

