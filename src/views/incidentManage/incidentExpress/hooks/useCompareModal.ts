import { BasicModal, useModalInner } from '/@/components/Modal';
import * as Diff from 'diff';
import { reactive, nextTick, h, createApp, ref } from 'vue';
import { tableType } from '../index';
import { Avatar } from 'ant-design-vue';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { buttonAdd } from '../url/index';
import { useMessage } from '/@/hooks/web/useMessage';
export const useCompareModal = (emit: any, currentReportingRef: any, repeatWithThisRef: any) => {
  const { createMessage } = useMessage();
  let listData: tableType = reactive({});
  let listData1: tableType = reactive({});
  const confirmDuplicateLoading = ref(false);
  const keyObj = [
    {
      key: 'orgCode_dictText',
      label: '发生单位：',
    },
    {
      key: 'result_dictText',
      label: '事件结果：',
    },
    {
      key: 'type_dictText',
      label: '事件类型：',
    },
    {
      key: 'eventTime',
      label: '发生时间：',
    },
    {
      key: 'description',
      label: '事件描述：',
    },
    {
      key: 'address',
      label: '事件地点：',
    },
    {
      key: 'photo',
      label: '现场照片：',
    },
    {
      key: 'reporterName',
      label: '上报人员：',
    },
    {
      key: 'createTime',
      label: '上报时间：',
    },
  ];
  const [registerModal, { closeModal, redoModalHeight }] = useModalInner((data) => {
    listData = data.current;
    listData1 = data.itself;
    create_vode(listData1, listData, currentReportingRef);
    create_vode(listData, listData1, repeatWithThisRef);
    nextTick(() => {
      redoModalHeight();
    });
  });
  const create_vode = (oldStr, newStr, _dom) => {
    const vode = h(
      'div',
      {
        style: { padding: '10px 10px 0 10px' },
      },
      keyObj.map((item) => {
        const result = Diff.diffChars(oldStr[item.key], newStr[item.key]);
        let photoArr = [];
        if (item.key === 'photo') photoArr = oldStr[item.key] ? oldStr[item.key].split(',') : [];
        return h('p', null, [
          h('span', item.label),
          h(
            'span',
            {
              style: item.key === 'photo' ? 'display: block' : '',
            },
            item.key === 'photo'
              ? photoArr.map((ite) => {
                  return h(Avatar, {
                    src: getFileAccessHttpUrl(ite),
                    shape: 'square',
                    size: 80,
                    style: { margin: '10px' },
                  });
                })
              : result.map((ite) => {
                  if (ite.remove || !ite.added) {
                    return h('span', { style: { color: ite.removed ? 'red' : '' } }, ite.value);
                  }
                })
          ),
        ]);
      })
    );
    createApp({ render: () => vode }).mount(_dom.value);
  };
  const confirmDuplicate = () => {
    confirmDuplicateLoading.value = true;
    buttonAdd({
      eventId: listData1.id,
      type: 1,
      repeatEventId: listData.id,
      repeatEventName: listData.name,
    })
      .then((res) => {
        if (res.success) {
          createMessage.success('提交成功！');
          closeModal();
          emit('success', 1);
        } else {
          createMessage.error(res.message);
        }
      })
      .finally(() => {
        confirmDuplicateLoading.value = false;
      });
  };
  return {
    registerModal,
    BasicModal,
    confirmDuplicate,
    confirmDuplicateLoading,
  };
};
export default useCompareModal;
