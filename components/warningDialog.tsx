import { Dialog, DialogTitle } from "@mui/material";
import { useState } from "react";

const WarningDialog: React.FC<{
  title: string;
  desc: string;
  action: Function;
}> = ({ title, desc, action }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const dialogOpenHandler = () => {
    setIsDialogOpen((value) => !value);
  };

  const acceptHandler = () => {
    action();
    setIsDialogOpen((value) => !value);
  };

  return (
    <Dialog onClose={() => {}} open={isDialogOpen}>
      <DialogTitle>{title}</DialogTitle>
      <div className="p-3">
        <p>
          <strong>{desc}</strong>
        </p>

        <div className="text-center">
          <button className="btn btn-success m-3" onClick={acceptHandler}>
            OK
          </button>
          <button className="btn btn-danger m-3" onClick={dialogOpenHandler}>
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default WarningDialog;
