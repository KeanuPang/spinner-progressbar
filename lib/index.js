'use strict';

const logUpdate = require('log-update');
const cliSpinners = require('cli-spinners');

function ProgressBar(fmt, user_options) {
  let options = {};
  if (typeof user_options === 'number') {
    options.total = user_options;
  } else {
    options = user_options || {};
    if ('string' !== (typeof fmt)) throw new Error('format required');
    if ('number' !== (typeof options.total)) throw new Error('total required');
  }

  this.fmt = fmt;
  this.curr = options.curr || 0;
  this.total = options.total;
  this.width = options.width || this.total;
  this.clear = options.clear;
  this.chars = {
    complete: options.complete || '=',
    incomplete: options.incomplete || '-',
    head: options.head || (options.complete || '=')
  };

  this.callback = options.callback || (() => {
  });
  this.tokens = {};

  this.spinner = cliSpinners[options.spinner] || cliSpinners['dots'];
  this.barText = options.text || '';

  this.i = 0;
  this.intervalId = setInterval(() => {
    logUpdate((this.spinner.frames[this.i = (++this.i) % this.spinner.frames.length]) + ' ' + this.barText);
  }, this.spinner.interval);
}

ProgressBar.prototype.tick = function tick(user_len, user_tokens) {
  let len = 1;
  if (user_len !== 0) {
    len = user_len || 1;
  }

  // swap tokens
  if ('object' === typeof user_len) {
    this.tokens = user_len;
    len = 1;
  }
  if (user_tokens) {
    this.tokens = user_tokens;
  }

  // start time for eta
  if (0 === this.curr) {
    this.start = new Date();
  }

  this.curr += len;

  this.render();
  // progress complete
  if (this.curr >= this.total) {
    this.render();
    this.complete = true;
    this.terminate();
    this.callback(this);
  }
};

ProgressBar.prototype.render = function render(tokens) {
  if (tokens) {
    this.tokens = tokens;
  }

  let ratio = this.curr / this.total;
  ratio = Math.min(Math.max(ratio, 0), 1);

  const percent = Math.floor(ratio * 100);
  const elapsed = new Date() - this.start;
  const eta = (percent === 100) ? 0 : elapsed * ((this.total) / (this.curr - 1));
  const rate = this.curr / (elapsed / 1000);

  let str = this.fmt
    .replace(':current', this.curr)
    .replace(':total', this.total)
    .replace(':elapsed', Number.isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
    .replace(':eta', (Number.isNaN(eta) || !Number.isFinite(eta)) ? '0.0' : (eta / 1000)
      .toFixed(1))
    .replace(':percent', percent.toFixed(0) + '%')
    .replace(':rate', Math.round(rate));

  let availableSpace = Math.max(0, process.stderr.columns - str.replace(':bar', '').length);
  if (availableSpace && process.platform === 'win32') {
    availableSpace -= 1;
  }

  const width = Math.min(this.width, availableSpace);
  const completeLength = Math.round(width * ratio);
  let complete = new Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
  const incomplete = new Array(Math.max(0, (width - completeLength) + 1)).join(this.chars.incomplete);

  /* add head to the complete string */
  if (completeLength > 0) {
    complete = complete.slice(0, -1) + this.chars.head;
  }

  /* fill in the actual progress bar */
  str = str.replace(':bar', complete + incomplete);

  /* replace the extra tokens */
  if (this.tokens) {
    Object.keys(this.tokens).forEach((key) => {
      str = str.replace(':' + key, this.tokens[key]);
    });
  }

  this.barText = str;
};

ProgressBar.prototype.terminate = function terminate(callback) {
  setTimeout(() => {
    clearInterval(this.intervalId);
    if (callback) {
      callback();
    }
  }, this.spinner.interval);
};

module.exports = ProgressBar;
