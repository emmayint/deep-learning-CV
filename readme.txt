instructions

the model file (.h5) is bigger than github's limit. download it from https://drive.google.com/file/d/1HfYQa7juMvmXWoUjTEMKMVEJ7Q71MpZ1/view?usp=sharing and put the h5 file in the directory or the prediction  won't work.

run node server:
$ npm i
$ node app.js

run flask server:
$ export FLASK_APP=predict_app.py
$ flask run
