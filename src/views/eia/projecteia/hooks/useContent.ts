
import { useModal } from '/@/components/Modal';


export const useContent = () => {
  // 添加项目
  const [registerModal, { openModal }] = useModal();
  // 资料补充
  const [eiaExtraAddInfoModal, extralModal] = useModal();
  // 详情
  const [viewDetailModal, detailModal] = useModal();

  // 环评完成查看详情
  const [eiaCompleteDetaillModal, eiaCompleteModal] = useModal();

  // 排序许可查看详情
  const [pollutionDischargeModal, pollDischargeModal] = useModal();


    // 待验收查看详情
    const [pendingAcceptModal, pendAcceptModal] = useModal();

    // 已验收查看详情
    const [acceptedDetailModal, acceptedModal] = useModal();

  // 项目添加
  const eiaAddProject = (record) => {
    record.applyId = record.id;
    openModal(true, {
      record,
    });
  };


  // 资料补充弹框
  const handleExtralModal = (record,type) => {
    // 排污资料补充(查看详情入口)
    if(type != '3-in'){
      record.applyId = record.id;
      record.type = type;
    }
    if(type == '3-in'){
      record.type = '3';
    }

    console.log( record);
    extralModal.openModal(true, record);
  };
 
   // 查看详情
   const handleDetailModal = (record) => {
    
    record.applyId = record.id;
    console.log( record);
    detailModal.openModal(true, record);
  };

   // 环评完成查看详情
   const handleEiaCompletelModal = (record,steps) => {
    record.steps = steps; 
    record.applyId = record.id;
    console.log( record);
    eiaCompleteModal.openModal(true, record);
  };
 
     // 排污许可查看详情
     const handleEiaPollutionDischargeModal = (record) => {
      record.applyId = record.id;
      console.log( record);
      pollDischargeModal.openModal(true, record);
    };


    // 待验收查看详情
    const handleEhsEiaPendingAcceptModal = (record) => {
      record.applyId = record.id;
      console.log( record);
      pendAcceptModal.openModal(true, record);
    };

    // 已验收查看详情
    const handleEhsEiaAcceptedModal = (record,steps) => {
      record.steps = steps; 
      record.applyId = record.id;
      console.log( record);
      acceptedModal.openModal(true, record);
    };


  return {
    
    eiaAddProject,
    registerModal,
    handleExtralModal,
    eiaExtraAddInfoModal,
    viewDetailModal,
    handleDetailModal,
    handleEiaCompletelModal,
    eiaCompleteDetaillModal,
    handleEiaPollutionDischargeModal,
    pollutionDischargeModal,
    handleEhsEiaPendingAcceptModal,
    pendingAcceptModal,
    handleEhsEiaAcceptedModal,
    acceptedDetailModal

    
  };
};
export default useContent;
