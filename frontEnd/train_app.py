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
# from sklearn.metrics import confusion_matrix
from mlxtend.evaluate import confusion_matrix

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
# app.config['MYSQL_HOST'] = process.env.DB_HOST,
# app.config['MYSQL_USER'] = process.env.DB_USERNAME,
# app.config['MYSQL_HOST'] = process.env.DB_PASSWORD,
# app.config['MYSQL_DB'] = process.env.DB_NAME
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '980731@muyan'
app.config['MYSQL_DB'] = 'csc899'

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
    EPOCH = int(message['epoch'])
    OPTIMIZER = message['optimizer']
    LEARNING_RATE = float(message['learningRate'])
    print("LEARNING_RATE", LEARNING_RATE)
    train_batch_size = int(message['train_batch_size'])
    test_batch_size = int(message['test_batch_size'])
    USER_EMAIL = message['useremail']
    # EXP_ID=message['exp_id']
    print(message)
   
    # expid=0;
    exptitle=PROJECT_NAME+"-testData"
    cur = mysql.connection.cursor()
    cur.execute("SELECT exp_id FROM experiments WHERE exp_title = '%s'" % exptitle)
    expid = cur.fetchall()
    print("expid", expid)

    APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top; __file__ refers to the file settings.py 
    train_path =os.path.join(APP_ROOT, 'public', 'allProjects', str(USERID), PROJECT_NAME, 'datasets' )
    print('training on data: ', train_path)
    test_path =os.path.join(APP_ROOT, 'public', 'allProjects', str(USERID),  PROJECT_NAME, 'testData' )

    trainSize = sum([len(files) for r, d, files in os.walk(train_path)])
    print("trainSize", trainSize)
    testSize = sum([len(files) for r, d, files in os.walk(test_path)])
    print("testSize", testSize)
    # train_batch_size = sqrt(trainSize)


    ## TODO reset classes names and customize batch_size
    train_datagen = ImageDataGenerator(validation_split=0.25) # set validation split
    train_batches = train_datagen.flow_from_directory(train_path, target_size=(224,224), batch_size= train_batch_size, subset='training')
    valid_batches = train_datagen.flow_from_directory(train_path, target_size=(224,224), batch_size= train_batch_size//2, subset='validation')
    test_batches = ImageDataGenerator().flow_from_directory(test_path, target_size=(224,224), batch_size= test_batch_size)
    label_map = (train_batches.class_indices) # label_map:  {'control': 0, 'mutant': 1}
    print("label_map: ",label_map) # TODO use label_map instead of hard set CLASSES
    inv_label_map = {v: k for k, v in label_map.items()} # {"0": "control", "1": "mutant"}
    CLASSES = [*label_map]
    CLASSNUM= len(CLASSES)
    print("Number of classes: ", CLASSNUM)
    print("CLASSES: ", CLASSES)
    
    # ## fixed time for model and log names
    now = datetime.datetime.now()
    TIME_F = now.strftime("%Y/%m/%d-%H:%M:%S")
    # TIME = now.strftime("%Y%m%d-%H%M%S")
    # modelName_time = "{}-{}-{}".format(MODELNAME, SELECTED_MODEL, TIME_F)
    PROJ_DIR =os.path.join(APP_ROOT, 'public', 'allProjects', str(USERID),  PROJECT_NAME)
    MODEL_DIR =os.path.join(APP_ROOT, 'public', 'allProjects', str(USERID),  PROJECT_NAME, 'models/')
    # NAME = "{}-{}.h5".format(MODELNAME, SELECTED_MODEL)
    NAME = "{}.h5".format(MODELNAME)
    model_path =os.path.join(MODEL_DIR, NAME)

    # ## create the training log file
    # log_name = "{}{}.txt".format(MODEL_DIR, NAME)
    log_name = "{}{}.csv".format(MODEL_DIR, MODELNAME)
    # csv_logger = CSVLogger(log_name, append=True, separator=';')
    csv_logger = CSVLogger(log_name, append=True, separator=',')
    print("date & time: ", TIME_F, "NAME",NAME, "log_name",log_name)

    # with open(log_name, "a") as myfile:
        # myfile.write("Your model \"" + MODELNAME + "\" is trained at "+TIME_F+";\n\n")
        # myfile.write("User inputs: "+json.dumps(message)+";\n\n")
        # myfile.write("Class indices: "+json.dumps(inv_label_map)+";\n\n\n")
        # myfile.write("epoch;accuracy;loss;validation_accuracy;validation_loss\n")


    # ## Build Fine-tuned VGG16 model
    # if (SELECTED_MODEL == 'VGG16'):
    print(" * Loading keras vgg16 model")
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
    # model.fit_generator(
    model.fit(
        train_batches,
        steps_per_epoch = train_batches.samples // train_batch_size,
        validation_data = valid_batches, 
        validation_steps = valid_batches.samples // (train_batch_size//2),
        epochs = EPOCH, 
        verbose=2,
        callbacks=[csv_logger])    

    # ## test the fine-tuned VGG16 model
    print('testing model on data: ', test_path)
    test_imgs, test_labels = next(test_batches)
    # plots(test_imgs, titles=test_labels)

    test_labels = test_labels[:,0]
    test_labels


    # TODO merge evaluate and predict on testing data
    # Returns the loss value & metrics values for the model in test mode with !! OUT OF SAMPLE !! data.
    test_loss, test_acc = model.evaluate_generator(test_batches, steps=test_batches.samples // test_batch_size, verbose=0)  # evaluate the out of sample data with model
    print("test loss = {}".format(test_loss))  # model's loss (error)
    print("test accuracy = {}".format(test_acc))  # model's accuracy
    
    # ## acc and loss are now stored in db
    # with open(log_name, 'r') as original: data = original.read()
    # with open(log_name, 'w') as modified: modified.write("\ntest accuracy = {}.".format("%.3f" % test_acc) + "\ntest loss = {}; \n".format("%.3f" % test_loss) + data)


    # ## Save the fine-tuned VGG16 model
    print('model saved as: ', model_path)
    defaultEpoch = 9
    model.save(model_path)

    # confusion matrix with .predict
    print("Computing confusion matrix...")
    test_batches.reset()
    test_imgs, test_labels = next(test_batches)
    predictions = model.predict(test_batches, steps=1, verbose=0)
    # print(test_labels)
    # print(predictions)
    cm = confusion_matrix(test_labels.argmax(axis=1), predictions.argmax(axis=1), binary=False)
    print("cm: ", cm)
    cm_string = ','.join(str(item) for innerlist in cm for item in innerlist)
    print("cm string: ", cm_string)
    cm_plot_labels = CLASSES # ["control", "mutant"]
    labels_string = ','.join(str(item) for item in cm_plot_labels) # "control,mutant"


    # TODO return all wrong images path
    # cofusion matrix with wrong image path. make SHUFFLE FALSE
    print("Getting wrong labels...")
    test_batches = ImageDataGenerator() \
                .flow_from_directory(test_path,
                                     target_size=(224,224),
                                     shuffle=False,
                                     batch_size=test_batch_size)
    test_imgs, test_labels = next(test_batches)
    print("true test_labels: ", test_labels.argmax(axis=1)) # [0,0,...,1,1,...] or [0,0,...,1,1,..,2...]
    # test_labels = test_labels[:,0]
    # print("true test_labels: ",test_labels)
    predictions = model.predict(test_batches, steps=1, verbose=0)
    print("predictions labels: ", predictions.argmax(axis=1))
    # predictions = np.round(predictions[:,0])
    # print("predictions labels: ",predictions)

    # test_imgs_0 = ['{}/{}/{}'.format(test_path, CLASSES[0], i) for i in os.listdir('{}/{}'.format(test_path, CLASSES[0]))] #get test images of control
    test_imgs_0 = ['{}/{}'.format(CLASSES[0], i) for i in os.listdir('{}/{}'.format(test_path, CLASSES[0]))] #get test images of control
    test_imgs_0.sort()
    print("test_imgs_0 has {} files".format(len(test_imgs_0)))
    test_imgs_1 = ['{}/{}'.format(CLASSES[1], i) for i in os.listdir('{}/{}'.format(test_path, CLASSES[1]))] #get test images of control
    test_imgs_1.sort()
    print("test_imgs_1 has {} files".format(len(test_imgs_1)))
    # for 3*3 matix
    if(len(CLASSES)>2):
        test_imgs_2 = ['{}/{}'.format(CLASSES[2], i) for i in os.listdir('{}/{}'.format(test_path, CLASSES[2]))] #get test images of control
        test_imgs_2.sort()
        print("test_imgs_2 has {} files".format(len(test_imgs_2)))

    # get all wrong images based on the index from predictions
    imgs01 = ""
    imgs10 = ""
    # for 3*3 matrix
    imgs02 = ""
    imgs12 = ""
    imgs20 = ""
    imgs21 = ""

    for i in range(0, test_batch_size):
        if(test_labels.argmax(axis=1)[i] ==0 and predictions.argmax(axis=1)[i]==1):
            # index01.append(i)
            imgs01 = imgs01 + "," + test_imgs_0[i]
        if(test_labels.argmax(axis=1)[i] ==0 and predictions.argmax(axis=1)[i]==2):
            imgs02 = imgs02 + "," + test_imgs_0[i]

        if(test_labels.argmax(axis=1)[i] ==1 and predictions.argmax(axis=1)[i]==0):
            # index10.append(i)
            imgs10 = imgs10  + "," + test_imgs_1[i-len(test_imgs_0)]
        if(test_labels.argmax(axis=1)[i] ==1 and predictions.argmax(axis=1)[i]==2):
            imgs12 = imgs12  + "," + test_imgs_1[i-len(test_imgs_0)]

        if(test_labels.argmax(axis=1)[i] ==2 and predictions.argmax(axis=1)[i]==0):
            imgs20 = imgs20  + "," + test_imgs_2[i-len(test_imgs_0)-len(test_imgs_1)]
        if(test_labels.argmax(axis=1)[i] ==2 and predictions.argmax(axis=1)[i]==1):
            imgs21 = imgs21  + "," + test_imgs_2[i-len(test_imgs_0)-len(test_imgs_1)]
    

    print("imgs01: ", imgs01)
    print("imgs10: ", imgs10)
    print("imgs02: ", imgs02)
    print("imgs12: ", imgs12)
    print("imgs20: ", imgs20)
    print("imgs21: ", imgs21)

    ##  Show tensor images of mis-predicted images
    # arr_ = np.squeeze(test_imgs[index01[0]])
    # plt.imshow(arr_)
    # plt.savefig("mygraph.png")

    # save model and info to DB TODO cm, wrong-preds0, wrong-preds1, proj-path?
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO Models(model_path, user_id, project_name, log_path, epoch, selected_model, optimizer, learning_rate, test_accuracy, test_loss, timestamp, train_batch_size, model_fullname, classes, inv_label_map, favorite, cm, imgs01, imgs10, imgs02, imgs12, imgs20, imgs21, project_path, train_size, exp_id) \
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", \
        (model_path, USERID, PROJECT_NAME, log_name, EPOCH, SELECTED_MODEL, OPTIMIZER, LEARNING_RATE, "%.3f" % test_acc, "%.3f" % test_loss, TIME_F, train_batch_size, NAME, json.dumps(CLASSES), json.dumps(inv_label_map), "0", cm_string, json.dumps(imgs01), json.dumps(imgs10), json.dumps(imgs02), json.dumps(imgs12), json.dumps(imgs20), json.dumps(imgs21), PROJ_DIR, trainSize, expid))
    mysql.connection.commit()
    cur.close()

    # email content from logger txt file
    with open(log_name, 'r') as fp:
        line = fp.readline()
        content = ""
        while line:
            content = content+line +'<br>'
            line = fp.readline()
    # url for viewing log and confusion matrix. req.query: path, cm [], classes[].
    htmlcontent = "<a href=\"http://localhost:5001/logger?modelName="+NAME + "\">Click here to view details about this model</a>"
    # send email
    with app.app_context():
        msg = Message(subject="your model \"" + MODELNAME + "\" is complete",
                      sender=app.config.get("MAIL_USERNAME"),
                      recipients=[USER_EMAIL], # replace with your email for testing
                    #   html= "Your model \"" + MODELNAME + "\" is trained at "+TIME_F+";\n\n" + "<br>" + htmlcontent +"<br>"+ content) 
                      html= "Your model \"" + MODELNAME + "\" is trained at "+TIME_F+";\n\n" + "<br>" + htmlcontent)
        mail.send(msg)
    print("email sent to user ", USER_EMAIL)

    # HTTP response
    response = {
        'log' : log_name,
        'model': NAME
    }
    return jsonify(response)

# predict logic
def get_model():
    global model
    # APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
    # MODEL_DIR =os.path.join(APP_ROOT, 'public', 'allProjects', USERID,  'p4','models/') # TODO projectName/models
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
    message = request.get_json(force=True)
    encoded = message['image'] # the json data from client with base64 image value
    decoded = base64.b64decode(encoded) # the decoded image data
    image = Image.open(io.BytesIO(decoded)) # create instance of PIL image by wrapping the decoded var in bytes
    processed_image = preprocess_image(image, target_size=(224, 224))
    prediction = model.predict(processed_image).tolist() # numpy array into python list
    print("prediction: ", prediction)
    response = {
        'prediction': {
            'control': prediction[0][0],
            'mutant': prediction[0][1]
        }
    }
    return jsonify(response)
