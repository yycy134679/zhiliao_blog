from django.urls import path
from . import views

namespace = "blog"

urlpatterns = [
    path("", views.index, name="index"),
    path("blog/detail/<int:id>", views.blog_detail, name="blog_detail"),
    path("blog/publish", views.publish_blog, name="publish_blog"),
]
