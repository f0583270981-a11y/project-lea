
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./PhotographerDashboard.css";

// const API_URL = "http://localhost:2005/api";

// const PhotographerDashboard = () => {
//     const navigate = useNavigate();

//     const [galleries, setGalleries] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [searchTerm, setSearchTerm] = useState("");

//     useEffect(() => {
//         loadGalleries();
//     }, []);

//     // טעינת הגלריות
//     const loadGalleries = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const token = localStorage.getItem("photographerToken");

//             if (!token) {
//                 navigate("/login");
//                 return;
//             }

//             const response = await axios.get(
//                 `${API_URL}/galleries`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             setGalleries(response.data);
//         } catch (err) {
//             console.error("Error loading galleries:", err);

//             if (
//                 err.response?.status === 401 ||
//                 err.response?.status === 403
//             ) {
//                 localStorage.removeItem("photographerToken");
//                 navigate("/login");
//                 return;
//             }

//             setError(
//                 err.response?.data?.message ||
//                 "אירעה שגיאה בטעינת הלקוחות"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     // התנתקות
//     const handleLogout = () => {
//         localStorage.removeItem("photographerToken");
//         navigate("/login");
//     };

//     // הסתרת גלריה מלוח הניהול
//     const handleHideGallery = async (gallery) => {
//         const confirmed = window.confirm(
//             `להסתיר את הגלריה של ${gallery.clientName} מלוח הניהול?`
//         );

//         if (!confirmed) return;

//         try {
//             const token = localStorage.getItem("photographerToken");

//             if (!token) {
//                 navigate("/login");
//                 return;
//             }

//             await axios.put(
//                 `${API_URL}/galleries/${gallery._id}`,
//                 { isHidden: true },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             // הסרת הכרטיס מהתצוגה בלי לטעון מחדש את העמוד
//             setGalleries((prev) =>
//                 prev.filter((item) => item._id !== gallery._id)
//             );
//         } catch (err) {
//             console.error("Hide gallery error:", err);

//             alert(
//                 err.response?.data?.message ||
//                 "לא ניתן להסתיר את הגלריה. נסי שוב."
//             );
//         }
//     };

//     // סימון / ביטול "תמונות ערוכות נשלחו"
//     const handleFinalDelivered = async (gallery) => {
//         try {
//             const token = localStorage.getItem("photographerToken");
//             const newValue = !gallery.finalDelivered;

//             await axios.put(
//                 `${API_URL}/galleries/${gallery._id}`,
//                 { finalDelivered: newValue },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             setGalleries((prevGalleries) =>
//                 prevGalleries.map((item) =>
//                     item._id === gallery._id
//                         ? { ...item, finalDelivered: newValue }
//                         : item
//                 )
//             );
//         } catch (err) {
//             console.error("Error updating finalDelivered:", err);

//             alert(
//                 err.response?.data?.message ||
//                 "אירעה שגיאה בעדכון סטטוס התמונות"
//             );
//         }
//     };

//     // הרשאת הורדה ללקוחה
//     const handleClientDownloadPermission = async (gallery) => {
//         try {
//             const token = localStorage.getItem("photographerToken");
//             const newValue = !gallery.allowClientDownload;

//             await axios.put(
//                 `${API_URL}/galleries/${gallery._id}`,
//                 { allowClientDownload: newValue },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             setGalleries((prevGalleries) =>
//                 prevGalleries.map((item) =>
//                     item._id === gallery._id
//                         ? { ...item, allowClientDownload: newValue }
//                         : item
//                 )
//             );
//         } catch (err) {
//             console.error(
//                 "Error updating client download permission:",
//                 err
//             );

//             alert(
//                 err.response?.data?.message ||
//                 "אירעה שגיאה בעדכון הרשאת ההורדה"
//             );
//         }
//     };

//     // סינון לקוחות לפי שם
//     const filteredGalleries = galleries.filter((gallery) =>
//         gallery.clientName
//             ?.toLowerCase()
//             .includes(searchTerm.toLowerCase())
//     );

