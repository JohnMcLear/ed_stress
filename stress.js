var io = require('socket.io-client');

// node stress.js [url] [number of clients] [delay between edits]
var url = process.argv[2]; // gets the full url
var room = url.split("/")[4]; // get the room from the url
var serverUrl = url.split("/")[0] + "//" + url.split("/")[2]; // get the host url
var clientCount = process.argv[3]; // get number of clients 
var delayBetweenDrawings = process.argv[4]; // Seconds between each change
var sockets = {};

// turn sconds into ms
delayBetweenDrawings = delayBetweenDrawings * 1000;

var i = 0;
// for each clientcount create a client which will send edits
while (i < clientCount){
  var userid = uid();
  console.log("Creating client with uid", userid);
  createClient(uid);
  i++;
}

function createClient(userid){
  sockets[userid] = io.connect(serverUrl, {'force new connection': true});
  sockets[userid].emit('subscribe', { room: room });

  setInterval(function(){
    var path_to_send = { 
      name: userid,
      rgba: {
        blue: randColor(),
        green: randColor(),
        opacity: randColor(),
        red: randColor()
      },
      start: {
        x: randCoOrd(),
        y: randCoOrd()
      },
      path: [{
        "top": ["Point", randCoOrd(), randCoOrd()],
        "bottom": ["Point", randCoOrd(), randCoOrd()]
      }, {
        "top": ["Point", randCoOrd(), randCoOrd()],
        "bottom": ["Point", randCoOrd(), randCoOrd()]
      }]
   }
    sockets[userid].emit('draw:progress', room, userid, JSON.stringify(path_to_send));
    path_to_send.path = [],
    path_to_send.end = {
      x: randCoOrd(),
      y: randCoOrd()
    }
  
    console.log("Sent Path");
    sockets[userid].emit('draw:end', room, userid, JSON.stringify(path_to_send));
  }, delayBetweenDrawings);
}


function randColor(){
  return Math.random();
}
 
function randCoOrd(){
  return Math.floor(Math.random()*1000)
}

function uid() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
//());

