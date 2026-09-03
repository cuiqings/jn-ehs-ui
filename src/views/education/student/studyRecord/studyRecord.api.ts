import { defHttp } from '/@/utils/http/axios';
import { useFileList } from '/@/components/jeecg/comment/useComment';
import { Modal } from 'ant-design-vue';

export const { viewImage } = useFileList();

enum Api {
  certList = '/edu/user/certList',
  courseList = '/edu/user/studyList',
}

export const getCertList = (params) => defHttp.get({ url: Api.certList, params: params });
export const getCourseList = (params) => defHttp.get({ url: Api.courseList, params: params });