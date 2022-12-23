import {Terminal} from 'xterm';
import { Readline } from "xterm-readline";

let isScreened = false, sendLessExplicit = false;
    
const term = new Terminal();
const rl = new Readline();
term.options.scrollback = 1000;
term.loadAddon(rl);
term.open(document.getElementById('console'));

let lineHandler = (l: string) => { console.log("Default handler", l); };

async function readForever() {
  while (true) {
    const l = await rl.read("");
    lineHandler(l);
  }
}
readForever();

function connectTerm() {
  lineHandler = () => {};
  term.writeln("\x1b[0mConnecting to server...");
  const wsurl = document.location.href.replace(/^https:\/\/(.*)\/game(.html)?(\?.*)?(\#.*)?/, 'wss:\/\/$1/wsgame');
  let webSocket = new WebSocket(wsurl);
  webSocket.addEventListener('open', (event) => {
    lineHandler = (l: string) => { console.log("Send handler", l); webSocket.send(l); }
    term.writeln("\x1b[0mConnected");
  });
  webSocket.addEventListener('close', (event) => {
    lineHandler = connectTerm;
    term.writeln("\x1b[0mDisconnected; use r (followed by enter) to reconnect.");
  });
  webSocket.addEventListener('error', (event) => {
    term.writeln("\x1b[0mNetwork error with connection.");
  });
  webSocket.addEventListener('message', (msg) => {
    term.write(msg.data);
  })
}

function over18() {
  document.getElementById("over18").style.display = 'none';
  isScreened = true;
  window.localStorage['over18'] = true;
  term.focus();
  connectTerm();
}
    
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
const params: {[key:string]: string} =
  location.search.substr(1).split('&')
    .reduce((o, s) => { const [k, v] = s.split('='); o[k] = v; return o;},
            {} as {[key:string]: string});
if (params["source"] && params["source"] === "android") {
  isScreened = true;
  sendLessExplicit = true;
}

if (isScreened || window.localStorage['over18']) {
  over18();
}
