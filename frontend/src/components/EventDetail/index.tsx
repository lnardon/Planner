import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/apiHandler";
import EditEvent from "../EditEvent";
import AnimatedText from "animated-text-letters";
import "animated-text-letters/index.css";
import { useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";

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
  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  function handleOpenEdit() {
    setIsEditing(true);
  }

  const signs = () => {
    let returnVal = " | ";
    let idx = drawerEvent.end + 1 - drawerEvent.start;
    while (idx > 0) {
      returnVal += " - ";
      idx--;
    }
    returnVal += " | ";
    return returnVal;
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="w-full flex items-center">
        <div className="min-w-96 max-w-[35rem] w-full m-4 p-6 bg-green-600 bg-opacity-100 rounded-md">
          {drawerEvent && (
            <div className="flex flex-row text-white font-regular bg-black h-fit px-2 py-0.5 rounded-sm mb-2 w-fit items-center overflow-hidden">
              <AnimatedText
                text={`${drawerEvent?.start % 12}:00 ${
                  drawerEvent?.start < 12 ? "am" : "pm"
                }${signs()}${drawerEvent.end % 12}:59 ${
                  drawerEvent?.end < 12 ? "am" : "pm"
                }`}
                animation="slide-up"
                delay={8}
                easing="ease"
                animationDuration={384}
                transitionOnlyDifferentLetters={true}
              />
            </div>
          )}
          <div className="p-2 bg-black bg-opacity-80 rounded-md">
            <DrawerHeader>
              <DrawerTitle className="mb-0 text-2xl flex flex-wrap break-all">
                {drawerEvent?.name}
              </DrawerTitle>
              <Separator className="mb-2 bg-white" />
              {drawerEvent?.description && (
                <DrawerDescription className="mb-4  flex flex-wrap break-all whitespace-pre-wrap">
                  {drawerEvent?.description}
                </DrawerDescription>
              )}
            </DrawerHeader>
            <DrawerFooter className="flex flex-row w-full">
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-300 font-bold hover:text-black text-black transition-colors duration-300"
                onClick={handleOpenEdit}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-red-600 font-bold text-white hover:bg-red-800 transition-colors duration-300"
                onClick={handleDeleteEvent}
              >
                Delete
              </Button>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
      <Dialog open={isEditing} onOpenChange={setIsEditing} key={Math.random()}>
        <EditEvent
          setOpen={setIsEditing}
          setDrawerOpen={setIsDrawerOpen}
          setEvents={setEvents}
          events={events}
          initialStart={drawerEvent?.start}
          initialEnd={drawerEvent?.end}
          initialName={drawerEvent?.name}
          initialDescription={drawerEvent?.description}
          id={drawerEvent?.id}
          initialDate={drawerEvent?.date}
        />
      </Dialog>
    </Drawer>
  );
};

export default EventDetail;
