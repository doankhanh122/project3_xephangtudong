import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

const WarningDialog: React.FC<{
  title: string;
  desc: string;
  action: Function;
  cancel?: Function;
}> = ({ title, desc, action, cancel }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const closeDialog = () => {
    setIsDialogOpen(false);
    cancel && cancel();
  };

  const acceptHandler = () => {
    action();
    setIsDialogOpen(false);
  };

  return (
    <Dialog onClose={() => {}} open={isDialogOpen}>
      <DialogTitle>
        <strong>{title}</strong>
      </DialogTitle>
      <DialogContent>
        <div className="p-3">
          <p>
            <strong>{desc}</strong>
          </p>
        </div>
      </DialogContent>
      <div className="text-center">
        <button className="btn btn-success m-3" onClick={acceptHandler}>
          OK
        </button>
        <button className="btn btn-danger m-3" onClick={closeDialog}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
};

export default WarningDialog;
