import { Dialog, DialogTitle } from "@mui/material";
import { useState } from "react";
import { Queue } from "../pages";

const GetNumberDialog: React.FC<{
  queue: Queue;
  insertCustomerToQueue: Function;
}> = ({ queue, insertCustomerToQueue }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const dialogOpenHandler = () => {
    setIsDialogOpen((value) => !value);
  };

  const getNumberHandler = () => {
    insertCustomerToQueue();
    setIsDialogOpen((value) => !value);
  };

  return (
    <Dialog onClose={() => {}} open={isDialogOpen}>
      <DialogTitle>Bạn chắc chắn muốn lấy STT cho địa điểm này?</DialogTitle>
      <div className="p-3">
        <p>
          <strong>{queue.Place}</strong>
        </p>

        <p>
          Thời gian: từ {queue.EffectFrom.toLocaleString("vi-VN")} đến{" "}
          {queue.EffectTo.toLocaleString("vi-VN")}
        </p>
        {/* <p>ID: {customerQueue?.QueueID}</p>

    <p>Code: {customerQueue?.Code}</p> */}

        <div className="text-center">
          <button className="btn btn-success m-3" onClick={getNumberHandler}>
            Lấy số thứ tự
          </button>
          <button className="btn btn-danger m-3" onClick={dialogOpenHandler}>
            Hủy
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default GetNumberDialog;
