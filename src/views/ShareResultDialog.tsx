import Button from "@/components/button/button";
import Text from "@/components/text/text";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2Icon } from "lucide-react";

export const ShareResultDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Share2Icon height={21} width={21} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Missing tracks</DialogTitle>
          <DialogDescription>
            <Text
              content={
                "Share the link to this result on Zoove and other platforms."
              }
            />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
