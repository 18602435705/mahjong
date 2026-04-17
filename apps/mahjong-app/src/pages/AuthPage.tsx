import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginByPassword, registerByPassword } from "../api/auth";
import { useAuth } from "../auth/useAuth";
import "./AuthPage.css";

type AuthTab = "login" | "register";

interface NoticeState {
  kind: "error" | "success";
  text: string;
}

interface AuthLocationState {
  from?: string;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;

function toMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "请求失败，请稍后重试";
}

function validateUsername(username: string) {
  return USERNAME_PATTERN.test(username.trim());
}

function validatePassword(password: string) {
  return password.length >= 6 && password.length <= 72;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const redirectTo = useMemo(() => {
    const state = location.state as AuthLocationState | null;
    if (state?.from && state.from.startsWith("/")) {
      return state.from;
    }
    return "/lobby";
  }, [location.state]);

  function switchTab(nextTab: AuthTab) {
    setActiveTab(nextTab);
    setNotice(null);
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!validateUsername(loginForm.username)) {
      setNotice({
        kind: "error",
        text: "用户名需为 3-32 位，仅支持字母、数字、下划线",
      });
      return;
    }

    if (!validatePassword(loginForm.password)) {
      setNotice({
        kind: "error",
        text: "密码需为 6-72 位",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginByPassword({
        username: loginForm.username.trim(),
        password: loginForm.password,
      });

      signIn(response.token, response.user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setNotice({
        kind: "error",
        text: toMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const normalizedUsername = registerForm.username.trim();

    if (!validateUsername(normalizedUsername)) {
      setNotice({
        kind: "error",
        text: "用户名需为 3-32 位，仅支持字母、数字、下划线",
      });
      return;
    }

    if (!validatePassword(registerForm.password)) {
      setNotice({
        kind: "error",
        text: "密码需为 6-72 位",
      });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setNotice({
        kind: "error",
        text: "两次输入的密码不一致",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await registerByPassword({
        username: normalizedUsername,
        password: registerForm.password,
      });

      setActiveTab("login");
      setLoginForm({
        username: normalizedUsername,
        password: "",
      });
      setRegisterForm({
        username: normalizedUsername,
        password: "",
        confirmPassword: "",
      });
      setNotice({
        kind: "success",
        text: "注册成功，请使用新账号登录",
      });
    } catch (error) {
      setNotice({
        kind: "error",
        text: toMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-left" />
      <div className="auth-glow auth-glow-right" />

      <section className="auth-card">
        <header className="auth-header">
          <p className="auth-badge">Mahjong Club</p>
          <h1>欢迎来到麻将大厅</h1>
          <p>登录后可进入大厅，选择房间并开始对局</p>
        </header>

        <div className="auth-tabs" role="tablist" aria-label="认证切换">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "login"}
            className={activeTab === "login" ? "active" : ""}
            onClick={() => switchTab("login")}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "register"}
            className={activeTab === "register" ? "active" : ""}
            onClick={() => switchTab("register")}
          >
            注册
          </button>
        </div>

        {notice ? (
          <p className={`auth-notice ${notice.kind}`}>{notice.text}</p>
        ) : null}

        {activeTab === "login" ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="field">
              <span>用户名</span>
              <input
                value={loginForm.username}
                onChange={(event) => {
                  setNotice(null);
                  setLoginForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }));
                }}
                autoComplete="username"
                placeholder="请输入用户名"
              />
            </label>

            <label className="field">
              <span>密码</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => {
                  setNotice(null);
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }));
                }}
                autoComplete="current-password"
                placeholder="请输入密码"
              />
            </label>

            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登录中..." : "登录并进入大厅"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label className="field">
              <span>用户名</span>
              <input
                value={registerForm.username}
                onChange={(event) => {
                  setNotice(null);
                  setRegisterForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }));
                }}
                autoComplete="username"
                placeholder="3-32 位字母/数字/下划线"
              />
            </label>

            <label className="field">
              <span>密码</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) => {
                  setNotice(null);
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }));
                }}
                autoComplete="new-password"
                placeholder="至少 6 位"
              />
            </label>

            <label className="field">
              <span>确认密码</span>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) => {
                  setNotice(null);
                  setRegisterForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }));
                }}
                autoComplete="new-password"
                placeholder="请再次输入密码"
              />
            </label>

            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "注册中..." : "创建账号"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
