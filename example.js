'use strict';

const ProgressBar = require('./lib');

const progressBar = new ProgressBar(':current/:total [:bar] :elapseds :percent', {
  spinner: 'dots2',
  width: 50,
  total: 100
});

setTimeout(() => {
  progressBar.tick(0);
}, 200);

setTimeout(() => {
  progressBar.tick(50);
}, 1000);

setTimeout(() => {
  progressBar.terminate(() => {
    console.log('done');
  })
}, 2000);
