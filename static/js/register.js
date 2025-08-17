/**
 * 邮箱验证码获取功能
 * 可复用的验证码交互组件
 */
class EmailCaptcha {
  constructor(options = {}) {
    // 默认配置
    this.config = {
      emailInputId: "#email", // 邮箱输入框ID
      captchaButtonId: "#captcha-btn", // 验证码按钮ID
      captchaUrl: "/auth/captcha", // 验证码接口URL
      countdownTime: 60, // 倒计时时间(秒)
      ...options, // 合并用户传入的配置
    };

    this.isCountingDown = false; // 是否正在倒计时
    this.countdownTimer = null; // 倒计时定时器

    this.init();
  }

  /**
   * 初始化事件监听
   */
  init() {
    const self = this;
    $(this.config.captchaButtonId).on("click", function () {
      self.sendCaptcha();
    });
  }

  /**
   * 发送验证码
   */
  sendCaptcha() {
    // 如果正在倒计时，直接返回
    if (this.isCountingDown) {
      return;
    }

    // 获取邮箱地址
    const email = $(this.config.emailInputId).val().trim();

    // 验证邮箱格式
    if (!this.validateEmail(email)) {
      this.showMessage("请输入有效的邮箱地址", "error");
      return;
    }

    // 显示发送中状态
    this.setButtonState("发送中...", true);

    // 发送AJAX请求
    $.ajax({
      url: this.config.captchaUrl,
      type: "GET",
      data: { email: email },
      success: (response) => {
        if (response.code === 200) {
          this.showMessage(response.message || "验证码发送成功", "success");
          this.startCountdown();
        } else {
          this.showMessage(response.message || "发送失败，请重试", "error");
          this.setButtonState("获取验证码", false);
        }
      },
      error: (xhr, status, error) => {
        console.error("验证码发送失败:", error);
        this.showMessage("网络错误，请稍后重试", "error");
        this.setButtonState("获取验证码", false);
      },
    });
  }

  /**
   * 开始倒计时
   */
  startCountdown() {
    this.isCountingDown = true;
    let countdown = this.config.countdownTime;

    this.countdownTimer = setInterval(() => {
      this.setButtonState(`${countdown}秒后重新获取`, true);
      countdown--;

      if (countdown < 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  /**
   * 停止倒计时
   */
  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.isCountingDown = false;
    this.setButtonState("获取验证码", false);
  }

  /**
   * 设置按钮状态
   * @param {string} text - 按钮文本
   * @param {boolean} disabled - 是否禁用
   */
  setButtonState(text, disabled) {
    const $button = $(this.config.captchaButtonId);
    $button.text(text);

    if (disabled) {
      $button.addClass("disabled").css({
        cursor: "not-allowed",
        opacity: "0.6",
      });
    } else {
      $button.removeClass("disabled").css({
        cursor: "pointer",
        opacity: "1",
      });
    }
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} - 是否有效
   */
  validateEmail(email) {
    if (!email) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 显示消息提示
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success, error, warning, info)
   */
  showMessage(message, type = "info") {
    // 移除之前的提示
    $(".captcha-message").remove();

    // 创建消息提示元素
    const alertClass = this.getAlertClass(type);
    const $message = $(`
            <div class="alert ${alertClass} alert-dismissible fade show captcha-message mt-2" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

    // 在验证码输入框后面插入提示
    $(this.config.captchaButtonId).closest(".input-group").after($message);

    // 3秒后自动消失
    setTimeout(() => {
      $message.fadeOut(300, function () {
        $(this).remove();
      });
    }, 3000);
  }

  /**
   * 根据消息类型获取Bootstrap警告框样式类
   * @param {string} type - 消息类型
   * @returns {string} - Bootstrap样式类
   */
  getAlertClass(type) {
    const classMap = {
      success: "alert-success",
      error: "alert-danger",
      warning: "alert-warning",
      info: "alert-info",
    };
    return classMap[type] || "alert-info";
  }

  /**
   * 销毁实例，清理定时器
   */
  destroy() {
    this.stopCountdown();
    $(this.config.captchaButtonId).off("click");
  }
}

// 页面加载完成后初始化验证码功能
$(document).ready(function () {
  // 创建验证码实例
  window.emailCaptcha = new EmailCaptcha({
    emailInputId: "#email",
    captchaButtonId: "#captcha-btn",
    captchaUrl: "/auth/captcha",
    countdownTime: 60,
  });

  // 额外的表单验证功能
  $("#email").on("blur", function () {
    const email = $(this).val().trim();
    if (email && !window.emailCaptcha.validateEmail(email)) {
      $(this).addClass("is-invalid");
      if (!$(this).next(".invalid-feedback").length) {
        $(this).after(
          '<div class="invalid-feedback">请输入有效的邮箱地址</div>'
        );
      }
    } else {
      $(this).removeClass("is-invalid");
      $(this).next(".invalid-feedback").remove();
    }
  });

  // 邮箱输入时移除错误状态
  $("#email").on("input", function () {
    $(this).removeClass("is-invalid");
    $(this).next(".invalid-feedback").remove();
  });
});
