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

import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const UPDATE_RATE = 2000;

ReactDOM.render(
  <h1>Loading...</h1>,
  document.getElementById('content')
);

update();
setInterval(update, UPDATE_RATE);

function createCard(sensor) {
  return (
    <div className={classNames('card', 'darken-1', { 'blue-grey': !sensor.connected, 'green': sensor.connected })} key={sensor.name}>
      <div className="card-content white-text">
        <span className="card-title">{sensor.name}</span>
        <table>
          <thead>
            <tr>
              <td>Current</td>
              <td>Min</td>
              <td>Max</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{sensor.currentTemperature}</td>
              <td>{sensor.minTemperature}</td>
              <td>{sensor.maxTemperature}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="card-action white-text">
        <span>{sensor.connected ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  );
}

function render(data) {
  const cards = [];
  for (const sensorName in data) {
    cards.push(createCard(data[sensorName]));
  }
  ReactDOM.render(
    (<div className="temperature-container">{cards}</div>),
    document.getElementById('content')
  );
}

function update() {
  fetch(new Request('/api/sensors'))
    .then((response) => response.json())
    .then(render);
}
