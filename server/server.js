const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



io.on('connection', (socket)=> {
    socket.emit("test", "testmsg");

    socket.on("play", index => {
        console.log("server received", index);
        const currentRoom = Array.from(socket.rooms)[1];
        socket.to(currentRoom).emit("play", index);
    });

    socket.on("reset", () =>{
        console.log("server received", "reset");
        const currentRoom = Array.from(socket.rooms)[1];
        socket.to(currentRoom).emit("reset");
    })

    socket.on("host", () =>{
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let _room = '';

        do{
            for(let i = 0; i < 6; i++){
                _room += characters.charAt(Math.floor(Math.random() * characters.length));
            }
        } while (adRooms.filter(e => e.name == _room).length != 0); // rooms.includes(_room)

        
        adRooms.push({name: _room, users: [socket.id]});
        socket.join(_room);
        console.log(socket.id + " created: " + _room);


        socket.emit("createdRoom", _room);
    })

    socket.on("joinGame", id =>{ 
        if(adRooms.filter(e => e.name == id).length > 0){
            if(adRooms.filter(e => e.name == id)[0].users.length > 1){
                socket.emit("cantJoinFull");
                return;
            } 

            socket.join(id);
            console.log(socket.id + " joined: " + id);
            socket.to(id).emit("userJoined");
            socket.emit("joined");
            adRooms.filter(e => e.name == id)[0].users.push(socket.id);
        } else {
            socket.emit("cantJoinNotFound");
        }
    });

    socket.on("disconnecting", () => {
        const currentRoom = Array.from(socket.rooms)[1];
        if(currentRoom == undefined) return;


        io.to(adRooms.filter(e => e.name == currentRoom)[0].users.filter(f => f != socket.id)).emit("opponentLeft");
        
        adRooms.filter(e => e.name == currentRoom)[0].users = adRooms.filter(e => e.name == currentRoom)[0].users.filter(f => f == socket.id);
    });

});




let adRooms = [];


server.listen(3009);