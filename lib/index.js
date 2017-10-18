'use strict';

const logUpdate = require('log-update');
const cliSpinners = require('cli-spinners');

exports = module.exports = ProgressBar;

function ProgressBar(fmt, options) {
    this.stream = options.stream || process.stderr;

    if (typeof(options) === 'number') {
        let total = options;
        options = {};
        options.total = total;
    } else {
        options = options || {};
        if ('string' !== typeof fmt) throw new Error('format required');
        if ('number' !== typeof options.total) throw new Error('total required');
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

    this.callback = options.callback || function () {
    };
    this.tokens = {};

    this.spinner = cliSpinners[options.spinner] || cliSpinners['dots'];
    this.barText = options.text || '';

    this.i = 0;
    this.intervalId = setInterval(() => {
        const frames = this.spinner.frames;
        logUpdate(frames[this.i = ++this.i % frames.length] + ' ' + this.barText);
    }, this.spinner.interval);
}

ProgressBar.prototype.tick = function (len, tokens) {
    if (len !== 0)
        len = len || 1;

    // swap tokens
    if ('object' === typeof len) {
        tokens = len;
        len = 1;
    }
    if (tokens) this.tokens = tokens;

    // start time for eta
    if (0 === this.curr) this.start = new Date();

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

ProgressBar.prototype.render = function (tokens) {
    if (tokens) this.tokens = tokens;

    let ratio = this.curr / this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    let percent = Math.floor(ratio * 100);
    let incomplete, complete, completeLength;
    let elapsed = new Date - this.start;
    let eta = (percent === 100) ? 0 : elapsed * (this.total / this.curr - 1);
    let rate = this.curr / (elapsed / 1000);

    let str = this.fmt
        .replace(':current', this.curr)
        .replace(':total', this.total)
        .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
        .replace(':eta', (isNaN(eta) || !isFinite(eta)) ? '0.0' : (eta / 1000)
            .toFixed(1))
        .replace(':percent', percent.toFixed(0) + '%')
        .replace(':rate', Math.round(rate));

    let availableSpace = Math.max(0, process.stderr.columns - str.replace(':bar', '').length);
    if (availableSpace && process.platform === 'win32') {
        availableSpace = availableSpace - 1;
    }

    let width = Math.min(this.width, availableSpace);

    completeLength = Math.round(width * ratio);
    complete = new Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
    incomplete = new Array(Math.max(0, width - completeLength + 1)).join(this.chars.incomplete);

    /* add head to the complete string */
    if (completeLength > 0)
        complete = complete.slice(0, -1) + this.chars.head;

    /* fill in the actual progress bar */
    str = str.replace(':bar', complete + incomplete);

    /* replace the extra tokens */
    if (this.tokens) for (let key in this.tokens) str = str.replace(':' + key, this.tokens[key]);

    this.barText = str;
};

ProgressBar.prototype.terminate = function () {
    setTimeout(() => {
        clearInterval(this.intervalId);
    }, this.spinner.interval);
};
