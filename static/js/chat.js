
// *************************************************************************
// Chat app front end


// Some variables linked to front end.
let chatWindow = document.querySelector(".chatWindow");
let messengerPage = document.getElementById("messenger");
let chatForm = document.createElement("form");
let input = document.createElement("input");

// let chatDivs;

// Show online users for chat app.
// sortTop variable is just to make sure the chat is red after receiving a new message.
async function showUsers(sortTop) {

    await fetchData("chats")
    await fetchData("sessions")
    await fetchData("messages")

    // Unblur page.    
    messengerPage.style.opacity = "100%";
    messengerPage.style.pointerEvents = "auto";

    // Style messenger page
    messengerPage.innerHTML = "";

    // Create button to refresh chats
    let refreshChats = document.createElement("button")
    refreshChats.style.display = "flex";
    refreshChats.style.justifyContent = "center";
    refreshChats.style.backgroundColor = "transparent";
    refreshChats.style.backgroundRepeat = "no-repeat";
    // refreshChats.style.border = "none";
    refreshChats.style.borderRadius = "50px";
    refreshChats.style.marginBottom = "10px";
    refreshChats.innerHTML = "<img src='static/refresh.png' style='width: 40px'></img>"
    refreshChats.style.width = "20%"


    // Append button to chat page.
    messengerPage.append(refreshChats)

    // Get all the data from messages.
    await fetchData("messages");

    // Latest chats info
    let latestInfo = []

    // if (!!sortTop) {
    //     https://stackoverflow.com/questions/23921683/javascript-move-an-item-of-an-array-to-the-front
    //     sessions.sort(function (x, y) { return sortTop.includes(x.username) ? -1 : sortTop.includes(y.username) ? 1 : 0; });
    // } else {
    let msgsLen = messages.length - 1
    let currentUser = localStorage.getItem("username")
    // Get the latest message for each chat between current user and other existing users in order to sort sessions list.
    for (let i = msgsLen; i > 0; i--) {
        let latestMessageCase_1 = messages[i].receiver === currentUser && !latestInfo.some(ob => ob.receiver === currentUser && ob.sender === messages[i].sender) && !latestInfo.some(ob => ob.receiver === messages[i].sender && ob.sender === currentUser)
        let latestMessageCase_2 = messages[i].sender === currentUser && !latestInfo.some(ob => ob.receiver === currentUser && ob.sender === messages[i].receiver) && !latestInfo.some(ob => ob.receiver === messages[i].receiver && ob.sender === currentUser)
        if (latestMessageCase_1 || latestMessageCase_2) {
            let latestDataObj = {
                receiver: messages[i].receiver,
                sender: messages[i].sender,
                time: messages[i].time,
            }
            latestInfo.push(latestDataObj)
        }
    }

    // console.log(latestInfo);

    // Next Steps:
    // https://stackoverflow.com/questions/8217419/how-to-determine-if-javascript-array-contains-an-object-with-an-attribute-that-e



    await fetchData("users")

    // Store users with no messages. Need new list to sort alphabetically.
    let noMessages = [];
    // Get list of users who don't have any messages
    users.forEach(user => {
        if (latestInfo.some(message => message.sender === user.username) || latestInfo.some(message => message.receiver === user.username)) {
            return
        }
        let emptyMessageObject = {
            noMessagesUName: user.username,
        }
        noMessages.push(emptyMessageObject)
    })


    // Sort the new list alphabeitcally.
    noMessages.sort((a, b) => {
        return a.noMessagesUName.localeCompare(b.noMessagesUName);
    })

    // Concatenate to latestinfo list.
    latestInfo = latestInfo.concat(noMessages)



    let currUser = localStorage.getItem("username");
    latestInfo.forEach(chat => {

        // Get the user to display. Never display current user.
        let userToDisplay;
        if (chat.receiver === currUser) {
            userToDisplay = chat.sender;
        } else if (chat.sender === currUser) {
            userToDisplay = chat.receiver;
        } else {
            userToDisplay = chat.noMessagesUName;
        }

        // Long bar with username to click on.
        let div = document.createElement("div")
        // Skip current user. Should not chat with yourself.
        if (userToDisplay === currUser) {
            return;
        }

        // Connect to chat for notifications.
        // connectToChatserver([currentUser, session.username], true);

        div.className = "chatRoom"
        // Id is current user and other user that is !== current user..
        div.id = `${currUser}<->${userToDisplay}`

        // Display user data in messenger "page."
        if (sessions.find(session => session.username === userToDisplay)) {
            div.style.backgroundColor = "rgba(0,0,0,0.8)";
            div.innerHTML = `
                <div class="userStatusContainer">
                    <h2 style="color:white">${userToDisplay}</h2><span class="dot-online"></span><span id="user-online">online</span>
                </div>
                <em style="color:white; font-size: 12px">Click to chat</em>
                `;
        } else {
            div.style.backgroundColor = "rgba(100,100,100,0.8)";
            div.innerHTML = `
                <div class="userStatusContainer">
                    <h2 style="color:white">${userToDisplay}</h2><span class="dot-offline"></span><span id="user-offline" >offline</span>
                </div>
                <em style="color:white; font-size: 12px">Click to send message</em>
                `;
        }

        div.style.borderRadius = "10px";
        div.style.padding = "1.5%"
        div.style.width = "100%"

        if (div.id === sortTop) {
            div.style.backgroundColor = "red";
        }

        div.style.marginBottom = "5px";
        messengerPage.append(div);



        // Show chat box on click
        div.addEventListener("click", () => {


            if (chatWindow.querySelector("button") == null) {
                showChatWindow(div.id);
                // Set chatroom to read status color.
                if (div.style.backgroundColor === "red") div.style.backgroundColor = "rgba(0, 0, 0, 0.8)";

            } else {

                chatWindow.style.display = "block";

                // Blur background page.
                // messengerPage.style.opacity = "0.5"
                messengerPage.style.pointerEvents = "none";
            }
        });

    });

    refreshChats.addEventListener("click", () => {
        showUsers();
    })


    // show offline users
}

