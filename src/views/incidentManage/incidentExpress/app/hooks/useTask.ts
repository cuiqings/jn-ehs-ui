import { queryById, getOrganizationNew, buttonAdd } from '../../url/index';
import { getDictItemsByCode } from '/@/utils/dict/index';
import { useRouter } from 'vue-router';
import { watchEffect, reactive, ref } from 'vue';
import { showToast, showFailToast, showSuccessToast, showDialog } from 'vant';
import { usePermission } from '/@/hooks/web/usePermission';
export const useTask = () => {
  const router = useRouter();
  const { currentRoute } = router;
  const { hasPermission } = usePermission();
  const info: any = reactive({});
  const show = ref(false);
  const closeInfo = ref('');
  const investigationLoading = ref(false);
  const accidentLoading = ref(false);
  watchEffect(async () => {
    if (currentRoute.value.query.id) {
      await queryById({ id: currentRoute.value.query.id }).then((res) => {
        Object.assign(info, res);
      });
      await getOrganizationNew().then((res) => {
        const arry = res.filter((item) => item.orgCode === info.orgCode);
        info.orgCode = arry[0]?.departName;
      });
    }
  });
  const renderDict = (v, code) => {
    let text = '';
    const array = getDictItemsByCode(code) || [];
    const obj = array.filter((item) => item.value == v);
    if (obj.length > 0) {
      text = obj[0].text;
    }
    return text;
  };

  // 重复上报
  const onRepeat = () => {
    router.push({
      path: '/app/incidentManage/repeat',
      query: {
        id: currentRoute.value.query.id,
      },
    });
  };
  // 非事故关闭
  const nonAccidentClose = () => {
    show.value = true;
    closeInfo.value = '';
  };
  const beforeClose = (action) => {
    new Promise((resolve) => {
      setTimeout(() => {
        if (action === 'confirm' && closeInfo.value !== '') {
          resolve(true);
        } else {
          // 拦截取消操作
          resolve(false);
        }
        if (action === 'cancel') {
          resolve(true);
          show.value = false;
        }
      }, 50);
    });
  };
  const remarkConfirm = () => {
    if (closeInfo.value === '') {
      return showToast('请输入关闭说明！');
    }
    buttonAdd({
      eventId: info.id,
      closeInfo: closeInfo.value,
      type: 2,
    }).then((res) => {
      if (res.success) {
        show.value = false;
        router.push({
          path: '/app/incidentManage/details',
          query: {
            id: currentRoute.value.query.id,
          },
        });
      } else {
        showFailToast(res.message);
      }
    });
  };
  // 确认事故并上报
  const confirmAccident = () => {
    accidentLoading.value = true;
    buttonAdd({
      eventId: currentRoute.value.query.id,
      type: 3,
    })
      .then((res) => {
        if (res.success) {
          showSuccessToast('上报成功！');
          router.push({
            path: '/app/incidentManage/details',
            query: {
              id: currentRoute.value.query.id,
            },
          });
        } else {
          showFailToast(res.message);
        }
      })
      .finally(() => {
        accidentLoading.value = false;
      });
  };
  // 确认并结案
  const confirmAndCtc = () => {
    showDialog({
      title: '确认并结案',
      allowHtml: true,
      showCancelButton: true,
      message: "<div><div>是否确认当前事件上报内容，并结案？</div><div style='color:red'>说明：结案后不再上传调查报告</div></div>",
    }).then(() => {
      buttonAdd({ eventId: currentRoute.value.query.id, type: 4 }).then((res) => {
        if (res.success) {
          showSuccessToast('结案成功！');
          router.push({
            path: '/app/incidentManage/details',
            query: {
              id: currentRoute.value.query.id,
            },
          });
        } else {
          showFailToast(res.message);
        }
      });
    });
  };
  // 确认并调查
  const confirmAndInvestigation = () => {
    investigationLoading.value = true;
    buttonAdd({
      eventId: currentRoute.value.query.id,
      type: 5,
    })
      .then((res) => {
        if (res.success) {
          showSuccessToast('确认并调查成功！');
          router.push({
            path: '/app/incidentManage/details',
            query: {
              id: currentRoute.value.query.id,
            },
          });
        } else {
          showFailToast(res.message);
        }
      })
      .finally(() => {
        investigationLoading.value = false;
      });
  };
  return {
    info,
    renderDict,
    onRepeat,
    nonAccidentClose,
    confirmAccident,
    show,
    remarkConfirm,
    beforeClose,
    closeInfo,
    confirmAndCtc,
    confirmAndInvestigation,
    hasPermission,
    accidentLoading,
    investigationLoading,
  };
};
export default useTask;
