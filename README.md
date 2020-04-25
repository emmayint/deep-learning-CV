# Image Analysis Web Application

## Steps to install and run the prediciton Module

git clone the prediction module branch:

`git clone https://github.com/sushilkplassar/csc899_masterProject.git`

### Step 1 - Set up Database

- Create a new database under mySQL workbench.
- Create a new schema under this database
- Import the sql script(‘table_schema.sql’ placed under folder csc899_masterProject/dbSchema) to create the underlying tables for the project

### Step 2 - Set up Frontend

- Open the directory ‘csc899_masterProject/frontEnd ’ in visual code studio
- Put the DB details in the .env file under directory csc899_masterProject/frontEnd
- Install dependencies - run command: `npm i`

### Step 3 - Set up the Backend

- Open the directory ‘csc899_masterProject/backEnd_ML_API’ in PyCharm
- Create the virtual environment by following instructions under - https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html
- Install the dependencies by running the command: `pip install -r requirements.txt`

### Step 4 - Start the Server/Application

- From PyCharm code run : `python3 manage.py runserver`. It will start back-end at http://127.0.0.1:8000/
- From visual studio code run : `npm start`
- Open a new browser with the link: http://localhost:5001/

### Step by Step Prediction Module instruction manual with screenshots

https://github.com/sushilkplassar/csc899_masterProject/blob/master/User_Manual_Prediction.pdf

### Step 5 - Start the Flask Server

- Open the directory ‘csc899_masterProject/frontEnd ’ in visual code studio
- Install the dependencies by running the command: `pip install -r requirements.txt`
  <!-- - From visual studio code run : `export FLASK_APP=train_app.py` then `flask run` -->
- run `python3 train_app.py`
