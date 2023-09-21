from django.db import models

# Create your models here.
class ToxicPredict(models.Model):
    comment = models.TextField()
    toxic = models.FloatField()
    severe_toxic = models.FloatField()
    obscene = models.FloatField()
    threat = models.FloatField()
    insult = models.FloatField()
    identity_hate = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)