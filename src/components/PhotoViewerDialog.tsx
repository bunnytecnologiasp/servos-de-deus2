import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoViewerDialogProps {
  trigger: React.ReactNode;
  photoUrl: string;
  altText: string;
}

const PhotoViewerDialog: React.FC<PhotoViewerDialogProps> = ({ trigger, photoUrl, altText }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 border-none bg-transparent shadow-none">
        <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
          <img
            src={photoUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 z-50"
            title="Fechar"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoViewerDialog;