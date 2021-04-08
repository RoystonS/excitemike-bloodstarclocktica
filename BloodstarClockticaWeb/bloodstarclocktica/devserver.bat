@echo off
::echo open http://localhost:8000
::python -m http.server
call npm install --global http-server
http-server -o