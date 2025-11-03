import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import LinkForm from "./LinkForm";
import { Link } from "@/types/link";

interface EditLinkDialogProps {
  link: Link;
  refetch: () => void;
}

const EditLinkDialog: React.FC<EditLinkDialogProps> = ({ link, refetch }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar">
          <Edit className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Link</DialogTitle>
        </DialogHeader>
        <LinkForm initialData={link} onSuccess={refetch} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkDialog;