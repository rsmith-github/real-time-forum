
function Login() {
    let loginBtn = document.getElementById("loginBtn")
    if (!!loginBtn) {
        loginBtn.addEventListener("click", () => {
            let username = document.getElementById("username-input").value;
            let password = document.getElementById("password-input").value;

            // send data to backend
            sendJsonToBackend("login", username, password);

            localStorage.setItem("username", username.toString())
            // Only show page if user is validated.
            let valid = false;

            let validUser;

            fetchData("sessions");


            validUser = sessions.filter((session) => {
                return session.username === username;
            })
            if (validUser.length === 1) {
                valid = true;
            } else {
                // If taking too long, assume that the password or username was incorrect.
                // alert("Username or password incorrect.");
                console.log("Wrong password");
            }


            if (valid === true) {
                showPage("homepage");
                document.querySelector("#login").innerHTML = "";
                console.log("user validated");
            } else {
                // loginBtn.click();
                console.log("user not validated on client side");
            }


        })
    } else {
        console.log("Error, login button does not exist.")
    }
}


function Register() {
    let registerBtn = document.getElementById("registerBtn")

    if (!!registerBtn) {



        registerBtn.addEventListener("click", () => {
            let username = document.getElementById("reg-username").value
            let email = document.getElementById("reg-email").value;
            let nickname = document.getElementById("reg-nickname").value;
            let password = document.getElementById("reg-password").value;
            let confirmation = document.getElementById("reg-confirmation").value;

            if (password !== confirmation) {
                alert("Passwords don't match.")
            } else if (username === "" || email === "" || nickname === "" || password === "" || confirmation === "") {
                alert("Please fill all forms.")
            }

            console.log(username, email, nickname, password, confirmation);
            sendJsonToBackend("register", username, email, nickname, [password, confirmation]);

            alert("registered successfully!")

        });
    }
}