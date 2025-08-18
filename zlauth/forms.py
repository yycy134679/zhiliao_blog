from django import forms
from django.contrib.auth import get_user_model
from .models import Captcha

User = get_user_model()


class RegisterForm(forms.Form):
    username = forms.CharField(
        min_length=3,
        max_length=20,
        error_messages={
            "required": "用户名不能为空",
            "min_length": "用户名长度不能小于3个字符",
            "max_length": "用户名长度不能大于20个字符",
        },
    )
    email = forms.EmailField(
        error_messages={"required": "邮箱不能为空", "invalid": "邮箱格式不正确"}
    )
    captcha = forms.CharField(max_length=4, min_length=4)
    password = forms.CharField(
        min_length=6,
        max_length=20,
        error_messages={
            "required": "密码不能为空",
            "min_length": "密码长度不能小于6个字符",
            "max_length": "密码长度不能大于20个字符",
        },
    )
    password_confirm = forms.CharField(
        min_length=6,
        max_length=20,
        error_messages={
            "required": "确认密码不能为空",
            "min_length": "确认密码长度不能小于6个字符",
            "max_length": "确认密码长度不能大于20个字符",
        },
    )

    def clean_email(self):
        email = self.cleaned_data.get("email")
        exist = User.objects.filter(email=email).exists()
        if exist:
            raise forms.ValidationError("邮箱已存在")
        else:
            return email

    def clean_captcha(self):
        captcha = self.cleaned_data.get("captcha")
        email = self.cleaned_data.get("email")

        captcha_model = Captcha.objects.filter(email=email, captcha=captcha).first()
        if not captcha_model:
            raise forms.ValidationError("验证码错误")
        captcha_model.delete()
        return captcha

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")
        if password != password_confirm:
            raise forms.ValidationError("密码不一致")
        return cleaned_data
