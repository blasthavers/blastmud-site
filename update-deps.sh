#!/bin/bash

npx webpack
cp ./node_modules/xterm/css/xterm.css ./assets/
cp dist/main.js ./assets/main.js
