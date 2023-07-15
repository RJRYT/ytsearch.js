# ytsearch.js

  [![NPM Version][npm-version-image]][npm-url]
  [![NPM Install Size][npm-install-size-image]][npm-install-size-url]
  [![NPM Downloads][npm-downloads-image]][npm-downloads-url]

Youtube content search warpper for nodejs

# Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):


``` pip
npm install ytsearch.js
```


# Usage

``` js
const ytsearch = require('ytsearch.js');

const results = await ytsearch("Black Panther");
for(i=0;i<6;i++) console.log(results[i].title, results[i].shortViewCount)

//Output

Marvel Studios Black Panther - Official Trailer 50.5M

Wakanda Battle - Im Not Dead Scene - Black Panther Returns - Black Panther (2018) Movie Clip 19.9M

Hiding in the Shadows | The Real Black Panther | National Geographic Wild UK 4.2M

Meet The K2 Black Panther – One Of The World’s Best Tanks (Not Made In the USA) 13K

(Black Panther) Best Action Hollywood Blockbuster Movie in Hindi Full Action HD 633.7K

Black Panther - Car Chase Scene -  Movie clip Epic  4k UHD 428.8K


 ```


[npm-downloads-image]: https://badgen.net/npm/dm/ytsearch.js
[npm-downloads-url]: https://npmcharts.com/compare/ytsearch.js?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/ytsearch.js
[npm-install-size-url]: https://packagephobia.com/result?p=ytsearch.js
[npm-url]: https://npmjs.org/package/ytsearch.js
[npm-version-image]: https://badgen.net/npm/v/ytsearch.js