const firebaseConfig = {
    apiKey: window.FIREBASE_API_KEY,
    authDomain: "germainpharma-d6b2c.firebaseapp.com",
    projectId: "germainpharma-d6b2c",
    storageBucket: "germainpharma-d6b2c.firebasestorage.app",
    messagingSenderId: "746155918133",
    appId: "1:746155918133:web:7e87e73f31e2a552b4827c",
    measurementId: "G-25EB4WL74J"
  };
firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();
const db = firebase.firestore();

firebase.firestore().settings({
    timestampsInSnapshots: true
});

firebase.firestore().enablePersistence()
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            console.log('La persistance des données a échoué car plusieurs onglets sont ouverts.');
        } else if (err.code == 'unimplemented') {
            console.log('La persistance des données n\'est pas prise en charge par le navigateur.');
        }
    });