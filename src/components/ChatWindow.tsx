import React, { useEffect, useRef, useState } from 'react';
import { User, useAuth } from "../context/userAuth";
import { collection, query, orderBy, limit, getDocs, Timestamp, setDoc, doc, onSnapshot, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';


import "./ChatWindow.css";

interface Message {
  id?: string;
  text?: string;
  userId: string;
  imageUrl?: string;
}

const ChatWindow: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const messagesRef = collection(db, 'messages');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messageSoundRef = useRef<HTMLAudioElement>(null);


  const requestAudioPermission = async () => {
    try {
      const recognition = new SpeechRecognition();
      await recognition.start();

      // Audio permission granted
      console.log("Audio permission granted");
    } catch (error) {
      // Audio permission denied or error occurred
      console.log("Audio permission denied or error occurred");
    }
  };

  useEffect(() => {
    requestAudioPermission();
    const messageSound = new Audio("/notification.mp3");

    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc: any) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        console.log({ "asd": doc.data() })
      });

      snapshot.docChanges().forEach((change: any) => {
        console.log("change.doc.data().sender", change.doc.data().userId, user?.email)
        if (change.type === "added" && change.doc.data().userId !== user?.id) {
          // Play audio when a new message is added
          if (messageSoundRef.current) {
            messageSound.play();
          }
        }
      })

      setMessages(fetchedMessages);
      setTimeout(scrollToBottom, 10)
    });

    return () => {
      unsubscribe();
      messageSound.pause();
      messageSound.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    isLoggedIn ? navigate("/") : navigate("/login")
  }, [isLoggedIn])


  useEffect(() => {
    scrollToBottom();
  }, [])

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      console.log("scroll")
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    // if (newMessage.trim() === '') {
    //   return;
    // }

    try {
      if (image) {
        console.log(image)
        const storageRef = ref(getStorage(), `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed', (snapshot: any) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        }, (error) => { console.log(error) }, async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const messageData = {
            userId: user?.email || '',
            imageUrl: downloadURL,
            text: newMessage,
            timestamp: serverTimestamp(),
          };
          await addDoc(collection(db, 'messages'), messageData);
          setUploadProgress(0);
          setImage(null);
        }
        );
      } else {
        await setDoc(doc(messagesRef), {
          text: newMessage,
          userId: user!.email || '',
          timestamp: serverTimestamp(),
        });
      }
      setNewMessage('');

    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
      setShowDeleteButton(false)
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDeleteButton = () => {
    setShowDeleteButton(!showDeleteButton)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className='window-container'>
      <div className='input-box top-box'>
        <div className='logout' onClick={logout}>Logout</div>
      </div>

      <div className='messages-container' ref={messageContainerRef} style={{ overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div className={`message ${message.userId == user?.email ? " parker" : ""}`} key={message.id}>
            {message.imageUrl && <img width={100} src={message.imageUrl} className='uploadedImage' />}
            <p onClick={toggleDeleteButton}>{message.text}</p>
            {showDeleteButton &&
              <div onClick={() => handleDeleteMessage(message.id!)} className={`message-feature-container ${message.userId == user?.email ? " right" : ""}`}>
                <DeleteIcon></DeleteIcon>
              </div>
            }
          </div>
        ))}
      </div>

      <div className='input-box'>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <ImageSelector handleImageChange={handleImageChange} />
        {uploadProgress > 0 && <progress value={uploadProgress} max="100" />}
        <button className='' onClick={handleSendMessage}><SendSvg /></button>
        <audio ref={messageSoundRef} src="/path/to/message-sound.mp3" hidden />
      </div>
    </div >
  );
};

const ImageSelector = ({ handleImageChange }: { handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} hidden id="imageupload" />
      <label htmlFor="imageupload">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="122.88px" height="122.151px" viewBox="0 0 122.88 122.151" enable-background="new 0 0 122.88 122.151" xmlSpace="preserve"><g><path d="M8.676,0h105.529c2.405,0,4.557,0.984,6.124,2.552c1.567,1.567,2.551,3.754,2.551,6.124v104.8 c0,2.405-0.983,4.557-2.551,6.124c-1.568,1.567-3.755,2.552-6.124,2.552H8.676c-2.406,0-4.557-0.984-6.124-2.553 C0.984,118.032,0,115.845,0,113.476V8.675C0,6.27,0.984,4.119,2.552,2.552C4.12,0.984,6.307,0,8.676,0L8.676,0z M9.097,88.323 l35.411-33.9c1.421-1.313,3.645-1.167,4.921,0.255c0.037,0.036,0.037,0.073,0.073,0.073l31.459,37.218l4.812-29.6 c0.328-1.896,2.114-3.208,4.01-2.879c0.729,0.109,1.385,0.474,1.895,0.948l22.07,23.184V10.773c0-0.474-0.183-0.875-0.511-1.166 c-0.291-0.292-0.729-0.511-1.166-0.511H10.737c-0.474,0-0.875,0.182-1.166,0.511c-0.292,0.291-0.511,0.729-0.511,1.166v77.55H9.097 L9.097,88.323z M90.526,19.866c3.464,0,6.635,1.422,8.895,3.682c2.297,2.296,3.682,5.431,3.682,8.895 c0,3.463-1.421,6.634-3.682,8.894c-2.296,2.297-5.431,3.682-8.895,3.682c-3.462,0-6.634-1.421-8.894-3.682 c-2.297-2.296-3.682-5.431-3.682-8.894c0-3.463,1.421-6.634,3.682-8.895C83.929,21.251,87.064,19.866,90.526,19.866L90.526,19.866z" /></g></svg>
      </label>
    </div>
  )
}

const SendSvg = () => {
  return (
    <svg height={20} width={20} xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 122.56 122.88"><defs></defs><title>send</title><path className="cls-1" d="M2.33,44.58,117.33.37a3.63,3.63,0,0,1,5,4.56l-44,115.61h0a3.63,3.63,0,0,1-6.67.28L53.93,84.14,89.12,33.77,38.85,68.86,2.06,51.24a3.63,3.63,0,0,1,.27-6.66Z" /></svg>
  )
}

const DeleteIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="109.484px" height="122.88px" viewBox="0 0 109.484 122.88" enable-background="new 0 0 109.484 122.88" xmlSpace="preserve" style={{ "fill": "rgb(239 68 68)" }}><g><path fill-rule="evenodd" clip-rule="evenodd" d="M2.347,9.633h38.297V3.76c0-2.068,1.689-3.76,3.76-3.76h21.144 c2.07,0,3.76,1.691,3.76,3.76v5.874h37.83c1.293,0,2.347,1.057,2.347,2.349v11.514H0V11.982C0,10.69,1.055,9.633,2.347,9.633 L2.347,9.633z M8.69,29.605h92.921c1.937,0,3.696,1.599,3.521,3.524l-7.864,86.229c-0.174,1.926-1.59,3.521-3.523,3.521h-77.3 c-1.934,0-3.352-1.592-3.524-3.521L5.166,33.129C4.994,31.197,6.751,29.605,8.69,29.605L8.69,29.605z M69.077,42.998h9.866v65.314 h-9.866V42.998L69.077,42.998z M30.072,42.998h9.867v65.314h-9.867V42.998L30.072,42.998z M49.572,42.998h9.869v65.314h-9.869 V42.998L49.572,42.998z" /></g></svg>
  )
}


export default ChatWindow;
