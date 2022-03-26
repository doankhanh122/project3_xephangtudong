import { Dialog, DialogTitle } from "@mui/material";
import { queue } from "@prisma/client";
import { useState } from "react";

const GetNumberDialog: React.FC<{
  queue: queue | undefined;
  insertCustomerToQueue: Function;
  onClose: Function;
  open: boolean;
}> = ({ queue, insertCustomerToQueue, onClose, open }) => {
  const onCloseHandler = () => {
    onClose();
  };

  const getNumberHandler = () => {
    onClose();
    insertCustomerToQueue();
  };

  return (
    <Dialog onClose={onCloseHandler} open={open}>
      <DialogTitle>Bạn chắc chắn muốn lấy STT cho địa điểm này?</DialogTitle>
      <div className="p-3">
        <p>
          <strong>{queue && queue.Place}</strong>
        </p>

        <p>
          Thời gian: từ{" "}
          {queue &&
            queue.EffectFrom &&
            new Date(queue.EffectFrom).toLocaleString("vi-VN")}{" "}
          đến{" "}
          {queue &&
            queue.EffectTo &&
            new Date(queue.EffectTo).toLocaleString("vi-VN")}
        </p>

        <div className="text-center">
          <button className="btn btn-success m-3" onClick={getNumberHandler}>
            Lấy số thứ tự
          </button>
          <button className="btn btn-danger m-3" onClick={onCloseHandler}>
            Hủy
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default GetNumberDialog;
