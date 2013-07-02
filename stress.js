var io = require('socket.io-client');

// node stress.js [url] [number of clients] [delay between edits]
var url = process.argv[2]; // gets the full url
var room = url.split("/")[4]; // get the room from the url
var serverUrl = url.split("/")[0] + "//" + url.split("/")[2]; // get the host url
var clientCount = process.argv[3]; // get number of clients 
var delayBetweenDrawings = process.argv[4]; // Seconds between each change
var totalEdits = 0;
delayBetweenDrawings = delayBetweenDrawings * 1000; // turn seconds into milliseconds..

var i = 0; // for each clientcount create a client which will send edits
while (i < clientCount){
  var userid = uid(); // generate a unique user id
  console.log("Creating client with uid", userid);
  createClient(userid); // create a client, is also responsible for sending messages
  i++;
}

function createClient(userid){
  var socket = io.connect(serverUrl, {'force new connection': true});
  socket.emit('subscribe', { room: room });

  setInterval(function(){ // based on the delay between each edit..
    var path_to_send = {  // create the start of an edit
      name: userid,
      rgba: {
        blue: Math.random(),
        green: Math.random(),
        opacity: Math.random(),
        red: Math.random()
      },
      type: "draw",
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
    socket.emit('draw:progress', room, userid, JSON.stringify(path_to_send)); // send the start of an edit
    path_to_send.path = []; // blank the paths
    path_to_send.end = { // create end co-ords
      x: randCoOrd(),
      y: randCoOrd()
    }

    totalEdits++;  
    console.log("Sent Path #"+totalEdits+" to the server");
    socket.emit('draw:end', room, userid, JSON.stringify(path_to_send)); // send the end event
  }, delayBetweenDrawings);
}

function randCoOrd(){ // generates random coords within xy 1000
  return Math.floor(Math.random()*1000)
}

function uid(){ // generates a random uid
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
