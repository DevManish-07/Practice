// import React, { useEffect } from 'react';
// import { app, auth } from '../firebase';
// import 'firebase/compat/auth';
// import { getDatabase, ref, onDisconnect, set, onChildAdded } from 'firebase/database';

// const UserPresenceNotification = () => {
//     useEffect(() => {

//         // Get a reference to the Firebase Realtime Database
//         const database = getDatabase(app);

//         // Get a reference to the users node in the Realtime Database
//         const usersRef = ref(database, 'users');

//         // Function to update the user's presence status when they log in
//         const updateUserPresence = (userId: string, isOnline: boolean) => {
//             set(ref(database, userId), { isOnline });
//         };

//         // Function to update the user's presence status when they disconnect or log out
//         const updateOnDisconnect = (userId: string) => {
//             onDisconnect(ref(database, userId)).set({ isOnline: false });
//         };

//         // Function to listen for changes in the "users" node and notify other users
//         const listenForUserPresence = () => {
//             onChildAdded(usersRef, (snapshot: any) => {
//                 const userId = snapshot.key;
//                 const user = snapshot.val();

//                 // Skip the current user or users already marked as offline
//                 if (userId !== auth.currentUser?.uid && user.isOnline) {
//                     // Notify other users about the presence of the new user
//                     console.log(`${user.name} has logged in!`);
//                 }
//             });
//         };

//         // Handle user login event
//         const handleUserLogin = () => {
//             const currentUser = auth.currentUser;
//             if (currentUser) {
//                 const { uid } = currentUser;
//                 updateUserPresence(uid, true);
//                 updateOnDisconnect(uid);
//             }
//         };

//         // Subscribe to user login event
//         auth.onAuthStateChanged((user) => {
//             if (user) {
//                 handleUserLogin();
//             }
//         });

//         // Start listening for user presence
//         listenForUserPresence();
//     }, []);

//     return null;
// };

// export default UserPresenceNotification;

export function add() {

}