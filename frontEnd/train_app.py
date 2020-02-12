import os
os.environ["KERAS_BACKEND"] = "theano"
import base64
import numpy as np
import io
from PIL import Image
import time
import matplotlib
matplotlib.use('Agg')
import tensorflow as tf

import keras
from keras import backend as K
from keras.models import Sequential
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import img_to_array

from flask import request
from flask import jsonify
from flask import Flask

from keras.layers import Activation
from keras.layers.core import Dense, Flatten
from keras.optimizers import Adam, SGD
from keras.metrics import categorical_crossentropy
from keras.layers.normalization import BatchNormalization
from keras.layers.convolutional import *
import itertools
import matplotlib.pyplot as plt
print(K.image_data_format())
# get_ipython().run_line_magic('matplotlib', 'inline')
from keras.callbacks import CSVLogger
from flask import Flask, render_template
from flask_mysqldb import MySQL
from glob import glob
import datetime
import json 
from flask_mail import Mail, Message

app = Flask(__name__)
app.config['MYSQL_HOST'] = process.env.DB_HOST,
app.config['MYSQL_USER'] = process.env.DB_USERNAME,
app.config['MYSQL_HOST'] = process.env.DB_PASSWORD,
app.config['MYSQL_DB'] = process.env.DB_NAME


mysql = MySQL(app)

mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": 'dlimageclassification',
    "MAIL_PASSWORD": 'sfsucsc899'
}

app.config.update(mail_settings)
mail = Mail(app)

