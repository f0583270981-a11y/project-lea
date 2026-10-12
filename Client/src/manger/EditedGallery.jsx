
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditedGallery.css";

const API_URL = "http://localhost:2005/api";

const EditedGallery = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [editedImages, setEditedImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadEditedImages();
    }, [id]);

    const loadEditedImages = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("photographerToken");

            if (!token) {
                navigate(
                    `/login?returnTo=${encodeURIComponent(
                        `/gallery/${id}/edited`
                    )}`
                );
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}/edited`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setClientName(response.data.clientName);
            setClientEmail(response.data.clientEmail);
            setEditedImages(response.data.editedImages || []);
        } catch (err) {
            console.error("Error loading edited images:", err);

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
                "אירעה שגיאה בטעינת התמונות"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files || []));
        setSuccess("");
        setError("");
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError("לא נבחרו תמונות להעלאה");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("photographerToken");

            if (!token) {
                navigate("/login");
                return;
            }

            const formData = new FormData();

            selectedFiles.forEach((file) => {
                formData.append("editedImages", file);
            });

            const response = await axios.post(
                `${API_URL}/galleries/${id}/edited-images`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEditedImages(
                response.data.gallery.editedImages || []
            );

            setSelectedFiles([]);

            const input = document.getElementById("editedImagesInput");

            if (input) {
                input.value = "";
            }

            setSuccess("התמונות הערוכות הועלו בהצלחה!");
        } catch (err) {
            console.error("Error uploading edited images:", err);

            setError(
                err.response?.data?.message ||
                "אירעה שגיאה בהעלאת התמונות"
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (image) => {
        try {
            const response = await axios.get(image.imageUrl, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");

            link.href = url;
            link.download = image.imageName || "edited-image";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            setError("לא הצלחנו להוריד את התמונה. נסי שוב.");
        }
    };

    if (loading) {
        return (
            <div className="edited-gallery-page">
                <div className="edited-gallery-state">
                    <div className="edited-gallery-spinner" />
                    <h2>טוען את התמונות הערוכות...</h2>
                    <p>רגע קטן, אנחנו מכינים את הגלריה</p>
                </div>
            </div>
        );
    }

    return (
        <main className="edited-gallery-page">
            <div className="edited-gallery-container">

                {/* כותרת העמוד */}
                <header className="edited-gallery-header">
                    <div className="edited-gallery-hero-top">
                        <button
                            className="edited-gallery-back"
                            onClick={() => navigate("/admin")}
                        >
                            <span>←</span>
                            חזרה ללקוחות
                        </button>

                        <div className="edited-gallery-brand">
                            <span />
                            GALLERY COLLECTION
                            <span />
                        </div>
                    </div>

                    <div className="edited-gallery-hero-content">
                        <div className="edited-gallery-eyebrow">
                            FINAL EDITED PHOTOS
                        </div>

                        <h1 className="edited-gallery-title">
                            התמונות הערוכות
                        </h1>

                        <div className="edited-gallery-divider">
                            <span />
                            <span className="edited-gallery-diamond">◆</span>
                            <span />
                        </div>

                        <h2 className="edited-gallery-client">
                            {clientName}
                        </h2>

                        {clientEmail && (
                            <p className="edited-gallery-email">
                                {clientEmail}
                            </p>
                        )}

                        <div className="edited-gallery-stats">
                            <div className="edited-gallery-stat">
                                <div className="edited-gallery-stat-number">
                                    {editedImages.length}
                                </div>

                                <div className="edited-gallery-stat-label">
                                    תמונות ערוכות
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* אזור העלאת תמונות */}
                <section className="edited-gallery-upload">
                    <div className="edited-gallery-section-heading">
                        <div>
                            <span className="edited-gallery-section-eyebrow">
                                UPLOAD COLLECTION
                            </span>

                            <h2>העלאת תמונות ערוכות</h2>

                            <p>
                                בחרי תמונות מהמחשב והעלי אותן לגלריה של הלקוחה.
                            </p>
                        </div>
                    </div>

                    <label
                        className="edited-gallery-file-picker"
                        htmlFor="editedImagesInput"
                    >
                        <span className="edited-gallery-upload-icon">
                            ↑
                        </span>

                        <span className="edited-gallery-file-title">
                            לחצי לבחירת תמונות
                        </span>

                        <span className="edited-gallery-file-description">
                            ניתן לבחור כמה תמונות בבת אחת
                        </span>

                        <span className="edited-gallery-file-types">
                            קובצי תמונה בלבד
                        </span>
                    </label>

                    <input
                        id="editedImagesInput"
                        className="edited-gallery-file-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {selectedFiles.length > 0 && (
                        <div className="edited-gallery-selected-files">
                            <span className="edited-gallery-selected-check">
                                ✓
                            </span>

                            נבחרו {selectedFiles.length} תמונות להעלאה
                        </div>
                    )}

                    <button
                        className="edited-gallery-upload-button"
                        onClick={handleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                    >
                        {uploading ? (
                            <>
                                <span className="edited-gallery-button-spinner" />
                                מעלה תמונות...
                            </>
                        ) : (
                            <>
                                <span>↑</span>
                                העלאת תמונות ערוכות
                            </>
                        )}
                    </button>

                    {success && (
                        <div className="edited-gallery-notice edited-gallery-success">
                            <span>✓</span>
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="edited-gallery-notice edited-gallery-error">
                            <span>!</span>
                            {error}
                        </div>
                    )}
                </section>

                {/* התמונות שהועלו */}
                <section className="edited-gallery-content">
                    <div className="edited-gallery-section-heading">
                        <div>
                            <span className="edited-gallery-section-eyebrow">
                                THE FINAL COLLECTION
                            </span>

                            <h2>גלריית התמונות הערוכות</h2>

                            <p>
                                כל התמונות הערוכות שהועלו עבור הלקוחה.
                            </p>
                        </div>

                        <div className="edited-gallery-total">
                            {editedImages.length} תמונות
                        </div>
                    </div>

                    {editedImages.length === 0 ? (
                        <div className="edited-gallery-empty">
                            <div className="edited-gallery-empty-icon">
                                ◇
                            </div>

                            <h3>עדיין אין תמונות ערוכות</h3>

                            <p>
                                התמונות שתעלי יופיעו כאן ויהיו מוכנות לצפייה ולהורדה.
                            </p>
                        </div>
                    ) : (
                        <div className="edited-gallery-grid">
                            {editedImages.map((image, index) => (
                                <article
                                    className="edited-gallery-card"
                                    key={image._id || image.imageUrl || index}
                                >
                                    <div className="edited-gallery-image-wrapper">
                                        <img
                                            className="edited-gallery-image"
                                            src={image.imageUrl}
                                            alt={
                                                image.imageName ||
                                                "תמונה ערוכה"
                                            }
                                            loading="lazy"
                                        />

                                        <div className="edited-gallery-image-badge">
                                            תמונה ערוכה
                                        </div>
                                    </div>

                                    <div className="edited-gallery-card-content">
                                        <div className="edited-gallery-image-name">
                                            {image.imageName || "תמונה ללא שם"}
                                        </div>

                                        <div className="edited-gallery-card-bottom">
                                            <span className="edited-gallery-image-number">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <span className="edited-gallery-image-total">
                                                מתוך {editedImages.length}
                                            </span>
                                        </div>

                                        <button
                                            className="edited-gallery-download-button"
                                            onClick={() => handleDownload(image)}
                                        >
                                            <span>↓</span>
                                            הורדת תמונה
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <footer className="edited-gallery-footer">
                    <span />
  פותח על ידי ©NF-0583270984 2026
                      <span />
                </footer>
            </div>
        </main>
    );
};

export default EditedGallery;
