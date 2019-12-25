from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import cv2
import os
from PIL import Image
import tensorflow as tf
# from .serializers import FileSerializer
# from .serializers import FileSerializer1
# from .serializers import FileSerializer1
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
# from .models import File
import json, io
import urllib.request as req


class FileUploadView(APIView):
    parser_class = (FileUploadParser,)

    def post(self, request, *args, **kwargs):
        print(request.POST)
        data = json.loads(request.POST['data'])
        print(data)
        print(data[0])
        finlay = {}
        CATEGORIES = ["CONTROL", "MUTANT"]

        for i in range(len(data)):
            id_list = list(data[i].keys())
            id_list.remove('exp_img_id')
            Prediction1 = []

            for j in range(len(data[i][id_list[0]])):
                imgurl = data[i][id_list[0]][j]['link']
                req.urlretrieve(imgurl, "./media/" + str(j) + ".jpg""")

                model = tf.keras.models.load_model("./training_model_file/64x3-CNN.model")
                model = tf.keras.models.load_model("./training_model_file/vgg16model.h5")
                print("Before Prediction..")
                # prediction = model.predict([prepareCNN("./media/" + str(j) + ".jpg""")])
                prediction = model.predict([prepareVGG16("./media/" + str(j) + ".jpg""")])

                Prediction1.append(CATEGORIES[int(prediction[0][0])])

                predictionTypes = {}
                predictionTypes[CATEGORIES[0]] = str(round(prediction[0][0]*100,4))+"%"
                predictionTypes[CATEGORIES[1]] = str(round(prediction[0][1]*100,4))+"%"


            print("predictionTypes ", predictionTypes)

            data[i]['prediction'] = predictionTypes

            if prediction[0][0] > 0.5:
                final = CATEGORIES[0]
                data[i]['type'] = final
                print("Final Prediction: " + final)
            else:
                final = CATEGORIES[1]
                data[i]['type'] = final
                print("Final Prediction: " + final)

        return Response(data, status=status.HTTP_201_CREATED)


def prepareVGG16(filepath):
    IMG_SIZE = 224
    img_array = cv2.imread(filepath, cv2.COLOR_BGR2RGB)
    new_array = cv2.resize(img_array, (IMG_SIZE, IMG_SIZE))
    return new_array.reshape(-1, IMG_SIZE, IMG_SIZE, 3)

def prepareCNN(filepath):
    IMG_SIZE = 224
    img_array = cv2.imread(filepath, cv2.IMREAD_GRAYSCALE)
    new_array = cv2.resize(img_array, (IMG_SIZE, IMG_SIZE))
    return new_array.reshape(-1, IMG_SIZE, IMG_SIZE, 1)