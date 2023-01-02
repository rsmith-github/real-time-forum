
async function Login(e) {

    e.preventDefault()
    let username = document.getElementById("username-input").value;
    // let nickname = document.getElementById("nickname-input").value;
    let password = document.getElementById("password-input").value;

    // send data to backend
    await sendJsonToBackend("login", username, password);
    
    await fetchData("sessions")

    // Check if nickname is valid.
    let nName_uName = users.filter(user => {
        return user.nickname === username.toString()
    })

    if (nName_uName[0]) {
        localStorage.setItem("username", nName_uName[0].username);
    } else {
        localStorage.setItem("username", username);
    }

    // Get cookie to compare
    let currentCookie = getCookie("session")

    // Check valid
    let valid = false

    // if sessions exist, loop through and validate user's cookie.
    if (!!sessions) sessions.forEach(session => {
        if (session.sessionUUID === currentCookie) {
            // Connect to chat for notifications.
            valid = true;
            return
        }
    })


    if (!!valid) {

        showPage("homepage");
        // await connectForNotifications()
        showUsers();

        // let currentUser = localStorage.getItem("username");
        // if (!!sessions) {
        //     users.forEach(session => {
        //         if (currentUser !== session.username) {
        //             connectToChatserver([currentUser, session.username], true);
        //         }
        //     })
        // }

    } else {
        alert("Details invalid!!")
    }

}

// codegrepper Jeff le
function getCookie(cname) {
    const cookies = Object.fromEntries(
        document.cookie.split(/; /).map(c => {
            const [key, v] = c.split('=', 2);
            return [key, decodeURIComponent(v)];
        }),
    );
    return cookies[cname] || '';
}


function Register() {
    let username = document.getElementById("reg-username").value
    let email = document.getElementById("reg-email").value;
    let nickname = document.getElementById("reg-nickname").value;
    let age = document.getElementById("reg-age").value;
    let password = document.getElementById("reg-password").value;
    let confirmation = document.getElementById("reg-confirmation").value;

    if (password !== confirmation) {
        alert("Passwords don't match.")
    } else if (username === "" || email === "" || nickname === "" || age === "" || password === "" || confirmation === "") {
        alert("Please fill all forms.")
    } else {
        console.log(username, email, nickname, password, confirmation);
        sendJsonToBackend("register", username, email, nickname, [Number(age), password, confirmation]);
        alert("registered successfully!")
    }


}