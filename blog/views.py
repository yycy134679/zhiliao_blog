from django.shortcuts import render


def index(request):
    return render(request, "index.html")


def blog_detail(request, id):
    return render(request, "blog_detail.html")


def publish_blog(request):
    return render(request, "pub_blog.html")
