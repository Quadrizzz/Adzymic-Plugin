(() => {
    let body = document.getElementsByTagName('body');
    let html = document.documentElement;
    localStorage.clear()

    const loadCommentBox = (id)=>{
        if(document.getElementById(id)){
            document.getElementById(id).parentNode.removeChild(document.getElementById(id))
        }
        if(document.getElementById(`tip_${id}`)){
            document.getElementById(`tip_${id}`).parentNode.removeChild(document.getElementById(`tip_${id}`))
        }
        var commentInfo = JSON.parse(localStorage.getItem(id))
        console.log(commentInfo)

        var x = commentInfo[0]
        var y = commentInfo[1]
        // var textId =  `${uniqueId}_text`
        var element = document.createElement("div");
        element.className = "commentBox"
        element.id = id;
        element.setAttribute("style", `position:absolute;top:${y}vw;left:${x}vw;z-index:999999`)
        var commentsBox = document.createElement("div");
        commentsBox.className = "commentsContainer"
        if(commentInfo[2]){
            for(var i = 2; i < commentInfo.length; i++){
                var comment = document.createElement("div");
                comment.className = "comment";
                var user_name = commentInfo[i].user_name.toUpperCase()
                var user = document.createElement("p");
                user.className = "username"
                user.innerHTML = `${user_name[0]}${user_name[1]}`
                comment.append(user)
                var commentText = document.createElement("p");
                commentText.className = "commentText"
                commentText.innerHTML = `${commentInfo[i].comment_text}`
                comment.append(commentText)
                commentsBox.append(comment)
            }
        }
        element.append(commentsBox)
        var commentInput = document.createElement("input");
        commentInput.className = "commentInput"
        commentInput.placeholder = "Enter your comment here..."
        element.append(commentInput)
        var buttons = document.createElement("div")
        buttons.className = "buttons"
        var button1 = document.createElement("button")
        button1.innerHTML = "Cancel"
        button1.className = "button1"
        var button2 = document.createElement("button")
        button2.innerHTML = "Comment"
        button2.className = "button2"
        button1.addEventListener("click",()=>{
            cancelComment(id)
        })
        button2.addEventListener("click", ()=>{
            addComment(id, commentInput.value, localStorage.getItem("currentUser"))
        })
        buttons.append(button1)
        buttons.append(button2)
        element.append(buttons)

        html.append(element)
    }



    const cancelComment = (id)=>{
        var img = document.createElement("img")
        img.id = `tip_${id}`
        var commentBoxInfo = JSON.parse(localStorage.getItem(id))
        img.src = chrome.runtime.getURL("assets/nib.png");
        img.alt = "Nib icons created by th studio - Flaticon"
        img.className = "tooltip"
        img.setAttribute("style", `position:absolute;top:${commentBoxInfo[1]}vw;left:${commentBoxInfo[0]}vw;height:20px;width:20px`)
        img.addEventListener("click", ()=>{
            loadCommentBox(id)
        })
        html.append(img)
        if(document.getElementById(id)){
            document.getElementById(id).parentNode.removeChild(document.getElementById(id))
            updateDatabaseComment(id)
        }

    }

    const updateDatabaseComment = (id)=>{
        var commentBoxInfo = JSON.parse(localStorage.getItem(id))
        chrome.runtime.sendMessage({command: "update-comment", BoxId: id, box: JSON.stringify(commentBoxInfo), id: `${id}_${location.host.replace(".","")}`}, (response)=>{
            console.log(response)
        })
    }



    const addComment = (id, comment, user)=>{
        var CommentBox = JSON.parse(localStorage.getItem(id))
        var commentInfo = {
            user_name: user,
            comment_text : comment
        }
        CommentBox.push(commentInfo)
        localStorage.setItem(id, JSON.stringify(CommentBox))
        loadCommentBox(id)
    }

    function printMousePos(event) {
        var uniqueId = `${event.clientX}${event.clientY}`
        var width = window.innerWidth;
        var top  = window.pageYOffset || document.documentElement.scrollTop
        var left = window.pageXOffset || document.documentElement.scrollLeft;

        var x = 100 * ((event.clientX + left) / width)
        var y = 100 * ((event.clientY + top) / width)
        // var textId =  `${uniqueId}_text`
        var commentBoxInfo = [`${x}`,`${y}`]
        localStorage.setItem(uniqueId, JSON.stringify(commentBoxInfo))
        chrome.runtime.sendMessage({command: "create-comment", BoxId: uniqueId, box: JSON.stringify(commentBoxInfo), url: `${location.href}`, id: `${uniqueId}_${location.host.replace(".","")}`},(response)=>{
            console.log(response)
        })
        var element = document.createElement("div");
        element.className = "commentBox"
        element.id = uniqueId
        element.setAttribute("style", `position:absolute;top:${y}vw;left:${x}vw;z-index:999999`)
        var commentsBox = document.createElement("div");
        commentsBox.className = "commentsContainer"
        element.append(commentsBox)
        var commentInput = document.createElement("input");
        commentInput.className = "commentInput"
        commentInput.placeholder = "Enter your comment here..."
        element.append(commentInput)
        var buttons = document.createElement("div")
        buttons.className = "buttons"
        var button1 = document.createElement("button")
        button1.innerHTML = "Cancel"
        button1.className = "button1"
        var button2 = document.createElement("button")
        button2.innerHTML = "Comment"
        button2.className = "button2"
        button1.addEventListener("click",()=>{
            cancelComment(uniqueId)
        })
        button2.addEventListener("click", ()=>{
            addComment(uniqueId, commentInput.value, localStorage.getItem("currentUser"))
        })
        buttons.append(button1)
        buttons.append(button2)
        element.append(buttons)


        html.append(element)

    }


    
    body[0].addEventListener("dblclick", printMousePos )

    chrome.runtime.onMessage.addListener(message=>{
        if (message.myVar) {
            localStorage.setItem("currentUser", `${message.myVar}`);
        }
    })

    chrome.runtime.onMessage.addListener(message=>{
        if(message.msg){
            chrome.storage.local.get(["databaseComments"], (result) => {
                if(result){
                    // console.log(result)
                    let dbComments  = JSON.parse(result.databaseComments);
                    console.log(dbComments)
                    for(var i = 0; i < dbComments.length; i++ ){
                        localStorage.setItem(dbComments[i].boxId, dbComments[i].box)
                        cancelComment(dbComments[i].boxId)
                    }
                }
            });
        }
    })

})();

// const getTime = t => {
//     var date = new Date(0);
//     date.setSeconds(1);

//     return date.toISOString().substr(11, 0);
// }
