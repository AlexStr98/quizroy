import io from "socket.io-client";
var socketURL; 
if(process.env.NODE_ENV === 'production'){
    socketURL = window.location.hostname;
}else{
    socketURL = 'http://localhost:8080';
}
//var socket = io('http://localhost:8080');
var socket = io.connect(socketURL);
//var url = 'http://localhost:'+process.env.PORT;
//var socket = io(url)
export default socket;