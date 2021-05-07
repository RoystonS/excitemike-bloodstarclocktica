# Setup

## Getting started

Once you have cloned the repository, you can get set up to work in it by:

1. install npm
2. on the command line in project directory: `npm install`
3. You can then
    - Build: `npm run-script builddev` or `npm run-script buildprod`
    - Run the automatic building and development server: `npm run-script watch`
    - Serve files locally: `npm run-script serve`
    - In VS Code, tasks are set up for the above. Just press Ctrl+B and select which thing you'd like.

I like to use ESLint, too. For that, you'll want to

1. install eslint-typescript-support: `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`

## How project was initialized

Initial setup was done like this. **(DO NOT do this with an already set-up project)**

1. install npm
2. on the command line in project directory:

    1. > `npm init -y`
    2. > `npm install --save-dev typescript webpack webpack-cli ts-loader style-loader css-loader live-server npm-run-all mini-css-extract-plugin css-minimizer-webpack-plugin html-minimizer-webpack-plugin copy-webpack-plugin file-loader jszip`
