
// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./Login.css";

// const Login = () => {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [showPassword, setShowPassword] = useState(false);

//     const navigate = useNavigate();
//     const location = useLocation();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError("");

//         try {
//             const response = await axios.post(
//                 "http://localhost:2005/api/manger/login",
//                 {
//                     username,
//                     password,
//                 }
//             );

//             const token = response.data.accessToken;

//             localStorage.setItem("photographerToken", token);

//             await axios.get(
//                 "http://localhost:2005/api/manger",
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             const params = new URLSearchParams(location.search);
//             const returnTo = params.get("returnTo");

//             navigate(
//                 returnTo &&
//                 returnTo.startsWith("/") &&
//                 !returnTo.startsWith("//")
//                     ? returnTo
//                     : "/admin"
//             );
//         } catch (error) {
//             localStorage.removeItem("photographerToken");

//             setError(
//                 error.response?.data?.message ||
//                 "שם המשתמש או הסיסמה שגויים"
//             );
//         }
//     };

//     return (
//         <main className="login-page">
//             <div className="login-decoration login-decoration-top" />
//             <div className="login-decoration login-decoration-bottom" />

//             <section className="login-card">
//                 <div className="login-brand">
//                     <div className="login-brand-icon">✦</div>
//                     <span>PHOTOGRAPHY STUDIO</span>
//                 </div>

//                 <div className="login-divider">
//                     <span />
//                     <span className="login-divider-center">✧</span>
//                     <span />
//                 </div>

//                 <header className="login-heading">
//                     <p className="login-eyebrow">ברוכה הבאה</p>
//                     <h1>התחברות</h1>
//                     <p className="login-subtitle">
//                         התחברי למערכת ניהול הגלריות שלך
//                     </p>
//                 </header>

//                 <form className="login-form" onSubmit={handleLogin}>
//                     <div className="login-field">
//                         <label htmlFor="username">שם משתמש</label>

//                         <input
//                             id="username"
//                             type="text"
//                             placeholder="הכניסי את שם המשתמש"
//                             value={username}
//                             onChange={(e) =>
//                                 setUsername(e.target.value)
//                             }
//                             autoComplete="username"
//                             required
//                         />
//                     </div>

//                     <div className="login-field">
//                         <label htmlFor="password">סיסמה</label>

//                         <div className="login-password-wrapper">
//                             <input
//                                 id="password"
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="הכניסי את הסיסמה"
//                                 value={password}
//                                 onChange={(e) =>
//                                     setPassword(e.target.value)
//                                 }
//                                 autoComplete="current-password"
//                                 required
//                             />

//                             <button
//                                 type="button"
//                                 className="login-show-password"
//                                 onClick={() =>
//                                     setShowPassword((prev) => !prev)
//                                 }
//                                 aria-label={
//                                     showPassword
//                                         ? "הסתרת סיסמה"
//                                         : "הצגת סיסמה"
//                                 }
//                                 aria-pressed={showPassword}
//                                 title={
//                                     showPassword
//                                         ? "הסתרת סיסמה"
//                                         : "הצגת סיסמה"
//                                 }
//                             >
//                                 {showPassword ? (
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="21"
//                                         height="21"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="1.8"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         aria-hidden="true"
//                                     >
//                                         <path d="M3 3l18 18" />
//                                         <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
//                                         <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a10.6 10.6 0 0 1-2.1 3.2" />
//                                         <path d="M6.2 6.2C3.9 7.7 2 10.1 2 12c0 2 4 7 10 7 1.2 0 2.3-.2 3.3-.6" />
//                                     </svg>
//                                 ) : (
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="21"
//                                         height="21"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="1.8"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         aria-hidden="true"
//                                     >
//                                         <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
//                                         <circle cx="12" cy="12" r="3" />
//                                     </svg>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {error && (
//                         <div className="login-error" role="alert">
//                             <span>!</span>
//                             <p>{error}</p>
//                         </div>
//                     )}

//                     <button className="login-submit" type="submit">
//                         <span>התחברות למערכת</span>
//                         <span className="login-submit-arrow">←</span>
//                     </button>
//                 </form>

//                 <footer className="login-footer">
//                     <span>✦</span>
//                     <p>מערכת גלריות מקצועית</p>
//                     <span>✦</span>
//                 </footer>
//             </section>
//         </main>
//     );
// };

// export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { API_URL } from "../config";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(
                `${API_URL}/manger/login`,
                {
                    username,
                    password,
                }
            );

            const token = response.data.accessToken;

            localStorage.setItem("photographerToken", token);

            await axios.get(
                `${API_URL}/manger/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const params = new URLSearchParams(location.search);
            const returnTo = params.get("returnTo");

            navigate(
                returnTo &&
                returnTo.startsWith("/") &&
                !returnTo.startsWith("//")
                    ? returnTo
                    : "/admin"
            );
        } catch (error) {
            localStorage.removeItem("photographerToken");

            setError(
                error.response?.data?.message ||
                "שם המשתמש או הסיסמה שגויים"
            );
        }
    };

    return (
        <main className="login-page">
            <div className="login-decoration login-decoration-top" />
            <div className="login-decoration login-decoration-bottom" />

            <section className="login-card">
                <div className="login-brand">
                    <div className="login-brand-icon">✦</div>
                    <span>PHOTOGRAPHY STUDIO</span>
                </div>

                <div className="login-divider">
                    <span />
                    <span className="login-divider-center">✧</span>
                    <span />
                </div>

                <header className="login-heading">
                    <p className="login-eyebrow">ברוכה הבאה</p>
                    <h1>התחברות</h1>
                    <p className="login-subtitle">
                        התחברי למערכת ניהול הגלריות שלך
                    </p>
                </header>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-field">
                        <label htmlFor="username">שם משתמש</label>

                        <input
                            id="username"
                            type="text"
                            placeholder="הכניסי את שם המשתמש"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">סיסמה</label>

                        <div className="login-password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="הכניסי את הסיסמה"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="login-show-password"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                aria-label={
                                    showPassword
                                        ? "הסתרת סיסמה"
                                        : "הצגת סיסמה"
                                }
                                aria-pressed={showPassword}
                                title={
                                    showPassword
                                        ? "הסתרת סיסמה"
                                        : "הצגת סיסמה"
                                }
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 5 9 7a10.6 10.6 0 0 1-2.1 3.2" />
                                        <path d="M6.2 6.2C3.9 7.7 2 10.1 2 12c0 2 4 7 10 7 1.2 0 2.3-.2 3.3-.6" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="21"
                                        height="21"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <button className="login-submit" type="submit">
                        <span>התחברות למערכת</span>
                        <span className="login-submit-arrow">←</span>
                    </button>
                </form>

                <footer className="login-footer">
                    <span>✦</span>
                    <p>מערכת גלריות מקצועית</p>
                    <span>✦</span>
                </footer>
            </section>
        </main>
    );
};

export default Login;