//     // מסך טעינה
//     if (loading) {
//         return (
//             <div className="dashboard-loading">
//                 <div className="dashboard-loading-spinner"></div>
//                 <h2>טוען לקוחות...</h2>
//             </div>
//         );
//     }

//     return (
//         <div className="dashboard-page">

//             {/* כותרת עליונה */}
//             <header className="dashboard-header">
//                 <div className="dashboard-header-content">
//                     <div className="dashboard-heading">
//                         <span className="dashboard-eyebrow">
//                             PHOTO STUDIO
//                         </span>

//                         <h1>לוח הצלמת</h1>

//                         <p>ניהול הלקוחות והגלריות שלך</p>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={handleLogout}
//                         className="dashboard-logout-button"
//                     >
//                         <span aria-hidden="true">↪</span>
//                         התנתקות
//                     </button>
//                 </div>

//                 <div className="dashboard-header-bottom">
//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate("/admin/create-gallery")
//                         }
//                         className="dashboard-create-button"
//                     >
//                         <span className="dashboard-create-icon">
//                             ＋
//                         </span>
//                         צור גלריה חדשה
//                     </button>
//                 </div>
//             </header>

//             {/* אזור הלקוחות והחיפוש */}
//             <section className="dashboard-clients-section">
//                 <div className="dashboard-section-heading">
//                     <div>
//                         <h2>הלקוחות שלי</h2>
//                         <p>כל הגלריות והפעולות במקום אחד</p>
//                     </div>

//                     <div className="dashboard-client-count">
//                         <span>{filteredGalleries.length}</span>
//                         <span>לקוחות</span>
//                     </div>
//                 </div>

//                 <div className="dashboard-search-wrapper">
//                     <span
//                         className="dashboard-search-icon"
//                         aria-hidden="true"
//                     >
//                         ⌕
//                     </span>

//                     <input
//                         type="text"
//                         placeholder="חיפוש לפי שם לקוחה..."
//                         value={searchTerm}
//                         onChange={(e) =>
//                             setSearchTerm(e.target.value)
//                         }
//                         className="dashboard-search-input"
//                         aria-label="חיפוש לקוחה לפי שם"
//                     />

//                     {searchTerm && (
//                         <button
//                             type="button"
//                             className="dashboard-clear-search"
//                             onClick={() => setSearchTerm("")}
//                             aria-label="ניקוי החיפוש"
//                         >
//                             ×
//                         </button>
//                     )}
//                 </div>
//             </section>

//             {/* הודעת שגיאה */}
//             {error && (
//                 <div className="dashboard-error">
//                     <span aria-hidden="true">!</span>
//                     <p>{error}</p>
//                 </div>
//             )}

//             {/* אין לקוחות */}
//             {!error && galleries.length === 0 && (
//                 <div className="dashboard-empty-state">
//                     <div className="dashboard-empty-icon">
//                         📷
//                     </div>

//                     <h3>עדיין אין לקוחות</h3>

//                     <p>
//                         צרי את הגלריה הראשונה שלך כדי להתחיל.
//                     </p>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             navigate("/admin/create-gallery")
//                         }
//                         className="dashboard-empty-button"
//                     >
//                         ＋ יצירת גלריה ראשונה
//                     </button>
//                 </div>
//             )}

//             {/* אין תוצאות חיפוש */}
//             {!error &&
//                 galleries.length > 0 &&
//                 filteredGalleries.length === 0 && (
//                     <div className="dashboard-empty-state dashboard-no-results">
//                         <div className="dashboard-empty-icon">
//                             ⌕
//                         </div>

//                         <h3>לא נמצאו לקוחות</h3>

//                         <p>נסי לחפש לפי שם אחר.</p>

//                         <button
//                             type="button"
//                             onClick={() => setSearchTerm("")}
//                             className="dashboard-empty-button"
//                         >
//                             הצגת כל הלקוחות
//                         </button>
//                     </div>
//                 )}

//             {/* כרטיסי הלקוחות */}
//             {!error && filteredGalleries.length > 0 && (
//                 <section className="dashboard-gallery-grid">
//                     {filteredGalleries.map((gallery) => (
//                         <article
//                             key={gallery._id}
//                             className="dashboard-gallery-card"
//                         >
//                             {/* פרטי לקוחה */}
//                             <div className="dashboard-card-header">
//                                 <div className="dashboard-client-avatar">
//                                     <span aria-hidden="true">
//                                         📷
//                                     </span>
//                                 </div>

