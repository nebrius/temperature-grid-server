/*
MIT License

Copyright (c) Bryan Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const SAMPLING_RATE = 500;

app.get('/state', (req, res) => {
  res.send(state);
});

const state = {};

io.on('connection', (socket) => {
  console.log(`Sensor ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`Sensor ${socket.id} disconnected`);
    delete state[socket.id];
  });

  socket.on('register', (msg, ack) => {
    console.log(`Registering sensor ${socket.id} as ${msg.name}`);
    state[socket.id] = {
      name: msg.name,
      temperature: NaN
    };
    ack();
  });

  socket.on('update', (msg) => {
    if (state.hasOwnProperty(socket.id)) {
      state[socket.id].temperature = msg.temperature;
    } else {
      console.error(`Received update from unregistered sensor ${socket.id}`);
    }
  });

});

http.listen(3000, () => {
  console.log('Temperature Grid server listening on port 3000');
});

setInterval(() => {
  console.log(state);
}, SAMPLING_RATE);
