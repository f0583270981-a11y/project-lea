
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import "./ClientSelections.css";

const API_URL = "http://localhost:2005/api";

const ClientSelections = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImageModal, setSelectedImageModal] = useState(null);
    const [downloadingAll, setDownloadingAll] = useState(false);

    useEffect(() => {
        loadClientSelections();
    }, [id]);

    const loadClientSelections = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("photographerToken");

            if (!token) {
                setError("אין הרשאה. יש להתחבר כצלמת.");
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}/client-selections`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setGallery(response.data);
        } catch (err) {
            console.error("Error loading client selections:", err);
            setError(
                err.response?.data?.message ||
                "אירעה שגיאה בטעינת הבחירות"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadImage = async (image) => {
        try {
            const response = await axios.get(image.imageUrl, {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = image.imageName || "image.jpg";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading image:", err);
            window.open(image.imageUrl, "_blank");
        }
    };

    const handleDownloadAll = async () => {
        if (!gallery?.images?.length) return;

        try {
            setDownloadingAll(true);

            const zip = new JSZip();
            const folder = zip.folder(
                `בחירות-${gallery.clientName || "לקוחה"}`
            );

            for (let i = 0; i < gallery.images.length; i++) {
                const image = gallery.images[i];

                try {
                    const response = await axios.get(image.imageUrl, {
                        responseType: "blob"
                    });

                    folder.file(
                        image.imageName || `image-${i + 1}.jpg`,
                        response.data
                    );
                } catch (imageError) {
                    console.error(
                        `לא ניתן להוריד את התמונה ${image.imageName}`,
                        imageError
                    );
                }
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(zipBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `בחירות-${gallery.clientName || "לקוחה"}.zip`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error creating ZIP:", err);
            alert("אירעה שגיאה בהורדת התמונות");
        } finally {
            setDownloadingAll(false);
        }
    };

    const getColor = (image) => image.selectionColor || "green";

    const getColorText = (image) =>
        image.selectionColorText || "בחירה רגילה";

    const getColorCode = (image) => {
        const colors = {
            green: "#22c55e",
            orange: "#f97316",
            red: "#ef4444"
        };

        return colors[getColor(image)] || colors.green;
    };

    if (loading) {
        return (
            <div className="selections-state">
                <div className="selections-loader" />
                <h2>טוען את בחירות הלקוחה...</h2>
                <p>רק רגע, אנחנו מכינים את הגלריה</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="selections-state">
                <div className="selections-state-icon">!</div>
                <h2>לא הצלחנו לטעון את הבחירות</h2>
                <p>{error}</p>
                <button
                    className="selections-button selections-button-gold"
                    onClick={() => navigate("/admin")}
                >
                    חזרה ללקוחות
                </button>
            </div>
        );
    }

    if (!gallery) {
        return (
            <div className="selections-state">
                <h2>הגלריה לא נמצאה</h2>
                <button
                    className="selections-button selections-button-gold"
                    onClick={() => navigate("/admin")}
                >
                    חזרה ללקוחות
                </button>
            </div>
        );
    }

    const images = gallery.images || [];
    const maxSelections = gallery.maxSelections || 0;

    return (
        <main className="client-selections-page" dir="rtl">
            <div className="selections-container">

                <header className="selections-hero">
                    <div className="selections-hero-top">
                        <button
                            className="selections-back-button"
                            onClick={() => navigate("/admin")}
                        >
                            <span>←</span> חזרה ללקוחות
                        </button>

                        <div className="selections-brand">
                            <span className="selections-brand-line" />
                            <span>PHOTO GALLERY</span>
                            <span className="selections-brand-line" />
                        </div>
                    </div>

                    <div className="selections-hero-content">
                        <div className="selections-eyebrow">
                            CLIENT COLLECTION
                        </div>

                        <h1>בחירות הלקוחה</h1>

                        <div className="selections-gold-divider">
                            <span />
                            <span className="selections-divider-diamond">◆</span>
                            <span />
                        </div>

                        <h2>{gallery.clientName}</h2>

                        <p className="selections-subtitle">
                            כל הרגעים שנבחרו, במקום אחד
                        </p>
                    </div>

                    <div className="selections-stats">
                        <div className="selections-stat">
                            <span className="selections-stat-number">
                                {images.length}
                            </span>
                            <span className="selections-stat-label">
                                תמונות שנבחרו
                            </span>
                        </div>

                        <div className="selections-stat-divider" />

                        <div className="selections-stat">
                            <span className="selections-stat-number">
                                {maxSelections}
                            </span>
                            <span className="selections-stat-label">
                                מכסת תמונות
                            </span>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <button
                            className="selections-button selections-button-gold selections-download-all"
                            onClick={handleDownloadAll}
                            disabled={downloadingAll}
                        >
                            <span className="selections-download-icon">↓</span>
                            {downloadingAll
                                ? "מכין את קובץ ה-ZIP..."
                                : "הורדת כל התמונות"}
                        </button>
                    )}
                </header>

                <section className="selections-legend">
                    <div className="selections-section-heading">
                        <span className="selections-section-line" />
                        <h3>מקרא בחירות</h3>
                        <span className="selections-section-line" />
                    </div>

                    <div className="selections-legend-items">
                        <div className="selections-legend-item">
                            <span className="selections-legend-dot legend-green" />
                            <span>בחירה רגילה</span>
                        </div>

                        <div className="selections-legend-item">
                            <span className="selections-legend-dot legend-orange" />
                            <span>3 תמונות נוספות ללא תשלום</span>
                        </div>

                        <div className="selections-legend-item">
                            <span className="selections-legend-dot legend-red" />
                            <span>תמונות נוספות בתוספת תשלום</span>
                        </div>
                    </div>
                </section>

                {images.length === 0 ? (
                    <section className="selections-empty">
                        <div className="selections-empty-icon">♡</div>
                        <h2>עדיין אין בחירות</h2>
                        <p>הלקוחה עדיין לא בחרה תמונות מהגלריה.</p>
                    </section>
                ) : (
                    <>
                        <div className="selections-gallery-heading">
                            <div>
                                <span className="selections-eyebrow">
                                    YOUR SELECTED MOMENTS
                                </span>
                                <h2>התמונות שנבחרו</h2>
                            </div>

                            <span className="selections-count-badge">
                                {images.length} תמונות
                            </span>
                        </div>

                        <section className="selections-grid">
                            {images.map((image, index) => {
                                const colorCode = getColorCode(image);

                                return (
                                    <article
                                        key={image._id}
                                        className="selection-card"
                                        style={{ "--selection-color": colorCode }}
                                    >
                                        <div
                                            className="selection-image-wrap"
                                            onClick={() => setSelectedImageModal(image)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setSelectedImageModal(image);
                                                }
                                            }}
                                            aria-label={`הגדלת תמונה ${index + 1}`}
                                        >
                                            <img
                                                src={image.imageUrl}
                                                alt={image.imageName || "תמונה"}
                                                className="selection-image"
                                                loading="lazy"
                                            />

                                            <div className="selection-image-shade" />

                                            <div className="selection-heart">♥</div>

                                            <div className="selection-number">
                                                בחירה #{index + 1}
                                            </div>

                                            <div className="selection-zoom">
                                                הגדלת תמונה ↗
                                            </div>
                                        </div>

                                        <div className="selection-card-content">
                                            <div className="selection-card-title">
                                                <span className="selection-title-dot" />
                                                <span>
                                                    {image.imageName || `תמונה ${index + 1}`}
                                                </span>
                                            </div>

                                            <div className="selection-note">
                                                <div className="selection-note-heading">
                                                    <span>✦</span>
                                                    הערת הלקוחה
                                                </div>

                                                <p className={
                                                    image.clientNote?.trim()
                                                        ? "selection-note-text"
                                                        : "selection-note-empty"
                                                }>
                                                    {image.clientNote?.trim()
                                                        ? image.clientNote
                                                        : "לא נכתבה הערה לתמונה זו"}
                                                </p>
                                            </div>

                                            <div className="selection-category">
                                                <span
                                                    className="selection-category-dot"
                                                    style={{ background: colorCode }}
                                                />
                                                <span style={{ color: colorCode }}>
                                                    {getColorText(image)}
                                                </span>
                                            </div>

                                            <button
                                                className="selections-button selections-button-dark selection-download-button"
                                                onClick={() => handleDownloadImage(image)}
                                            >
                                                <span>↓</span>
                                                הורדת תמונה
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    </>
                )}

             
<footer className="selections-footer">
    <span className="selections-footer-line" />
    <span>פותח על ידי ©NF-0583270984 2026</span>
    <span className="selections-footer-line" />
</footer>

            </div>

            {selectedImageModal && (
                <div
                    className="selections-modal"
                    onClick={() => setSelectedImageModal(null)}
                >
                    <button
                        className="selections-modal-close"
                        onClick={() => setSelectedImageModal(null)}
                        aria-label="סגירת התמונה"
                    >
                        ×
                    </button>

                    <div
                        className="selections-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImageModal.imageUrl}
                            alt={selectedImageModal.imageName || "תמונה"}
                        />

                        <div className="selections-modal-caption">
                            {selectedImageModal.imageName || "תמונה"}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ClientSelections;
