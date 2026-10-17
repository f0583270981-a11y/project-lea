import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateGallery.css";
import { API_URL } from "../config";
//const API_URL = "http://localhost:2005/api";

function GalleryDetailsEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [maxSelections, setMaxSelections] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // טעינת פרטי הגלריה הקיימת
    useEffect(() => {
        let isMounted = true;

        const fetchGallery = async () => {
            const token = localStorage.getItem("photographerToken");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    `${API_URL}/galleries/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!isMounted) return;

                const gallery = response.data;

                setClientName(gallery.clientName || "");
                setClientEmail(gallery.clientEmail || "");
                setMaxSelections(String(gallery.maxSelections ?? ""));
            } catch (err) {
                if (!isMounted) return;

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
                    "לא ניתן לטעון את פרטי הגלריה."
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchGallery();

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    // שמירת השינויים בגלריה הקיימת
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const trimmedName = clientName.trim();
        const trimmedEmail = clientEmail.trim();
        const selectionsNumber = Number(maxSelections);

        if (!trimmedName || !trimmedEmail || !maxSelections.trim()) {
            setError("יש למלא את כל השדות.");
            return;
        }

        if (
            !Number.isInteger(selectionsNumber) ||
            selectionsNumber < 1
        ) {
            setError("מכסת הבחירה חייבת להיות מספר שלם וחיובי.");
            return;
        }

        const token = localStorage.getItem("photographerToken");

        if (!token) {
            navigate("/login");
            return;
        }

        setSaving(true);

        try {
            await axios.put(
                `${API_URL}/galleries/${id}`,
                {
                    clientName: trimmedName,
                    clientEmail: trimmedEmail,
                    maxSelections: selectionsNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("פרטי הגלריה עודכנו בהצלחה!");
            navigate("/admin");
        } catch (err) {
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
                "אירעה שגיאה בשמירת הפרטים. נסי שוב."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="create-gallery-page">
                <div className="create-gallery-header">
                    <h2>עריכת פרטי גלריה</h2>
                    <p>טוען את פרטי הלקוחה...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-gallery-page">
            <div className="create-gallery-header">
                <h2>עריכת פרטי גלריה</h2>
                <p>
                    כאן ניתן לעדכן את פרטי הלקוחה ואת מכסת בחירת התמונות.
                </p>
            </div>

            <div className="create-gallery-card">
                <form
                    className="create-gallery-form"
                    onSubmit={handleSubmit}
                >
                    <div className="create-gallery-field">
                        <label htmlFor="clientName">
                            שם הלקוחה
                        </label>

                        <input
                            id="clientName"
                            type="text"
                            value={clientName}
                            onChange={(e) =>
                                setClientName(e.target.value)
                            }
                            placeholder="הכניסי את שם הלקוחה"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="create-gallery-field">
                        <label htmlFor="clientEmail">
                            כתובת אימייל
                        </label>

                        <input
                            id="clientEmail"
                            type="email"
                            value={clientEmail}
                            onChange={(e) =>
                                setClientEmail(e.target.value)
                            }
                            placeholder="הכניסי כתובת אימייל"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="create-gallery-field">
                        <label htmlFor="maxSelections">
                            מכסת בחירת תמונות
                        </label>

                        <input
                            id="maxSelections"
                            type="number"
                            min="1"
                            step="1"
                            value={maxSelections}
                            onChange={(e) =>
                                setMaxSelections(e.target.value)
                            }
                            placeholder="הכניסי את מספר התמונות"
                            required
                        />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            style={{
                                color: "#b42318",
                                margin: 0,
                                lineHeight: 1.6,
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="create-gallery-submit"
                        disabled={saving}
                    >
                        {saving ? "שומרת שינויים..." : "שמור שינויים"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        disabled={saving}
                        style={{
                            width: "100%",
                            minHeight: "44px",
                            padding: "10px 16px",
                            fontFamily: "inherit",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#151515",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D9CDB8",
                            borderRadius: "7px",
                            cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        ביטול וחזרה לגלריות
                    </button>
                </form>
            </div>
        </div>
    );
}

export default GalleryDetailsEditor;
