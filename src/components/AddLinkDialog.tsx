import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import LinkForm from "./LinkForm";

interface AddLinkDialogProps {
  refetch: () => void;
}

const AddLinkDialog: React.FC<AddLinkDialogProps> = ({ refetch }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Link</DialogTitle>
        </DialogHeader>
        <LinkForm onSuccess={refetch} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkDialog;