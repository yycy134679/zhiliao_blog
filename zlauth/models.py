from django.db import models


class Captcha(models.Model):
    email = models.EmailField(unique=True)
    captcha = models.CharField(max_length=4)
    created_time = models.DateTimeField(auto_now_add=True)
