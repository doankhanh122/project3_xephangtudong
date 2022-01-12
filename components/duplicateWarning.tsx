import { Dialog, DialogTitle } from "@mui/material";
import { useState } from "react";

const DuplicateWarning: React.FC<{
  confirm: Function;
}> = ({ confirm }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const dialogOpenHandler = () => {
    setIsDialogOpen((value) => !value);
  };

  const updateDuplicate = () => {
    confirm();
    setIsDialogOpen((value) => !value);
  };

  return (
    <Dialog onClose={() => {}} open={isDialogOpen}>
      <DialogTitle>
        Bạn đã lấy số STT cho địa điểm này, bạn có chắc chắn muốn lấy lại STT
        mới?
      </DialogTitle>
      <div className="text-center">
        <button className="btn btn-success m-3" onClick={updateDuplicate}>
          Lấy số thứ tự
        </button>
        <button className="btn btn-danger m-3" onClick={dialogOpenHandler}>
          Hủy
        </button>
      </div>
    </Dialog>
  );
};

export default DuplicateWarning;
