import {WebSocketServer} from "ws";
import {
    _runStepInterval,
    movePlayer1Down,
    movePlayer1Left,
    movePlayer1Right,
    movePlayer1Up,
    subscribe
} from "./game.data.js";

const wss = new WebSocketServer({port: 3000});

const channels = [];

wss.on("connection", function connection(channel) {
    let moveCommand = {};
    let role = '';
    channels.push(channel);
    channel.on("message", function message(command) {
        if (Buffer.isBuffer(command)) {
            // Преобразовать Buffer в строку
            moveCommand = JSON.parse(command.toString());
            role = moveCommand.payload.role;
            console.log('From Front: ' + moveCommand.type + ',  '+ role);
        }
        switch (moveCommand.type) {
            case "movePlayer1Up":
                movePlayer1Up(role);
                break;
            case "movePlayer1Down":
                movePlayer1Down(role);
                break;
            case "movePlayer1Right":
                movePlayer1Right(role);
                break;
            case "movePlayer1Left":
                movePlayer1Left(role);
                break;
        }
    });
});

subscribe((command) => {
    channels.forEach(channel => {
        channel.send(JSON.stringify(command));
    })
    console.log('From Back: '+JSON.stringify(command));
})

_runStepInterval();
