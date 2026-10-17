// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// const ProtectedRoute = () => {
//     const [authorized, setAuthorized] = useState(null);
// const location = useLocation();
// const navigate = useNavigate();
// const isAdminRoute =
//     location.pathname === "/admin" ||
//     location.pathname.startsWith("/admin/");
//     useEffect(() => {
//         const checkToken = async () => {
//            // const token = localStorage.getItem("token");
// const token = localStorage.getItem("photographerToken");
//             console.log("ProtectedRoute token:", token);

// if (!token) {
//     if (isAdminRoute) {
//         setAuthorized(false);
//         return;
//     }

//     navigate(
//         `/login?returnTo=${encodeURIComponent(
//             location.pathname + location.search
//         )}`,
//         { replace: true }
//     );
//     return;
// }
//             try {
//                 // בדיקה מול השרת
//                 const response = await axios.get(
//                     "http://localhost:2005/api/manger",
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`
//                         }
//                     }
//                 );

//                 console.log(
//                     "Token valid:",
//                     response.data
//                 );

//                 setAuthorized(true);

//             } catch (error) {
//                 console.log(
//                     "Token invalid:",
//                     error.response?.status
//                 )

//             localStorage.removeItem("photographerToken");

// navigate(
//     `/login?returnTo=${encodeURIComponent(
//         location.pathname + location.search
//     )}`,
//     { replace: true }
// );
//             }
//         };

//         checkToken();
//     },  [location.pathname, location.search, navigate]);

//     // עדיין בודקים הרשאה
//     if (authorized === null) {
//         return (
//             <div
//                 style={{
//                     minHeight: "60vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     direction: "rtl"
//                 }}
//             >
//                 <h2>
//                     בודק הרשאה...
//                 </h2>
//             </div>
//         );
//     }

//     // אין הרשאה
//     if (!authorized) {
//         return (
//             <div
//                 style={{
//                     minHeight: "60vh",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     padding: "30px",
//                     direction: "rtl"
//                 }}
//             >
//                 <div
//                     style={{
//                         backgroundColor: "#fff",
//                         padding: "40px",
//                         borderRadius: "12px",
//                         boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
//                         textAlign: "center",
//                         maxWidth: "450px",
//                         width: "100%"
//                     }}
//                 >
//                     <div
//                         style={{
//                             fontSize: "50px",
//                             marginBottom: "15px"
//                         }}
//                     >
//                         🔒
//                     </div>

//                     <h1
//                         style={{
//                             marginBottom: "15px"
//                         }}
//                     >
//                         אין לך הרשאה לאזור זה
//                     </h1>

//                     <p
//                         style={{
//                             color: "#666",
//                             fontSize: "17px",
//                             lineHeight: "1.6",
//                             marginBottom: "25px"
//                         }}
//                     >
//                         אזור הניהול מיועד לצלמת בלבד.
//                         <br />
//                         אם הגעת לכאן בטעות, חזרי לגלריה שלך.
//                     </p>

//                     <button
//                         onClick={() => window.history.back()}
//                         style={{
//                             padding: "12px 25px",
//                             border: "none",
//                             borderRadius: "6px",
//                             backgroundColor: "#111",
//                             color: "white",
//                             fontSize: "16px",
//                             cursor: "pointer"
//                         }}
//                     >
//                         ← חזרה
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // יש הרשאה
//     return <Outlet />;
// };

// export default ProtectedRoute;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "./config";
const ProtectedRoute = () => {
    const [authorized, setAuthorized] = useState(null);
const location = useLocation();
const navigate = useNavigate();
const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");
    useEffect(() => {
        const checkToken = async () => {
           // const token = localStorage.getItem("token");
const token = localStorage.getItem("photographerToken");

if (!token) {
    if (isAdminRoute) {
        setAuthorized(false);
        return;
    }

    navigate(
        `/login?returnTo=${encodeURIComponent(
            location.pathname + location.search
        )}`,
        { replace: true }
    );
    return;
}
            try {
                // בדיקה מול השרת
                const response = await axios.get(
                    `${API_URL}/manger/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log(
                    "Token valid:",
                    response.data
                );

                setAuthorized(true);

            } catch (error) {
                console.log(
                    "Token invalid:",
                    error.response?.status
                )

            localStorage.removeItem("photographerToken");

navigate(
    `/login?returnTo=${encodeURIComponent(
        location.pathname + location.search
    )}`,
    { replace: true }
);
            }
        };

        checkToken();
    },  [location.pathname, location.search, navigate]);

    // עדיין בודקים הרשאה
    if (authorized === null) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    direction: "rtl"
                }}
            >
                <h2>
                    בודק הרשאה...
                </h2>
            </div>
        );
    }

    // אין הרשאה
    if (!authorized) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "30px",
                    direction: "rtl"
                }}
            >
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "40px",
                        borderRadius: "12px",
                        boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
                        textAlign: "center",
                        maxWidth: "450px",
                        width: "100%"
                    }}
                >
                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom: "15px"
                        }}
                    >
                        🔒
                    </div>

                    <h1
                        style={{
                            marginBottom: "15px"
                        }}
                    >
                        אין לך הרשאה לאזור זה
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            fontSize: "17px",
                            lineHeight: "1.6",
                            marginBottom: "25px"
                        }}
                    >
                        אזור הניהול מיועד לצלמת בלבד.
                        <br />
                        אם הגעת לכאן בטעות, חזרי לגלריה שלך.
                    </p>

                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: "12px 25px",
                            border: "none",
                            borderRadius: "6px",
                            backgroundColor: "#111",
                            color: "white",
                            fontSize: "16px",
                            cursor: "pointer"
                        }}
                    >
                        ← חזרה
                    </button>
                </div>
            </div>
        );
    }

    // יש הרשאה
    return <Outlet />;
};

export default ProtectedRoute;

