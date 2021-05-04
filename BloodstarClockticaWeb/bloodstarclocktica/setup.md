# setup

initial setup was done like this:

1. install npm
2. on the command line in project directory:

    1. > `npm init -y`
    2. > `npm install --save-dev typescript webpack webpack-cli ts-loader style-loader css-loader live-server npm-run-all mini-css-extract-plugin css-minimizer-webpack-plugin html-minimizer-webpack-plugin copy-webpack-plugin file-loader`

3. You can then build with `npm run-script builddev` or `npm run-script buildprod` or run the automatic building and development server with `npm run-script watch` and `npm run-script serve`. Or in VS Code, press Ctrl+B and select which thing you'd like.
