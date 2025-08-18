import random, string

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from .forms import RegisterForm
from .models import Captcha

User = get_user_model()


def login_view(request):
    return render(request, "login.html")


@require_http_methods(["GET", "POST"])
def register_view(request):
    if request.method == "GET":
        return render(request, "register.html")
    else:
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            email = form.cleaned_data.get("email")
            password = form.cleaned_data.get("password")
            User.objects.create_user(username=username, email=email, password=password)
            return redirect(reverse("zlauth:login"))
        else:
            print(form.errors)
            return render(request, "register.html", {"form": form})


def send_email_captcha(request):
    email = request.GET.get("email")

    if not email:
        return JsonResponse({"code": 400, "message": "邮箱不能为空"})

    # 生成4位数字验证码
    captcha = "".join(random.sample(string.digits, 4))
    # 发送验证码
    send_mail(
        subject="知了博客邮箱验证码",  # 邮件主题
        message=f"你的邮箱验证码是{captcha}",  # 邮件内容
        recipient_list=[email],  # 收件人列表
        from_email=None,  # 发件人邮箱
    )
    # 保存验证码到数据库
    Captcha.objects.update_or_create(email=email, defaults={"captcha": captcha})

    return JsonResponse({"code": 200, "message": "邮箱验证码发送成功"})
