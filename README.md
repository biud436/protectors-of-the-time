# Introduction

This tool allows you to start up the browser automatically and control it by sending commands for watching video. It is useful for testing web applications.

# Installation

before starting this tool, you need to install the following dependencies using yarn or npm:

```bash
yarn install
```

and then next you need to create a `.env` file in the root directory of the project and add the following variables:

```bash
ID=<ID>
PW=<PASSWORD>
```

# Usage

you can start the server by running the following command:

```bash
yarn start:server
```

and then you have to open the url called `http://127.0.0.1:3000` in the browser.

<img width="707" alt="image" src="https://user-images.githubusercontent.com/13586185/200312804-bf9bc49f-6d0f-47a1-b5ed-79187a8641c9.png">

and then next click the button named `(매크로시작)`.

# Dependencies

-   [Selenium](https://www.selenium.dev/)
-   [Socket.io](https://socket.io/)
