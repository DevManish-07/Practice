import React, { useState } from 'react';
// import { firestore, auth } from '../firebase';

const MessageInput = () => {
    const [messageText, setMessageText] = useState('');

    const sendMessage = async () => {
        if (messageText.trim() === '') {
            return;
        }

        // const { uid, displayName } = auth.currentUser;

        const newMessage = {
            text: messageText,
            userId: uid,
            userName: displayName,
            timestamp:    new Date(),
        };

        try {
            // Add the new message to the 'messages' collection in Firestore
            await firestore.collection('messages').add(newMessage);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default MessageInput;
