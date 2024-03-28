import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface Props {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
}

const Settings: React.FC<Props> = ({ isSettingsOpen, setIsSettingsOpen }) => {
  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-3xl">Settings</SheetTitle>
          <SheetDescription>
            Currently there are no settings to configure.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
