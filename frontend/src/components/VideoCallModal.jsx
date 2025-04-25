// import { useEffect, useRef } from 'react';
// import { useCallStore } from '../store/useCallStore';

// const VideoCallModal = () => {
//   const { isCallModalOpen, closeCallModal } = useCallStore();
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   useEffect(() => {
//     if (isCallModalOpen) {
//       navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//         localVideoRef.current.srcObject = stream;
//       });
//     }
//   }, [isCallModalOpen]);

//   if (!isCallModalOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-base-100 rounded-2xl shadow-lg p-4 w-[90%] max-w-2xl relative">
//         <h3 className="text-lg font-bold mb-2">Video Call</h3>
//         <div className="flex gap-2">
//           <video ref={localVideoRef} autoPlay muted className="w-1/2 rounded-xl border" />
//           <video ref={remoteVideoRef} autoPlay className="w-1/2 rounded-xl border" />
//         </div>
//         <div className="flex justify-end mt-4">
//           <button className="btn btn-error" onClick={closeCallModal}>
//             End Call
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCallModal;
import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useAuthStore } from '../store/useAuthStore';
import io from 'socket.io-client';

// Replace with your backend URL
const socket = io('http://localhost:5000');

const VideoCallModal = () => {
  const { isCallModalOpen, closeCallModal } = useCallStore();
  const { user } = useAuthStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [targetSocketId, setTargetSocketId] = useState(null);

  useEffect(() => {
    if (user?._id) {
      socket.emit('register-user', user._id);
    }
  }, [user]);

  useEffect(() => {
    if (!isCallModalOpen) return;

    const startCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // Replace target user ID with real ID from chat
      const targetUserId = prompt("Enter target user's ID:");

      socket.emit('call-user', {
        targetUserId,
        offer,
      });

      socket.on('call-answered', async ({ answer }) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('call-ended', () => {
        closeCallModal();
        peerConnection.current.close();
        peerConnection.current = null;
        alert('Call Ended');
      });

      socket.on('incoming-call', async ({ from, offer }) => {
        setTargetSocketId(from);
        const accept = confirm('Incoming call. Accept?');
        if (!accept) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit('answer-call', { to: from, answer });
      });
    };

    startCall();
  }, [isCallModalOpen]);

  const handleEndCall = () => {
    if (targetSocketId) {
      socket.emit('end-call', { targetSocketId });
    }
    peerConnection.current?.close();
    closeCallModal();
  };

  if (!isCallModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-xl p-4 w-[90%] max-w-3xl">
        <h3 className="text-lg font-bold mb-3">Video Call</h3>
        <div className="flex gap-4">
          <video ref={localVideoRef} autoPlay muted className="w-1/2 rounded-lg border" />
          <video ref={remoteVideoRef} autoPlay className="w-1/2 rounded-lg border" />
        </div>
        <div className="text-right mt-4">
          <button className="btn btn-error" onClick={handleEndCall}>End Call</button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;