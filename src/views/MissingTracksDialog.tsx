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
import { getPlatformPrettyNameByKey } from "@/lib/utils";
import type React from "react";

export const MissingTracksDialog: React.FC = ({
  children,
  source_platform,
  target_platform,
}: {
  children: React.ReactNode;
  source_platform: string;
  target_platform: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Missing tracks</DialogTitle>
          <DialogDescription>
            <Text
              content={`Some tracks are missing in your conversion from ${getPlatformPrettyNameByKey(source_platform)} to ${getPlatformPrettyNameByKey(target_platform)}. These results could not be fetched on ${getPlatformPrettyNameByKey(target_platform)}.`}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto pr-2">
          <div className="space-y-4">{children}</div>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