// Show chat window pop up with id of user-user
async function showChatWindow(id) {

    // Get users in chat
    let usersInChat = id.split("<->");

    // Create title.
    let title = document.createElement("div");
    title.className = "h5 m-0";
    title.id = "chatwith"
    title.innerText = `Chat with: @${usersInChat[1]}`
    chatWindow.append(title);

    // Style and append components
    chatWindowStyles(id);

    // Filter and display messages
    await filterMessages(usersInChat, id)

    // Set correct id
    chatWindow.id = `window: ${id}`

    // Add a new chat to the sqlite database.
    await sendJsonToBackend("chats", usersInChat[0], usersInChat[1])
    await fetchData("chats")

    connectToChatserver([usersInChat[0], usersInChat[1]]);


    // Auto focus message form.
    input.focus();

}


async function filterMessages(usersInChat, id) {
    // Counters for range of messages
    let count = 0;
    let limit = 10;
    await fetchData("messages")
    // messages = messages.reverse()


    let chatScreen = document.getElementById("chatScreen:" + id)

    let chatRoomMessages = messages.filter((message) => {
        return usersInChat.includes(message.sender) && usersInChat.includes(message.receiver)
    })

    chatRoomMessages.reverse()

    nextTen(chatScreen, chatRoomMessages, count, limit)
    scrollToBottom(chatScreen)
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// https://www.youtube.com/watch?v=F2zF8fu7aG0&t=215s&ab_channel=TheCodeCreative
const debounce = (fn, delay) => {
    let timer
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}


let count = 0
let limit = 10
let loadChats = (chatScreen, chatRoomMessages, lastIndex) => {
    if (chatScreen.scrollTop === 0) {
        chatRoomMessages.forEach((message, index) => {
            if (index >= count && index < limit) {
                let messageCointainer = document.createElement("div");
                let messageHTML;
                if (message.sender == localStorage.getItem("username")) {
                    messageCointainer.style.display = "flex";
                    messageCointainer.style.flexDirection = "column";
                    messageCointainer.style.justifyContent = "flex-start";
                    messageCointainer.style.alignItems = "flex-end";
                    messageHTML = '<div style="margin-right: 10px">' + '<p style="margin-bottom: 0; ">' + '<span style="color: orange">' + message.sender + "</span>" + ': ' + message.message + '</p>' + '<p style="font-size: 10px; margin-bottom: 1rem">' + message.time + '</p>' + '</div>';
                } else {
                    messageHTML = '<p style="margin-bottom: 0">' + message.sender + ': ' + message.message + '</p>' + '<p style="font-size: 10px; margin-bottom: 1rem">' + message.time + '</p>';
                }
                messageCointainer.innerHTML = messageHTML;
                chatScreen.prepend(messageCointainer);
                // Increase count
                count++;

                lastIndex = index;
            }
        })
        limit += 10;

        if (lastIndex !== chatRoomMessages.length - 1 && chatRoomMessages.length > lastIndex) {
            chatScreen.scrollTop += chatScreen.offsetHeight;
        }
    }
}

loadChats = debounce(loadChats, 350)

let lastIndex;
function nextTen(chatScreen, chatRoomMessages) {
    if (chatScreen.style.overflow == "auto") {
        loadChats(chatScreen, chatRoomMessages, lastIndex);
    }
    // Debounce loading ten chats at a time when scrolling. Debounce function i declared above.
    chatScreen.addEventListener("scroll", () => loadChats(chatScreen, chatRoomMessages, lastIndex))
}

function chatWindowStyles(id) {
    // Styling
    chatWindow.style.height = "434.714px";
    chatWindow.style.marginTop = "100px";
    chatWindow.style.display = "block";
    chatWindow.style.padding = "25px 0px 0px 50px"
    chatWindow.style.width = "50%";
    chatWindow.style.position = "fixed";
    chatWindow.style.zIndex = 1;
    chatWindow.style.filter = "drop-shadow(0px 0px 10px #AAAAAA)";

    // Create close chatbox button.
    let close = document.createElement("i");
    close.innerHTML = `<button type="button" class="btn-close" aria-label="Close"></button>`;
    close.style.position = "absolute";
    close.style.left = "95%"
    close.style.top = "2%"
    close.addEventListener("click", () => {
        messengerPage.style.filter = ""
        messengerPage.style.pointerEvents = "auto";
        chatWindow.innerHTML = "";
        chatWindow.style.display = "none";
        count = 0
        limit = 10
        leaveChat();
        return;
    })

    chatWindow.append(close)

    // Blur background page.
    messengerPage.style.filter = "blur(2px)"
    messengerPage.style.pointerEvents = "none";


    let chatScreen = document.createElement("div");
    // Chat "screen"/box styles.
    chatScreen.style.width = "70%";
    chatScreen.style.height = "70%";
    chatScreen.style.backgroundColor = "white";
    chatScreen.style.border = "1px solid black";
    chatScreen.style.margin = "10px 10px 10px 0px";
    chatScreen.style.overflow = "auto";
    chatScreen.className = "chatScreen";
    chatScreen.id = "chatScreen:" + id;

    chatForm.id = "chatForm";


    input.style.width = "60%";

    // Append different components to chat window.
    chatWindow.append(chatScreen);
    chatForm.append(input);
    let sendMsgButton = document.createElement("button");
    sendMsgButton.innerText = "Send"

    // add data attribute
    chatForm.dataset.chatId = id;

    if (chatForm.childElementCount === 1) {
        chatForm.appendChild(sendMsgButton);
    }
    chatWindow.append(chatForm);

    // Input
    input.type = "text";

}

let wSocket;

function leaveChat() {
    wSocket.close();
    connectForNotifications()
}

async function connectToChatserver(usersInChat, notification = false) {
    var ServiceLocation = "ws://" + document.location.host + "/chat/";

    console.log("connected: " + usersInChat[0] + " and " + usersInChat[1]);

    await fetchData("chats");

    // console.log("All chats: ", chats);

    let chatExists = false;

    // console.log("usersInChat: ", usersInChat);

    if (!!chats) {
        // Check f chat between the two users already exists.
        chats.forEach((chat) => {
            if (chat.user1 === usersInChat[0] && chat.user2 === usersInChat[1]) {
                chatExists = true;
            }
        })
    }


    // console.log("Chat exists: ", chatExists);
    // If chat between the two users already exists, connect to the one that already exists.
    if (chatExists === true) {
        wSocket = new WebSocket(ServiceLocation + usersInChat[0] + "~" + usersInChat[1]);
    } else {
        // Otherwise create a new one.
        wSocket = new WebSocket(ServiceLocation + usersInChat[1] + "~" + usersInChat[0]);
    }



    if (notification === false) {
        wSocket.addEventListener("message", (ev) => {
            OnMessageReceived(ev, usersInChat, notification);
        })
        chatForm.addEventListener("submit", (ev) => {
            ev.stopPropagation();
            ev.preventDefault()
            SendMessage(ev.target)
        })
    } else {
        wSocket.addEventListener("message", (ev) => {
            OnMessageReceived(ev, usersInChat, notification);
        })

    }
}



function SendMessage(target) {

    // This id needs to be revesed so we can show an update when message is sent.
    let idToReverse = target.dataset.chatId

    let split = idToReverse.split("<->")

    var msg = '{"message":"' + input.value + '", "sender":"'
        + localStorage.getItem("username") + `", "receiver":"${split[1]}", "status":"unread"}`;

    if (input.value !== "") {
        wSocket.send(msg);
    }
    input.value = ""
}

function OnMessageReceived(evt, usersInChat, notification) {

    var msg = JSON.parse(evt.data); // native API


    if (notification === true) {
        // Message received notification
        let chatrooms = document.querySelectorAll(".chatRoom");
        console.log(chatrooms);
        chatrooms.forEach((chatroom) => {
            if (chatroom.id === msg.receiver + "<->" + msg.sender) {
                chatroom.style.backgroundColor = "red";


                showUsers(chatroom.id);


                /*
                if (!!notification) {
                    let notifBar = document.createElement("div")
                    notifBar.classList.add("alert")
                    notifBar.classList.add("alert-info")
                    notifBar.role = "alert"
                    notifBar.style.display = "flex"
                    notifBar.style.justifyContent = "space-between"
                    notifBar.innerHTML = `
                            You received a message from ${msg.sender}!
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    `
                    document.getElementById("homepage").prepend(notifBar)
                }
                */
            }
        });



        return
    }

    // showUsers();

    let messageCointainer = document.createElement("div");
    let messageHTML;


    // Create new date and format it.
    let today = new Date();
    let formatted = formatTime([today.getHours(), today.getMinutes(), today.getSeconds()])
    let time = today.toISOString().split('T')[0] + " " + formatted[0] + ":" + formatted[1] + ":" + formatted[2];

    // If client self, add some styles. Orange username and float right etc. else keep it standard.
    if (msg.sender === localStorage.getItem("username")) {
        messageCointainer.style.display = "flex";
        messageCointainer.style.flexDirection = "column";
        messageCointainer.style.justifyContent = "flex-start";
        messageCointainer.style.alignItems = "flex-end";
        messageHTML = '<div style="margin-right: 10px">' + '<p style="margin-bottom: 0; ">' + '<span style="color: orange">' + msg.sender + "</span>" + ': ' + msg.message + '</p>' + '<p style="font-size: 10px; margin-bottom: 1rem">' + time + '</p>' + '</div>';
    } else {
        messageHTML = '<p style="margin-bottom: 0">' + msg.sender + ': ' + msg.message + '</p>' + '<p style="font-size: 10px; margin-bottom: 1rem">' + time + '</p>';
    }
    messageCointainer.innerHTML = messageHTML;

    // Append message to correct chat.
    let chatScreens = document.querySelectorAll(".chatScreen")

    chatScreens.forEach(chatscreen => {
        if (chatscreen.id.includes(usersInChat[0]) && chatscreen.id.includes(usersInChat[1])) {
            chatscreen.append(messageCointainer)
            scrollToBottom(chatscreen)
        }
    });

}


function formatTime(hoursMinutesSeconds) {

    let formatted = hoursMinutesSeconds.map((time) => {
        if (time.toString().length < 2) return '0' + time;
        return time;
    })
    return formatted
}

async function connectForNotifications() {
    await fetchData("sessions")
    let username = localStorage.getItem("username");
    sessions.forEach(session => {
        if (username !== session.username) connectToChatserver([username, session.username], true);
    })
}