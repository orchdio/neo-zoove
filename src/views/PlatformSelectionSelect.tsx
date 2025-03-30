import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  onChange?: (value: string) => void;
}

export const PlatformSelectionSelect = (props: Props) => {
  const mergedStyles = cn(props.className);
  return (
    <Select onValueChange={props.onChange}>
      <SelectTrigger className={mergedStyles}>
        <SelectValue placeholder={"Select target platform"} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Platform</SelectLabel>
          <SelectItem value={"applemusic"}>Apple Music</SelectItem>
          <SelectItem value={"deezer"}>Deezer</SelectItem>
          <SelectItem value={"spotify"}>Spotify</SelectItem>
          <SelectItem value={"tidal"}>TIDAL</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
