from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

import utils.toxic_detector.predict as predict
from toxic.serializers import ToxicPredictSerizalizer

# Create your views here.


@api_view(["GET"])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def predict_view(request):
    # get username and password from request
    comment = request.data.get("comment")
    print(comment)
    if comment is None:
        return Response(
            {
                "error": "comment is required",
            }
        )

    # handel comment
    predict_result = predict.predict_toxicity(comment)

    prediction = {
        "toxic": predict_result[0],
        "severe_toxic": predict_result[1],
        "obscene": predict_result[2],
        "threat": predict_result[3],
        "insult": predict_result[4],
        "identity_hate": predict_result[5],
    }

    serizalizer = ToxicPredictSerizalizer(
        data={
            "comment": comment,
            "toxic": predict_result[0],
            "severe_toxic": predict_result[1],
            "obscene": predict_result[2],
            "threat": predict_result[3],
            "insult": predict_result[4],
            "identity_hate": predict_result[5],
        }
    )
    serizalizer.is_valid(raise_exception=True)
    serizalizer.save()

    return Response(
        {
            "comment": comment,
            "prediction": prediction,
        }
    )
