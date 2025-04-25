// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";

// const ChatHeader = () => {
//   const { selectedUser, setSelectedUser } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar">
//             <div className="size-10 rounded-full relative">
//               <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
//             </div>
//           </div>

//           {/* User info */}
//           <div>
//             <h3 className="font-medium">{selectedUser.fullName}</h3>
//             <p className="text-sm text-base-content/70">
//               {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
//             </p>
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={() => setSelectedUser(null)}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };
// export default ChatHeader;
// Add these imports at the top

import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { openCallModal } = useCallStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Call and Close Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={openCallModal}
            className="btn btn-sm btn-circle btn-primary"
            title="Start Video Call"
          >
            📞
          </button>
          <button onClick={() => setSelectedUser(null)} title="Close Chat">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
