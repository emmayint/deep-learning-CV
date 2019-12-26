# Model training Web Application

## Steps to install and run the training Module
- download the module branch csc899_masterProject-backEndPredictionMod.
- the model file (.h5) is larger than github's limit. download it from https://drive.google.com/file/d/1HfYQa7juMvmXWoUjTEMKMVEJ7Q71MpZ1/view?usp=sharing and put the h5 file in the directory.


### Step 1 - run Flask app
- Open the directory ‘csc899_masterProject-backEndPredictionMod’ in Visual Studio Code and open two terminal windows.
- Install all dependencies in train_app.py and Python 3.6.
- Run flask server:
$ export FLASK_APP=train_app.py
$ flask run

### Step 2 - Set up Frontend
- Install dependencies - run command: `npm i`
- Run `node app.js` and open http://127.0.0.1:8000/ in browser
