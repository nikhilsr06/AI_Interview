import { BiMicrophone, BiVideo } from "react-icons/bi";
import { FaRegCheckCircle } from "react-icons/fa";

import { FiAlertCircle, FiMonitor } from "react-icons/fi";
import { ErrorMsg, Heading, Label } from "./common";
import { RecordingState } from "./interfaces";
import { Button } from "./ui";

interface PermissionHandlerProps {
  recordingState: RecordingState;
  onRequestPermissions: () => void;
}
interface PermissionItem {
  icon: JSX.Element;
  permissionKey: keyof RecordingState;
  label: string;
}

const PermissionHandler = ({
  recordingState,
  onRequestPermissions,
}: PermissionHandlerProps) => {
  const permissionItems: PermissionItem[] = [
    {
      icon: <BiMicrophone className="w-6 2xl:w-8 h-6 2xl:h-8" />,
      permissionKey: "hasAudioPermission",
      label: "Microphone",
    },
    {
      icon: <BiVideo className="w-6 2xl:w-8 h-6 2xl:h-8" />,
      permissionKey: "hasVideoPermission",
      label: "Camera",
    },
    {
      icon: <FiMonitor className="w-6 2xl:w-8 h-6 2xl:h-8" />,
      permissionKey: "hasScreenPermission",
      label: "Screen Sharing",
    },
  ];
  return (
    <div className="space-y-2 p-4 bg-white rounded-md w-full">
      <Heading title="Required Permissions" />

      <div className="grid grid-cols-3 gap-4">
        {permissionItems.map(({ icon, permissionKey, label }) => {
          const hasPermission = recordingState[permissionKey];

          return (
            <div
              key={permissionKey}
              className="flex flex-col items-center gap-2 p-4 rounded-md bg-gray-100 transition-colors duration-200"
            >
              <div
                className={`flex items-center justify-center p-4 rounded-full bg-white ${
                  hasPermission ? "text-green-500" : "text-red-500"
                }`}
              >
                {icon}
              </div>
              <div className=" flex items-center justify-center gap-1">
                <Label text={label} className="flex-1 text-nowrap" size="sm" />
                {hasPermission ? (
                  <FaRegCheckCircle className="text-green-500 w-4 2xl:w-5 h-4 2xl:h-5" />
                ) : (
                  <FiAlertCircle className="text-red-500 w-4 2xl:w-5 h-4 2xl:h-5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!recordingState.hasAudioPermission ||
        !recordingState.hasVideoPermission ||
        !recordingState.hasScreenPermission) && (
        <Button
          text="Request Permissions"
          onClick={onRequestPermissions}
          isFullWith
          className="mt-2"
          size="sm"
        />
      )}

      {recordingState.currentError && (
        <ErrorMsg text={recordingState.currentError} />
      )}
    </div>
  );
};

export { PermissionHandler };
