from django.urls import path
from . import views

namespace = "blog"

urlpatterns = [
    path("", views.index, name="index"),
    path("blog/<int:id>", views.blog_detail, name="blog_detail"),
]
