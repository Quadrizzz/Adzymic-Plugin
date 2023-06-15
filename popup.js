// adding a new bookmark row to the popup
function injectTheScript(userName) {
    // Wuery the active tab, which will be only one tab and inject the script in it.
    if(userName){
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['contentScript.js']},()=>{
                chrome.tabs.sendMessage(tabs[0].id,{myVar:`${userName}`});
            })
        })
    }
}


window.signupUser = false;
window.signupE = '';
window.signupP = '';
window.signupD= '';
window.role = ''

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
    console.log(resp);
});

(async ()=>{
    const response = await chrome.runtime.sendMessage({command: "user-auth"});
    if(response.userObj){
        console.log(response.userObj)
        if(response.userObj.role === "Admin"){
            document.getElementsByClassName("addUser")[0].classList.add("show")
        }
        injectTheScript(response.userObj.displayName)
        signUpForm.classList.remove("show");
        signInForm.classList.remove("show")
        document.getElementsByClassName("loading")[0].classList.remove("show")
        document.getElementById("bookmarks").style.display = "flex"
    }
    else{
        signInForm.classList.add("show")
        document.getElementsByClassName("loading")[0].classList.remove("show")
    }
    
})();


var sign_in = document.getElementsByClassName("sign_in")[0]
var sign_up = document.getElementsByClassName("sign_up")[0]
var signUpForm = document.getElementsByClassName("signUpForm")[0]
var signInForm = document.getElementsByClassName("signInForm")[0]




document.getElementsByClassName("addUser")[0].addEventListener("click", ()=>{
    signUpForm.classList.add("show");
    document.getElementById("bookmarks").style.display = "none"
})



document.getElementById("signUpBut").addEventListener("click",()=>{
    var email = document.getElementById("signUpEmail").value
    var password = document.getElementById("signUpPass").value
    var display = document.getElementById("signUpDisplay").value
    var role = "User"
    signUpForm.classList.remove("show");
    document.getElementsByClassName("loading")[0].classList.add("show")

    if(email === "" || password === "" || display === ""){
        alert("Enter Email and password and display name")
    }
    else{
        window.signupUser = true;
        window.signupE = email;
        window.signupP = password;
        window.signupD = display
        window.role = role

        chrome.runtime.sendMessage({command: "auth-signup", e: window.signupE, p: window.signupP, d: window.signupD, r: window.role}, (response) => {
            if(response.status === "success"){
                document.getElementsByClassName("addUser")[0].classList.add("show")
                signUpForm.classList.remove("show");
                signInForm.classList.remove("show")
                document.getElementById("bookmarks").style.display = "flex"
                document.getElementsByClassName("loading")[0].classList.remove("show")
            }
        });
    }
})

document.getElementById("signInBut").addEventListener("click",()=>{
    var email = document.getElementById("signInEmail").value
    var pass = document.getElementById("signInPass").value;
    if (email === "" || pass === ""){
        alert("enter correct details")
    }
    else{    
        console.log('send to service worker [login] ->', email, pass);
        document.getElementsByClassName("loading")[0].classList.add("show")
        signInForm.classList.remove("show")
        chrome.runtime.sendMessage({command: "auth-login", e: email, p: pass}, (response) => {
            if(response.userObj){
                if(response.userObj.role === "Admin"){
                    document.getElementsByClassName("addUser")[0].classList.add("show")
                }
                injectTheScript(response.userObj.displayName)
                signUpForm.classList.remove("show");
                signInForm.classList.remove("show")
                document.getElementById("bookmarks").style.display = "flex"
                document.getElementsByClassName("loading")[0].classList.remove("show")
            }
        });
    }  
})

document.getElementsByClassName("signOut")[0].addEventListener('click',function(){
    chrome.runtime.sendMessage({command: "auth-logout"}, (response) => {
      if(response.status === "success"){
        signInForm.classList.add("show")
        document.getElementsByClassName("addUser")[0].classList.remove("show")
        document.getElementById("bookmarks").style.display = "none"
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
      }
    });
  });