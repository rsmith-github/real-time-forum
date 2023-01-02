# Forum

<sub>Collaborators: Remi, Maya</sub>

## Description

**_Real Time Forum_** is a single page web application that allows users to ask questions and start discussions about Golang, Javascript, and Rust. It is similar to popular forums like _Reddit_, _Quora_, and _Stackoverflow_.

This project features an SQL database to manage user information and activities such as comments. It also includes a dockerfile, which can be used to host the application in a virtual docker environment for use on any operating system.

In addition to these standard social media features, our forum also has a real-time chat feature. This allows users to communicate with each other in real-time, without having to refresh the page.

## Usage

#### Host locally:

- After cloning the repository, run ```cd forum``` in the command line to change into the working directory.
- Run ```go run .``` to run the program, and open your web browser at localhost:8080.

Alternatively, compile the main.go file by running ```go build main.go``` and then ```./main``` to run the executable file generated.

</br>

#### Using docker: 
</br> After installing Docker and cloning the repository:
</br>
- Run $ ```docker build -t forum .```
- Run $ ```docker run -p 8080:8080 -it forum```
- A window on your browser will popup with the landing page. From here you can sign up and login to use the forum.