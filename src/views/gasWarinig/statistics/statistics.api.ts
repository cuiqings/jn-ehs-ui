import { defHttp } from '/@/utils/http/axios';
export const statistics = () => {
  return defHttp.get({ url: '/coalGas/statistics' });
};
