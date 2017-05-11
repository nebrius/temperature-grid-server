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

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const SAMPLING_RATE = 500;
const MAX_HISTORY_SAMPLES = 100;

const sensors = {};

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/api/sensors', (req, res) => {
  res.send(sensors);
});

io.on('connection', (socket) => {
  console.log(`Sensor ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`Sensor ${socket.id} disconnected`);
    for (const sensorName in sensors) {
      if (sensors[sensorName].socketId === socket.id) {
        sensors[sensorName].connected = false;
        return;
      }
    }
    console.warn('Could not deregister disconnected sensor');
  });

  socket.on('register', (msg, ack) => {
    console.log(`Registering sensor ${socket.id} as "${msg.name}"`);
    if (sensors[msg.name]) {
      sensors[msg.name].socketId = socket.id;
      sensors[msg.name].connected = true;
    } else {
      sensors[msg.name] = {
        socketId: socket.id,
        name: msg.name,
        currentTemperature: NaN,
        maxTemperature: -Infinity,
        minTemperature: Infinity,
        recentSamples: [],
        connected: true
      };
    }
    ack();
  });

  socket.on('update', (msg) => {
    sensors[msg.name].currentTemperature = msg.temperature;
  });

});

http.listen(3000, () => {
  console.log('Temperature Grid server listening on port 3000');
});

setInterval(() => {
  for (const sensorName in sensors) {
    const sensor = sensors[sensorName];
    if (isNaN(sensor.currentTemperature)) {
      continue;
    }
    if (sensor.maxTemperature < sensor.currentTemperature) {
      sensor.maxTemperature = sensor.currentTemperature;
    }
    if (sensor.minTemperature > sensor.currentTemperature) {
      sensor.minTemperature = sensor.currentTemperature;
    }
    sensor.recentSamples.push(sensor.currentTemperature);
    if (sensor.recentSamples.length > MAX_HISTORY_SAMPLES) {
      sensor.recentSamples.shift();
    }
  }
}, SAMPLING_RATE);