//                                 <div className="dashboard-client-info">
//                                     <h3>{gallery.clientName}</h3>

//                                     <p className="dashboard-client-email">
//                                         {gallery.clientEmail}
//                                     </p>
//                                 </div>

//                                 <div className="dashboard-card-accent">
//                                     ✦
//                                 </div>
//                             </div>

//                             {/* פרטי הגלריה */}
//                             <div className="dashboard-gallery-details">
//                                 <span>מכסת בחירה</span>

//                                 <strong>
//                                     {gallery.maxSelections} תמונות
//                                 </strong>
//                             </div>

//                             {/* פעולות הגלריה */}
//                             <div className="dashboard-actions">
//                                 <h4 className="dashboard-actions-title">
//                                     פעולות בגלריה
//                                 </h4>

//                                 <div className="dashboard-actions-grid">
//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             navigate(
//                                                 `/gallery/${gallery._id}`
//                                             )
//                                         }
//                                         className="dashboard-action-button dashboard-action-primary"
//                                     >
//                                         <span className="dashboard-action-icon">
//                                             ◫
//                                         </span>

//                                         <span>צפייה בגלריה</span>

//                                         <small>כל התמונות</small>
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             navigate(
//                                                 `/gallery/${gallery._id}/selections`
//                                             )
//                                         }
//                                         className="dashboard-action-button dashboard-action-secondary"
//                                     >
//                                         <span className="dashboard-action-icon">
//                                             ☑
//                                         </span>

//                                         <span>התמונות שנבחרו</span>

//                                         <small>בחירות הלקוחה</small>
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             navigate(
//                                                 `/gallery/${gallery._id}/photographer-selections`
//                                             )
//                                         }
//                                         className="dashboard-action-button dashboard-action-secondary"
//                                     >
//                                         <span className="dashboard-action-icon">
//                                             ◎
//                                         </span>

//                                         <span>בחירות הצלמת</span>

//                                         <small>תמונות לשליחה</small>
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             navigate(
//                                                 `/gallery/${gallery._id}/edited`
//                                             )
//                                         }
//                                         className="dashboard-action-button dashboard-action-secondary"
//                                     >
//                                         <span className="dashboard-action-icon">
//                                             ▧
//                                         </span>

//                                         <span>תמונות ערוכות</span>

//                                         <small>ניהול והעלאה</small>
//                                     </button>
                                 
//                       </div>
//                             </div>

//                             {/* הגדרות לקוחה */}
//                             <div className="dashboard-settings">
//                                 <h4 className="dashboard-settings-title">
//                                     הגדרות לקוחה
//                                 </h4>

//                                 {/* מתג: תמונות ערוכות נשלחו */}
//                                 <div className="dashboard-setting-row">
//                                     <span
//                                         className="dashboard-setting-icon"
//                                         aria-hidden="true"
//                                     >
//                                         ✓
//                                     </span>

//                                     <span className="dashboard-setting-text">
//                                         <strong>
//                                             תמונות ערוכות נשלחו
//                                         </strong>

//                                         <small
//                                             className={
//                                                 gallery.finalDelivered
//                                                     ? "dashboard-setting-status is-on"
//                                                     : "dashboard-setting-status"
//                                             }
//                                         >
//                                             {gallery.finalDelivered === true
//                                                 ? "הסטטוס פעיל"
//                                                 : "עדיין לא סומן כנשלח"}
//                                         </small>
//                                     </span>

//                                     <button
//                                         type="button"
//                                         role="switch"
//                                         aria-checked={
//                                             gallery.finalDelivered === true
//                                         }
//                                         aria-label="תמונות ערוכות נשלחו"
//                                         className={`dashboard-toggle ${
//                                             gallery.finalDelivered === true
//                                                 ? "is-on"
//                                                 : ""
//                                         }`}
//                                         onClick={() =>
//                                             handleFinalDelivered(gallery)
//                                         }
//                                     >
//                                         <span className="dashboard-toggle-thumb">
//                                             <span aria-hidden="true">
//                                                 {gallery.finalDelivered === true
//                                                     ? "✓"
//                                                     : "×"}
//                                             </span>
//                                         </span>
//                                     </button>
//                                 </div>

//                                 {/* מתג: הרשאת הורדה */}
//                                 <div className="dashboard-setting-row">
//                                     <span
//                                         className="dashboard-setting-icon"
//                                         aria-hidden="true"
//                                     >
//                                         ↓
//                                     </span>

//                                     <span className="dashboard-setting-text">
//                                         <strong>
//                                             הרשאת הורדה
//                                         </strong>

//                                         <small
//                                             className={
//                                                 gallery.allowClientDownload
//                                                     ? "dashboard-setting-status is-on"
//                                                     : "dashboard-setting-status"
//                                             }
//                                         >
//                                             {gallery.allowClientDownload === true
//                                                 ? "ההורדה מאושרת ללקוחה"
//                                                 : "ההורדה חסומה ללקוחה"}
//                                         </small>
//                                     </span>

//                                     <button
//                                         type="button"
//                                         role="switch"
//                                         aria-checked={
//                                             gallery.allowClientDownload === true
//                                         }
//                                         aria-label="הרשאת הורדה ללקוחה"
//                                         className={`dashboard-toggle ${
//                                             gallery.allowClientDownload === true
//                                                 ? "is-on"
//                                                 : ""
//                                         }`}
//                                         onClick={() =>
//                                             handleClientDownloadPermission(
//                                                 gallery
//                                             )
//                                         }
//                                     >
//                                         <span className="dashboard-toggle-thumb">
//                                             <span aria-hidden="true">
//                                                 {gallery.allowClientDownload === true
//                                                     ? "✓"
//                                                     : "×"}
//                                             </span>
//                                         </span>
//                                     </button>
//                                 </div>

//                                 {gallery.finalDelivered === true && (
//                                     <div className="dashboard-delivered-status">
//                                         <span aria-hidden="true">✓</span>
//                                         התמונות הערוכות נשלחו ללקוחה
//                                     </div>
//                                 )}
//                             </div>

                       
// {/* כפתורי עריכה והסתרה בתחתית הכרטיס */}
// <div className="hide-gallery-footer">
//     <button
//         type="button"
//         onClick={() => navigate(`/admin/edit-gallery/${gallery._id}`)}
//         title="עריכת פרטי לקוחה"
//         aria-label={`עריכת פרטי הלקוחה ${gallery.clientName}`}
//         className="flex h-10 w-10 items-center justify-center rounded-xl
//                    border border-[#dfd1b9] bg-[#fffaf2] text-[#a47d3d]
//                    shadow-sm transition-all duration-200
//                    hover:-translate-y-0.5 hover:border-[#c9a96e]
//                    hover:bg-[#ead9b8] hover:text-[#090909]
//                    focus-visible:outline-none focus-visible:ring-2
//                    focus-visible:ring-[#c9a96e]"
//     >
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="19"
//             height="19"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.7"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <path d="M12 20h9" />
//             <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
//         </svg>
//     </button>

//     {/* הסתרת גלריה */}
//     <button
//         type="button"
//         onClick={() => handleHideGallery(gallery)}
//         title="הסתרת גלריה מלוח הניהול"
//         aria-label={`הסתרת הגלריה של ${gallery.clientName}`}
//         className="flex h-10 w-10 items-center justify-center rounded-xl
//                    border border-[#dfd1b9] bg-[#fffaf2] text-[#a47d3d]
//                    shadow-sm transition-all duration-200
//                    hover:-translate-y-0.5 hover:border-[#d9a59b]
//                    hover:bg-[#f8e7e3] hover:text-[#a33b2b]
//                    focus-visible:outline-none focus-visible:ring-2
//                    focus-visible:ring-[#d9a59b]"
//     >
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="19"
//             height="19"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.7"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <path d="M3 6h18" />
//             <path d="M8 6V4h8v2" />
//             <path d="m19 6-1 14H6L5 6" />
//             <path d="M10 11v5M14 11v5" />
//         </svg>
//     </button>
// </div>

//                         </article>
//                     ))}
//                 </section>
//             )}
//         </div>
//     );
// };

// export default PhotographerDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PhotographerDashboard.css";
import { API_URL } from "../config";
//const API_URL = "http://localhost:2005/api";

const PhotographerDashboard = () => {
    const navigate = useNavigate();

    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadGalleries();
    }, []);

    // טעינת הגלריות
    const loadGalleries = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("photographerToken");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setGalleries(response.data);
        } catch (err) {
            console.error("Error loading galleries:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("photographerToken");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "אירעה שגיאה בטעינת הלקוחות"
            );
        } finally {
            setLoading(false);
        }
    };

    // התנתקות
    const handleLogout = () => {
        localStorage.removeItem("photographerToken");
        navigate("/login");
    };

    // הסתרת גלריה מלוח הניהול
    const handleHideGallery = async (gallery) => {
        const confirmed = window.confirm(
            `להסתיר את הגלריה של ${gallery.clientName} מלוח הניהול?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("photographerToken");

            if (!token) {
                navigate("/login");
                return;
            }

            await axios.put(
                `${API_URL}/galleries/${gallery._id}`,
                { isHidden: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // הסרת הכרטיס מהתצוגה בלי לטעון מחדש את העמוד
            setGalleries((prev) =>
                prev.filter((item) => item._id !== gallery._id)
            );
        } catch (err) {
            console.error("Hide gallery error:", err);

            alert(
                err.response?.data?.message ||
                "לא ניתן להסתיר את הגלריה. נסי שוב."
            );
        }
    };

    // סימון / ביטול "תמונות ערוכות נשלחו"
    const handleFinalDelivered = async (gallery) => {
        try {
            const token = localStorage.getItem("photographerToken");
            const newValue = !gallery.finalDelivered;

            await axios.put(
                `${API_URL}/galleries/${gallery._id}`,
                { finalDelivered: newValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setGalleries((prevGalleries) =>
                prevGalleries.map((item) =>
                    item._id === gallery._id
                        ? { ...item, finalDelivered: newValue }
                        : item
                )
            );
        } catch (err) {
            console.error("Error updating finalDelivered:", err);

            alert(
                err.response?.data?.message ||
                "אירעה שגיאה בעדכון סטטוס התמונות"
            );
        }
    };

    // הרשאת הורדה ללקוחה
    const handleClientDownloadPermission = async (gallery) => {
        try {
            const token = localStorage.getItem("photographerToken");
            const newValue = !gallery.allowClientDownload;

            await axios.put(
                `${API_URL}/galleries/${gallery._id}`,
                { allowClientDownload: newValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setGalleries((prevGalleries) =>
                prevGalleries.map((item) =>
                    item._id === gallery._id
                        ? { ...item, allowClientDownload: newValue }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Error updating client download permission:",
                err
            );

            alert(
                err.response?.data?.message ||
                "אירעה שגיאה בעדכון הרשאת ההורדה"
            );
        }
    };

    // סינון לקוחות לפי שם
    const filteredGalleries = galleries.filter((gallery) =>
        gallery.clientName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // מסך טעינה
    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-spinner"></div>
                <h2>טוען לקוחות...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* כותרת עליונה */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-heading">
                        <span className="dashboard-eyebrow">
                            PHOTO STUDIO
                        </span>

                        <h1>לוח הצלמת</h1>

                        <p>ניהול הלקוחות והגלריות שלך</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="dashboard-logout-button"
                    >
                        <span aria-hidden="true">↪</span>
                        התנתקות
                    </button>
                </div>

                <div className="dashboard-header-bottom">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/create-gallery")
                        }
                        className="dashboard-create-button"
                    >
                        <span className="dashboard-create-icon">
                            ＋
                        </span>
                        צור גלריה חדשה
                    </button>
                </div>
            </header>

            {/* אזור הלקוחות והחיפוש */}
            <section className="dashboard-clients-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>הלקוחות שלי</h2>
                        <p>כל הגלריות והפעולות במקום אחד</p>
                    </div>

                    <div className="dashboard-client-count">
                        <span>{filteredGalleries.length}</span>
                        <span>לקוחות</span>
                    </div>
                </div>

                <div className="dashboard-search-wrapper">
                    <span
                        className="dashboard-search-icon"
                        aria-hidden="true"
                    >
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="חיפוש לפי שם לקוחה..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        className="dashboard-search-input"
                        aria-label="חיפוש לקוחה לפי שם"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="dashboard-clear-search"
                            onClick={() => setSearchTerm("")}
                            aria-label="ניקוי החיפוש"
                        >
                            ×
                        </button>
                    )}
                </div>
            </section>

            {/* הודעת שגיאה */}
            {error && (
                <div className="dashboard-error">
                    <span aria-hidden="true">!</span>
                    <p>{error}</p>
                </div>
            )}

            {/* אין לקוחות */}
            {!error && galleries.length === 0 && (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">
                        📷
                    </div>

                    <h3>עדיין אין לקוחות</h3>

                    <p>
                        צרי את הגלריה הראשונה שלך כדי להתחיל.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/create-gallery")
                        }
                        className="dashboard-empty-button"
                    >
                        ＋ יצירת גלריה ראשונה
                    </button>
                </div>
            )}

            {/* אין תוצאות חיפוש */}
            {!error &&
                galleries.length > 0 &&
                filteredGalleries.length === 0 && (
                    <div className="dashboard-empty-state dashboard-no-results">
                        <div className="dashboard-empty-icon">
                            ⌕
                        </div>

                        <h3>לא נמצאו לקוחות</h3>

                        <p>נסי לחפש לפי שם אחר.</p>

                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="dashboard-empty-button"
                        >
                            הצגת כל הלקוחות
                        </button>
                    </div>
                )}

            {/* כרטיסי הלקוחות */}
            {!error && filteredGalleries.length > 0 && (
                <section className="dashboard-gallery-grid">
                    {filteredGalleries.map((gallery) => (
                        <article
                            key={gallery._id}
                            className="dashboard-gallery-card"
                        >
                            {/* פרטי לקוחה */}
                            <div className="dashboard-card-header">
                                <div className="dashboard-client-avatar">
                                    <span aria-hidden="true">
                                        📷
                                    </span>
                                </div>

                                <div className="dashboard-client-info">
                                    <h3>{gallery.clientName}</h3>

                                    <p className="dashboard-client-email">
                                        {gallery.clientEmail}
                                    </p>
                                </div>

                                <div className="dashboard-card-accent">
                                    ✦
                                </div>
                            </div>

                            {/* פרטי הגלריה */}
                            <div className="dashboard-gallery-details">
                                <span>מכסת בחירה</span>

                                <strong>
                                    {gallery.maxSelections} תמונות
                                </strong>
                            </div>

                            {/* פעולות הגלריה */}
                            <div className="dashboard-actions">
                                <h4 className="dashboard-actions-title">
                                    פעולות בגלריה
                                </h4>

                                <div className="dashboard-actions-grid">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/gallery/${gallery._id}`
                                            )
                                        }
                                        className="dashboard-action-button dashboard-action-primary"
                                    >
                                        <span className="dashboard-action-icon">
                                            ◫
                                        </span>

                                        <span>צפייה בגלריה</span>

                                        <small>כל התמונות</small>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/gallery/${gallery._id}/selections`
                                            )
                                        }
                                        className="dashboard-action-button dashboard-action-secondary"
                                    >
                                        <span className="dashboard-action-icon">
                                            ☑
                                        </span>

                                        <span>התמונות שנבחרו</span>

                                        <small>בחירות הלקוחה</small>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/gallery/${gallery._id}/photographer-selections`
                                            )
                                        }
                                        className="dashboard-action-button dashboard-action-secondary"
                                    >
                                        <span className="dashboard-action-icon">
                                            ◎
                                        </span>

                                        <span>בחירות הצלמת</span>

                                        <small>תמונות לשליחה</small>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/gallery/${gallery._id}/edited`
                                            )
                                        }
                                        className="dashboard-action-button dashboard-action-secondary"
                                    >
                                        <span className="dashboard-action-icon">
                                            ▧
                                        </span>

                                        <span>תמונות ערוכות</span>

                                        <small>ניהול והעלאה</small>
                                    </button>
                                 
                      </div>
                            </div>

                            {/* הגדרות לקוחה */}
                            <div className="dashboard-settings">
                                <h4 className="dashboard-settings-title">
                                    הגדרות לקוחה
                                </h4>

                                {/* מתג: תמונות ערוכות נשלחו */}
                                <div className="dashboard-setting-row">
                                    <span
                                        className="dashboard-setting-icon"
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>

                                    <span className="dashboard-setting-text">
                                        <strong>
                                            תמונות ערוכות נשלחו
                                        </strong>

                                        <small
                                            className={
                                                gallery.finalDelivered
                                                    ? "dashboard-setting-status is-on"
                                                    : "dashboard-setting-status"
                                            }
                                        >
                                            {gallery.finalDelivered === true
                                                ? "הסטטוס פעיל"
                                                : "עדיין לא סומן כנשלח"}
                                        </small>
                                    </span>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            gallery.finalDelivered === true
                                        }
                                        aria-label="תמונות ערוכות נשלחו"
                                        className={`dashboard-toggle ${
                                            gallery.finalDelivered === true
                                                ? "is-on"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleFinalDelivered(gallery)
                                        }
                                    >
                                        <span className="dashboard-toggle-thumb">
                                            <span aria-hidden="true">
                                                {gallery.finalDelivered === true
                                                    ? "✓"
                                                    : "×"}
                                            </span>
                                        </span>
                                    </button>
                                </div>

                                {/* מתג: הרשאת הורדה */}
                                <div className="dashboard-setting-row">
                                    <span
                                        className="dashboard-setting-icon"
                                        aria-hidden="true"
                                    >
                                        ↓
                                    </span>

                                    <span className="dashboard-setting-text">
                                        <strong>
                                            הרשאת הורדה
                                        </strong>

                                        <small
                                            className={
                                                gallery.allowClientDownload
                                                    ? "dashboard-setting-status is-on"
                                                    : "dashboard-setting-status"
                                            }
                                        >
                                            {gallery.allowClientDownload === true
                                                ? "ההורדה מאושרת ללקוחה"
                                                : "ההורדה חסומה ללקוחה"}
                                        </small>
                                    </span>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={
                                            gallery.allowClientDownload === true
                                        }
                                        aria-label="הרשאת הורדה ללקוחה"
                                        className={`dashboard-toggle ${
                                            gallery.allowClientDownload === true
                                                ? "is-on"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleClientDownloadPermission(
                                                gallery
                                            )
                                        }
                                    >
                                        <span className="dashboard-toggle-thumb">
                                            <span aria-hidden="true">
                                                {gallery.allowClientDownload === true
                                                    ? "✓"
                                                    : "×"}
                                            </span>
                                        </span>
                                    </button>
                                </div>

                                {gallery.finalDelivered === true && (
                                    <div className="dashboard-delivered-status">
                                        <span aria-hidden="true">✓</span>
                                        התמונות הערוכות נשלחו ללקוחה
                                    </div>
                                )}
                            </div>

                       
{/* כפתורי עריכה והסתרה בתחתית הכרטיס */}
<div className="hide-gallery-footer">
    <button
        type="button"
        onClick={() => navigate(`/admin/edit-gallery/${gallery._id}`)}
        title="עריכת פרטי לקוחה"
        aria-label={`עריכת פרטי הלקוחה ${gallery.clientName}`}
        className="hide-gallery-button"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
    </button>

    {/* הסתרת גלריה */}
    <button
        type="button"
        onClick={() => handleHideGallery(gallery)}
        title="הסתרת גלריה מלוח הניהול"
        aria-label={`הסתרת הגלריה של ${gallery.clientName}`}
        className="hide-gallery-button hide-gallery-button--danger"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="m19 6-1 14H6L5 6" />
            <path d="M10 11v5M14 11v5" />
        </svg>
    </button>
</div>

                        </article>
                    ))}
                </section>
            )}
        </div>
    );
};

export default PhotographerDashboard;
