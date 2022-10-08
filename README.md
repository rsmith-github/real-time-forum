# Forum

<sub>Remi, Maya, ...</sub>

## Description

**_Real Time Forum_** is a web application similar to _Reddit_, _Quora_, and _Stackoverflow_ where users can ask questions and start discussions. For this project, it has been based on 01 Founders and allows users to ask questions and post images regarding Golang, Javascript or Rust and provide answers or resources. An SQL database has been implemented to handle user information and activities such as comments and a dockerfile is used to host the application in a virtual docker environment for use on any OS. Additionally, **_Real Time Forum_** also has a real-time-chat feature.

## Usage

#### Host locally:

- After cloning the repository from gitea, run 'cd forum' in the command line to change into the working directory.
- Run go run . to run the program, and open your web browser at localhost:8080.
  </br>

#### Using docker: After installing Docker and cloning the repo:

- Run $ 'docker build -t forum .'
- Run $ 'docker run -p 8080:8080 -it forum'
  </br>

- A window on your browser will popup with the forum landing page. If you would like to view the posts available, select the option in the login popup to **"preview forum"**. You will not be able to engage with the posts or create your own here.
- If you wish to post your own content, please register for an account and login. You will have access to posting, liking, and commenting features upon logging in.
