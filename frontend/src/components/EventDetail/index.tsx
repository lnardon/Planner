import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "../ui/badge";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/apiHandler";

const EventDetail = ({
  isDrawerOpen,
  setIsDrawerOpen,
  drawerEvent,
  setEvents,
  events,
}: {
  isDrawerOpen: boolean;
  setIsDrawerOpen: any;
  drawerEvent: any;
  setEvents: any;
  events: any;
}) => {
  async function handleDeleteEvent() {
    if (drawerEvent) {
      let raw = await apiHandler(
        "/deleteEvent",
        "POST",
        "application/json",
        JSON.stringify({ id: drawerEvent.id })
      );
      if (!raw.ok) {
        toast.error("Error deleting event");
        return;
      }

      setIsDrawerOpen(false);
      setEvents(events.filter((event: any) => event.id !== drawerEvent.id));
      toast.success("Event deleted successfully!");
    }
  }

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="w-full flex items-center">
        <div className="min-w-96 max-w-[35rem] w-full m-4 p-6 bg-green-500 rounded-md">
          <div className="p-2 bg-black bg-opacity-80 rounded-md">
            <DrawerHeader>
              <DrawerTitle className="mb-0 text-2xl flex flex-wrap break-all">
                {drawerEvent?.name}
              </DrawerTitle>
              <Separator className="mb-2 bg-white" />
              {drawerEvent?.description && (
                <DrawerDescription className="mb-4  flex flex-wrap break-all">
                  {drawerEvent?.description}
                </DrawerDescription>
              )}
              {drawerEvent && (
                <div className="flex gap-0.5 w-100 md:justify-start sm:justify-center">
                  <Badge className="text-sm font-bold bg-black text-white border-solid border-2 border-white hover:bg-white hover:text-black">{`${
                    drawerEvent?.start % 12
                  }:00 ${drawerEvent?.start < 12 ? "am" : "pm"}`}</Badge>
                  <ChevronRight />
                  <Badge className="text-sm font-bold bg-black text-white border-solid border-2 border-white hover:bg-white hover:text-black">{`${
                    drawerEvent.end % 12
                  }:59 ${drawerEvent?.end < 12 ? "am" : "pm"}`}</Badge>
                </div>
              )}
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>
                <Button variant="outline" className="w-full hover:bg-black">
                  Close
                </Button>
              </DrawerClose>
              <Button
                className="bg-red-600 font-bold text-white hover:bg-red-600"
                onClick={handleDeleteEvent}
              >
                Delete
              </Button>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventDetail;
