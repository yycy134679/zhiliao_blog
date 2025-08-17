from django.shortcuts import render
from django.http import JsonResponse
import random
import string
from django.core.mail import send_mail
from .models import Captcha


def login_view(request):
    return render(request, "login.html")


def register_view(request):
    return render(request, "register.html")


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
