from django.urls import path
from . import views

namespace = "blog"

urlpatterns = [
    path("", views.index, name="index"),
]
