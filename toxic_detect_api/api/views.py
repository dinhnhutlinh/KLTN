from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import utils.ml.predict as predict

from api.serializers import (
    ToxicPredictSerizalizer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# Create your views here.


@api_view(["GET"])
def labels(request):
    return Response(
        {
            "labels": [
                "toxic",
                "severe_toxic",
                "obscene",
                "threat",
                "insult",
                "identity_hate",
            ]
        }
    )


@api_view(["POST"])
def detect_view(request):
    # get all comments from request
    comments = request.data.getlist("comments")

    # check if comments is None
    if comments is None or len(comments)==0:
        return Response(
            {
                "error": "comments is required",
            }
        )
    # handel comments
    predict_result = predict.predict_toxicity(comments)
    response_data = []
    for index, predict_data in enumerate(predict_result):
        response_data.append(
            {
                "comment": comments[index],
                "prediction": {
                    "toxic": predict_data[0],
                    "severe_toxic": predict_data[1],
                    "obscene": predict_data[2],
                    "threat": predict_data[3],
                    "insult": predict_data[4],
                    "identity_hate": predict_data[5],
                },
            }
        )

    return Response(response_data)


# @api_view(["POST"])
# def detect_view(request):
#     # get username and password from request
#     comment = request.data.get("comment")


#     if comment is None:
#         return Response(
#             {
#                 "error": "comment is required",
#             }
#         )

#     # handel comment
#     predict_result = predict.predict_toxicity(comment)

#     prediction = {
#         "toxic": predict_result[0],
#         "severe_toxic": predict_result[1],
#         "obscene": predict_result[2],
#         "threat": predict_result[3],
#         "insult": predict_result[4],
#         "identity_hate": predict_result[5],
#     }

#     serizalizer = ToxicPredictSerizalizer(
#         data={
#             "comment": comment,
#             "toxic": predict_result[0],
#             "severe_toxic": predict_result[1],
#             "obscene": predict_result[2],
#             "threat": predict_result[3],
#             "insult": predict_result[4],
#             "identity_hate": predict_result[5],
#         }
#     )
#     serizalizer.is_valid(raise_exception=True)
#     serizalizer.save()

#     return Response(
#         {
#             "comment": comment,
#             "prediction": prediction,
#         }
#     )


@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid()
    return Response(serializer.login(request.data))


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"message": "User registered successfully"})


@api_view(["GET"])
def user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
