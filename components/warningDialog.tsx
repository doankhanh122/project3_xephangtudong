import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

const WarningDialog: React.FC<{
  title: string;
  desc: string;
  action: Function;
  onClose: Function;
  open: boolean;
  withButton?: boolean;
}> = ({ title, desc, action, onClose, open, withButton = true }) => {
  // const [isDialogOpen, setIsDialogOpen] = useState(true);
  const onCloseHandler = () => {
    onClose();
  };

  const acceptHandler = () => {
    action();
  };

  return (
    <Dialog onClose={onCloseHandler} open={open}>
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
      {withButton && (
        <div className="text-center">
          <button className="btn btn-success m-3" onClick={acceptHandler}>
            OK
          </button>
          <button className="btn btn-danger m-3" onClick={onCloseHandler}>
            Cancel
          </button>
        </div>
      )}
    </Dialog>
  );
};

export default WarningDialog;
