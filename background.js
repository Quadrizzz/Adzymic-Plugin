//Service Worker Catch Any Errors...
try{

  //Import Firebase Local Scripts
  self.importScripts(
    './firebase/firebase-app.js',
    './firebase/firebase-auth.js',
    './firebase/firebase-database.js'
  )

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAQKjl91q3d3kf4MCyx9g4pX7xfUgpSXy4",
    databaseURL: 'https://chrome-extension-c4683-default-rtdb.firebaseio.com/',
    authDomain: "chrome-extension-c4683.firebaseapp.com",
    projectId: "chrome-extension-c4683",
    storageBucket: "chrome-extension-c4683.appspot.com",
    messagingSenderId: "491652793519",
    appId: "1:491652793519:web:73c080d1abedc0112ac05a",
    measurementId: "G-F511VQL194"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var db = firebase.database();
  //Add Auth to storage
  var user = firebase.auth().currentUser;
  console.log(user);
  if (user) {
    //user is signed in
    chrome.storage.local.set({ authInfo: user });
  } else {
    //user is not signed in
    chrome.storage.local.set({ authInfo: false });
  }

  /*
  Response Calls
    resp({type: "result", status: "success", data: doc.data(), request: msg});
    resp({type: "result", status: "error", data: error, request: msg});
  */
  chrome.runtime.onMessage.addListener((msg, sender, resp) => {

    if(msg.command === "user-auth"){
      // console.log(sender)
      // console.log("Please work")
      // return resp({type: "result", status:"error", data: "something"})
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          chrome.storage.local.set({ authInfo: user });
          firebase.database().ref("/users/" + user.uid).once("value").then(function (snapshot) {
            resp({type: "result", status: "success", data: user, userObj: snapshot.val()});
            getAllComment()
          }).catch((result) => {
            chrome.storage.local.set({ authInfo: false });
            resp({type: "result", status: "error", data: false});
          });
        } else {
          // No user is signed in.
          chrome.storage.local.set({ authInfo: false });
          resp({type: "result", status: "error", data: false});
        }
      });
    }

    //Auth
    //logout
    if(msg.command === "auth-logout"){
      firebase.auth().signOut().then(function () {
        //user logged out...
        chrome.storage.local.set({ authInfo: false });
        resp({type: "result", status: "success", data: false});
      },function (error) {
        //logout error....
        resp({type: "result", status: "error", data: false,message: error});
      });
    }
    //Login
    if(msg.command === "auth-login"){
      //login user
      firebase.auth().signOut();
      firebase.auth().signInWithEmailAndPassword(msg.e, msg.p).catch(function (error) {
        if (error) {
          //return error msg...
          chrome.storage.local.set({ authInfo: false });
          resp({type: "result", status: "error", data: false});
        }
      });
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          //return success user objct...
          chrome.storage.local.set({ authInfo: user });
          firebase.database().ref("/users/" + user.uid).once("value").then(function (snapshot) {
            resp({type: "result", status: "success", data: user, userObj: snapshot.val()});
            getAllComment()
          }).catch((result) => {
            chrome.storage.local.set({ authInfo: false });
            resp({type: "result", status: "error", data: false});
          });
        }
      });
    }
    //Sign Up
    if(msg.command == "auth-signup"){
      //create user
      ///get user id
      //make call to lambda
      chrome.storage.local.set({ authInfo: false });
      firebase.auth().signOut();
      firebase.auth().createUserWithEmailAndPassword(msg.e, msg.p).catch(function (error) {
        // Handle Errors here.
        chrome.storage.local.set({ authInfo: false }); // clear any current session
        var errorCode = error.code;
        var errorMessage = error.message;
        resp({type: "signup", status: "error", data: false, message: error});
      });
      //complete payment and create user object into database with new uid
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) { //user created and logged in ...
          //build url...
          firebase.database().ref("/users/" + user.uid).set({displayName: msg.d});
              //success / update user / and return
          firebase.database().ref("/users/" + user.uid).once("value").then(function (snapshot) {
            resp({type: "result", status: "success", data: user, userObj: snapshot.val()});
            getAllComment()
            chrome.storage.local.set({ authInfo: user });
          }).catch((result) => {
            chrome.storage.local.set({ authInfo: false });
            resp({type: "result", status: "error", data: false});
          });
        }
      });
    }

    if(msg.command === "create-comment"){
      firebase.database().ref("/comments/" + msg.id).set({box: msg.box,boxId: msg.BoxId, url: msg.url});
      firebase.database().ref("/comments/" + msg.id).once("value").then(function (snapshot){
        resp({type: "result", status: "success", data: user, userObj: snapshot.val()});
      }).catch((result)=>{
        resp({type: "result", status: "error", data: false});
      })
    }

    if(msg.command === "update-comment"){
      var updates = {};
      updates["/comments/" + msg.id + "/box"] = msg.box
      firebase.database().ref().update(updates)
      firebase.database().ref("/comments/" + msg.id).once("value").then(function (snapshot){
        resp({type: "result", status: "success", data: user, userObj: snapshot.val()});
      }).catch((result)=>{
        resp({type: "result", status: "error", data: false});
      })
    }
    return true;
  });


  function getAllComment(){
    var comments = []
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      var tab = tabs[0];
      var url = tab.url;
      firebase.database().ref("/comments").once("value").then(function (snapshot){
        snapshot.forEach((child) => {
          if(child.val().url === url){
            comments.push(child.val())
          }
        })
        // localStorage.setItem("databaseComments", JSON.stringify(comments))
        chrome.storage.local.set({"databaseComments": JSON.stringify(comments)}, () => {
          console.log("done");
        });
        chrome.tabs.sendMessage(tabs[0].id,{msg:`done`})
      })
    });
  }

}catch(e){
  //error
  console.log(e);
}
