Progress Bar with Spinner.

## Installation

```bash
$ npm install spinner-progressbar
```

## Usage

Please refer [node-progress](https://github.com/visionmedia/node-progress)

Spinners are avaliable from [here](https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json), just specify the spinner in options:

```javascript
let progressBar = new ProgressBar(':current/:total [:bar] :elapseds :percent',
  {
    spinner: 'dots2',
    width: 50,
    total: 100
  }
);

```

The above example result in a progress bar like the one below.

```
⢿ 50/100 [=========================-------------------------] 0.0s 50%
```


## License

MIT
