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
        if(response.userObj.role === "Admin"){
            document.getElementsByClassName("addUser")[0].classList.add("show")
            injectTheScript(response.userObj.displayName)
            signUpForm.classList.remove("show");
            signInForm.classList.remove("show")
            document.getElementById("bookmarks").style.display = "flex"
            document.getElementsByClassName("loading")[0].classList.remove("show")
            document.getElementsByClassName("AdzNavigate")[0].style.display = "flex"
            generateUsers()
        }
        else{
            let siteArray = response.userObj.site.split(",")
            chrome.tabs.query({active:true,currentWindow:true},function(tab){
                //Be aware that `tab` is an array of Tabs 
               if(siteArray.includes(tab[0].url)){
                    injectTheScript(response.userObj.displayName)
                    signUpForm.classList.remove("show");
                    signInForm.classList.remove("show")
                    document.getElementById("bookmarks").style.display = "flex"
                    document.getElementsByClassName("loading")[0].classList.remove("show")
               }
               else{
                    document.getElementById("title1").style.display = "none"
                    document.getElementById("title2").style.display = "block"
                    document.getElementById("bookmarks").style.display = "flex"
                    document.getElementsByClassName("loading")[0].classList.remove("show")
               }
            });
        }
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
    var site = document.getElementById("signUpSite").value
    var role = "Users"
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
        window.site = site

        chrome.runtime.sendMessage({command: "auth-signup", e: window.signupE, p: window.signupP, d: window.signupD, r: window.role, s: window.site}, (response) => {
            if(response.status === "success"){
                document.getElementsByClassName("addUser")[0].classList.add("show")
                signUpForm.classList.remove("show");
                signInForm.classList.remove("show")
                document.getElementById("bookmarks").style.display = "flex"
                document.getElementsByClassName("loading")[0].classList.remove("show")
                document.getElementsByClassName("userBoxes")[0].innerHTML = ''
                generateUsers()
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
                    injectTheScript(response.userObj.displayName)
                    signUpForm.classList.remove("show");
                    signInForm.classList.remove("show")
                    document.getElementById("bookmarks").style.display = "flex"
                    document.getElementsByClassName("loading")[0].classList.remove("show")
                    document.getElementsByClassName("AdzNavigate")[0].style.display = "flex"
                    generateUsers()
                }
                else{
                    let siteArray = response.userObj.site.split(",")
                    chrome.tabs.query({active:true,currentWindow:true},function(tab){
                        //Be aware that `tab` is an array of Tabs 
                       if(siteArray.includes(tab[0])){
                            injectTheScript(response.userObj.displayName)
                            signUpForm.classList.remove("show");
                            signInForm.classList.remove("show")
                            document.getElementById("bookmarks").style.display = "flex"
                            document.getElementsByClassName("loading")[0].classList.remove("show")
                       }
                       else{
                            document.getElementById("title1").style.display = "none"
                            document.getElementById("title2").style.display = "block"
                            document.getElementById("bookmarks").style.display = "flex"
                            document.getElementsByClassName("loading")[0].classList.remove("show")
                       }
                    });
                }
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

document.getElementById("users").addEventListener('click',()=>{
    document.getElementById('com').classList.remove("selected")
    document.getElementById("users").classList.add("selected")
    document.getElementById("bookmarks").style.display = "none"
    document.getElementById("user_cont").style.display = "flex"
})

document.getElementById("com").addEventListener('click',()=>{
    document.getElementById('users').classList.remove("selected")
    document.getElementById("com").classList.add("selected")
    document.getElementById("bookmarks").style.display = "flex"
    document.getElementById("user_cont").style.display = "none"
})

function generateUsers(){
    chrome.storage.local.get(["Users"], (result) => {
        if(result){
            // console.log(result)
            let users  = JSON.parse(result.Users);
            console.log(users);
            for(let i = 0; i < users.length; i++){
                let main = document.createElement("div");
                main.className = "userContainer";
                let name = document.createElement("p");
                name.innerHTML = users[i].info.displayName;
                name.className = "user_name"
                let role = document.createElement("p");
                role.innerHTML = users[i].info.role;
                main.appendChild(name);
                main.appendChild(role);
                let images =  document.createElement("div");
                let img1 = document.createElement("img");
                let img2 = document.createElement("img");
                img2.addEventListener('click', ()=>{deleteUser(main, users[i].id, img2)});
                img2.src = chrome.runtime.getURL("assets/delete.png");
                img2.title = "Delete this user"
                img1.src = chrome.runtime.getURL("assets/plus.png");
                img1.title = "Give this usser access to this site"
                if(users[i].info.role !== "Admin"){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        if(!users[i].info.site.includes(tabs[0].url)){
                            images.appendChild(img1);
                            let newSite = `${users[i].info.site},${tabs[0].url}`;
                            img1.addEventListener('click', ()=>{updateUserSite(img1, users[i].id, newSite)});
                        }
                    });
                }
                images.appendChild(img2);
                main.appendChild(images)
                document.getElementsByClassName("userBoxes")[0].appendChild(main)
            }
        }
    });
}

function updateUserSite(ele, id, url){
    ele.src = chrome.runtime.getURL("assets/loading.gif")
    chrome.runtime.sendMessage({command: "updateUser", id:id, url: url}, (response)=>{
        if(response.status === "success"){
            ele.parentNode.removeChild(ele);
            chrome.storage.local.get(["Users"], (result) => {
                if(result){
                    let users = JSON.parse(result.Users);
                    for(let i = 0; i < users.length; i++){
                        if(users[i].id === id){
                            users[i].info.site = url
                        }
                    }
                    chrome.storage.local.set({"Users": JSON.stringify(users)}, () => {
                        console.log(users);
                    });
                    document.getElementsByClassName("userBoxes")[0].innerHTML = ''
                    generateUsers()
                }
            })
        }
    })
}

function deleteUser(ele, id, img2){
    img2.src = chrome.runtime.getURL("assets/loading.gif")
    chrome.runtime.sendMessage({command: "deleteUser", id:id}, (response)=>{
        if(response.status === "success"){
            ele.parentNode.removeChild(ele)
            chrome.storage.local.get(["Users"], (result) => {
                if(result){
                    let users = JSON.parse(result.Users);
                    for(let i = 0; i < users.length; i++){
                        if(users[i].id === id){
                            users.splice(i,1)
                        }
                    }
                    chrome.storage.local.set({"Users": JSON.stringify(users)}, () => {
                        console.log(users);
                    });
                    document.getElementsByClassName("userBoxes")[0].innerHTML = ''
                    generateUsers()
                }
            })

        }
    })
}