@app.route("/train", methods=["POST"]) # post req (datasets path, params, model name) to endpoint and get trained model
def train():
    ## get http request and extract values
    message = request.get_json(force=True)
    SELECTED_MODEL = message['selectedModel']
    PROJECT_NAME = message['projectName']
    MODELNAME = message['modelName']
    USERID = message['userid']
    EPOCH = message['epoch']
    OPTIMIZER = message['optimizer']
    LEARNING_RATE = message['learningRate']
    train_batch_size = message['train_batch_size']
    test_batch_size = message['test_batch_size']
    USER_EMAIL = message['useremail']
    print(message)
   
    APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top; __file__ refers to the file settings.py 
    train_path =os.path.join(APP_ROOT, 'allProjects', str(USERID), PROJECT_NAME, 'datasets' )
    print('training on data: ', train_path)
    test_path =os.path.join(APP_ROOT, 'allProjects', str(USERID),  PROJECT_NAME, 'testData' )

    trainSize = sum([len(files) for r, d, files in os.walk(train_path)])
    print("trainSize", trainSize)
    testSize = sum([len(files) for r, d, files in os.walk(test_path)])
    print("testSize", testSize)
    # train_batch_size = sqrt(trainSize)
    CLASSES = next(os.walk(train_path))[1]
    CLASSNUM= len(next(os.walk(train_path))[1])
    print("number of classes: ", CLASSNUM)
    print("classes: ", CLASSES)

    ## TODO reset classes names and customize batch_size
    train_datagen = ImageDataGenerator(validation_split=0.25) # set validation split
    train_batches = train_datagen.flow_from_directory(train_path, target_size=(224,224),  batch_size= train_batch_size, subset='training')
    valid_batches = train_datagen.flow_from_directory(train_path, target_size=(224,224),  batch_size= train_batch_size//2, subset='validation')
    test_batches = ImageDataGenerator().flow_from_directory(test_path, target_size=(224,224), batch_size= test_batch_size)
    label_map = (train_batches.class_indices) # label_map:  {'control': 0, 'mutant': 1}
    print("label_map: ",label_map) # TODO use label_map instead of hard set classes
    inv_label_map = {v: k for k, v in label_map.items()}
    for k, v in inv_label_map.items():
        print (k, v)
    
    # fixed time for model and log names
    now = datetime.datetime.now()
    TIME_F = now.strftime("%Y/%m/%d-%H:%M:%S")
    TIME = now.strftime("%Y%m%d-%H%M%S")
    modelName_time = "{}-{}-{}".format(MODELNAME, SELECTED_MODEL, TIME)
    MODEL_DIR =os.path.join(APP_ROOT, 'allProjects', str(USERID),  PROJECT_NAME, 'models/')
    log_name = "{}{}.txt".format(MODEL_DIR, modelName_time)
    csv_logger = CSVLogger(log_name, append=True, separator=';')
    print("date & time: ", TIME_F)
    with open(log_name, "a") as myfile:
        myfile.write("Your model \"" + MODELNAME + "\" is trained at "+TIME_F+";\n\n")
        myfile.write("User inputs: "+json.dumps(message)+";\n\n")
        myfile.write("Class indices: "+json.dumps(inv_label_map)+";\n\n")
        myfile.write("epoch; loss; accuracy; validation_loss; validation_accuracy:\n")

    classes_record = "{}{}classes.py".format(MODEL_DIR, modelName_time)
    with open(classes_record, "a") as classesfile:
        classesfile.write("classesDict = {}".format(inv_label_map))

    # ## Build Fine-tuned VGG16 model
    if (SELECTED_MODEL == 'VGG16'):
        vgg16_model = keras.applications.vgg16.VGG16()

    model = Sequential()
    for layer in vgg16_model.layers[:-1]:
        model.add(layer)

    for layer in model.layers:
        layer.trainable = False # freeze layer weight

    model.add(Dense(CLASSNUM, activation='softmax')) ## TODO customize layer size 2 -> # of categories
    # model.summary()

    # ## Train the fine-tuned VGG16 model
    if (OPTIMIZER == "Adam"):
        model.compile(Adam(lr=LEARNING_RATE), loss='categorical_crossentropy', metrics=['accuracy'])
    
    if (OPTIMIZER == "SGD"):
        model.compile(SGD(lr=LEARNING_RATE), loss='categorical_crossentropy', metrics=['accuracy'])

    # model.fit_generator(train_batches, steps_per_epoch=18, 
    #                     validation_data=valid_batches, validation_steps=10, epochs=15, verbose=2) 
    # ## split train and valid
    model.fit_generator(
        train_batches,
        steps_per_epoch = train_batches.samples // train_batch_size,
        validation_data = valid_batches, 
        validation_steps = valid_batches.samples // test_batch_size,
        epochs = EPOCH, 
        verbose=2,
        callbacks=[csv_logger])    

    # ## test the fine-tuned VGG16 model
    print('testing model on data: ', test_path)
    test_imgs, test_labels = next(test_batches)
    # plots(test_imgs, titles=test_labels)

    test_labels = test_labels[:,0]
    test_labels

    # Returns the loss value & metrics values for the model in test mode with !! OUT OF SAMPLE !! data.
    test_loss, test_acc = model.evaluate_generator(test_batches, steps=test_batches.samples // 10, verbose=0)  # evaluate the out of sample data with model
    print("test loss = {}".format(test_loss))  # model's loss (error)
    print("test accuracy = {}".format(test_acc))  # model's accuracy
    
    with open(log_name, "a") as myfile:
        myfile.write("\ntest loss = {}; ".format(test_loss))
        myfile.write("\ntest accuracy = {}.".format(test_acc))
    # ## Save the fine-tuned VGG16 model TODO save to ../allProject/projetName/model as h5? put flask_predict inside webapp-train?
    # TODO shorter accuracy float point
    NAME = "{}-test_acc{}.h5".format(modelName_time, "%.3f" % test_acc)
    model_path =os.path.join(MODEL_DIR, NAME)
    print('model saved as: ', model_path)
    defaultEpoch = 9
    model.save(model_path)
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO Models(model_path, user_id, project_name, log_path, classes_file, epoch, selected_model, optimizer, learning_rate, test_accuracy, test_loss, timestamp, train_batch_size, model_fullname, classes, favorite) \
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", \
        (model_path, USERID, PROJECT_NAME, log_name, classes_record, EPOCH, SELECTED_MODEL, OPTIMIZER, LEARNING_RATE, test_acc, test_loss, TIME_F, train_batch_size, NAME, json.dumps(inv_label_map), "0"))
    # cur.execute("INSERT INTO Logs(logpath, modelpath) VALUES (%s, %s)", (log_name, model_path))
    mysql.connection.commit()
    cur.close()

    with open(log_name, 'r') as fp:
        line = fp.readline()
        content = ""
        while line:
            content = content+line +'<br>'
            line = fp.readline()

    # with open("/Users/mac/Desktop/899/csc899_masterProject/frontEnd/templates/email-html.html", 'r') as content_file:
    #     htmlcontent = content_file.read()    
    htmlcontent = "<a href=\"http://localhost:5001/logger?path="+ log_name +"\">More actions about this model</a>"
    print("link: ", "http://localhost:5001/logger?path=", log_name)
    # htmlcontent = "http://localhost:5001/logger?path="+ log_name +"\"><button>More actions about this model</button></a>"

    with app.app_context():
        msg = Message(subject="your model is complete",
                      sender=app.config.get("MAIL_USERNAME"),
                      recipients=[USER_EMAIL], # replace with your email for testing
                    #   body= content,
                      html= content + "<br>" + htmlcontent)
                    #   html= "HTML: " + content)
        mail.send(msg)

    response = {
        'log' : log_name,
        'model': NAME
    }
    return jsonify(response)

# predict logic
def get_model():
    global model
    # APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
    # MODEL_DIR =os.path.join(APP_ROOT, 'allProjects', USERID,  'p4','models/') # TODO projectName/models
    # vgg16_path = os.path.join(MODEL_DIR, 'vgg16model.h5')
    # model = load_model(vgg16_path)
    model = load_model('vgg16model.h5')
    print(" * Model loaded!")

def preprocess_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)

    return image
    
@app.route("/predict", methods=["POST"]) # post image to endpoint and get prediction
def predict():
    print(" * Loading model...")
    get_model()  
    # graph  = tf.get_default_graph() #"if 'class_name' not in config[0] or config[0]['class_name'] == 'Merge': KeyError: 0"
    message = request.get_json(force=True)
    encoded = message['image'] # the json data from client with base64 image value
    decoded = base64.b64decode(encoded) # the decoded image data
    image = Image.open(io.BytesIO(decoded)) # create instance of PIL image by wrapping the decoded var in bytes
    processed_image = preprocess_image(image, target_size=(224, 224))
    # global graph ##
    # with graph.as_default(): ##
    #     prediction = model.predict(processed_image).tolist()
    prediction = model.predict(processed_image).tolist() # numpy array into python list
    print("prediction: ", prediction)
    response = {
        'prediction': {
            'control': prediction[0][0],
            'mutant': prediction[0][1]
        }
    }
    return jsonify(response)
