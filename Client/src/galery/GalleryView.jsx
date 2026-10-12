import { useEffect, useState } from "react";
import "./GalleryView.css";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:2005/api";

const GalleryView = ({ mode }) => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [clientNotes, setClientNotes] = useState({});
    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");
    const [selectedImageIds, setSelectedImageIds] = useState([]);
    const [selectedImageModal, setSelectedImageModal] = useState(null);
    const [selectionMessage, setSelectionMessage] = useState("");
    const [downloadingZip, setDownloadingZip] = useState(false);

    const forceLogin =
        new URLSearchParams(location.search).get("login") === "required";

    useEffect(() => {
        initializeGallery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, mode]);

    const initializeGallery = async () => {
        setLoading(true);
        setError("");

        try {
            if (mode === "photographer") {
                const token = localStorage.getItem("photographerToken");

                if (!token) {
                    setError("אין הרשאה. יש להתחבר כצלמת.");
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/galleries/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setGallery(response.data);

                setSelectedImageIds(
                    response.data.images
                        ?.filter((image) => image.photographerSelected)
                        .map((image) => image._id) || []
                );

                return;
            }

            if (forceLogin) {
                localStorage.removeItem(`clientToken_${id}`);
                setGallery({ _id: id });
                setIsClientAuthenticated(false);
                return;
            }

            const clientToken = localStorage.getItem(`clientToken_${id}`);

            if (!clientToken) {
                setGallery({ _id: id });
                setIsClientAuthenticated(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${API_URL}/galleries/${id}/client-view`,
                    {
                        headers: {
                            Authorization: `Bearer ${clientToken}`,
                        },
                    }
                );

                const data = response.data;
                setGallery(data);
                setIsClientAuthenticated(true);

                setSelectedImageIds(
                    data.images
                        ?.filter((image) => image.clientSelected)
                        .sort(
                            (a, b) =>
                                (a.selectionOrder || 0) -
                                (b.selectionOrder || 0)
                        )
                        .map((image) => image._id) || []
                );

                // שחזור הערות, אם השרת מחזיר אותן בכל תמונה.
                const notes = {};
                (data.images || []).forEach((image) => {
                    if (image.clientNote) {
                        notes[image._id] = image.clientNote;
                    } else if (image.clientNotes) {
                        notes[image._id] = image.clientNotes;
                    }
                });
                setClientNotes(notes);
            } catch (err) {
                console.error("Client token error:", err);
                localStorage.removeItem(`clientToken_${id}`);
                setGallery({ _id: id });
                setIsClientAuthenticated(false);
            }
        } catch (err) {
            console.error("Gallery error:", err);
            setError(
                err.response?.data?.message ||
                    "אירעה שגיאה בטעינת הגלריה"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClientLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        if (!passwordInput.trim()) {
            setLoginError("יש להכניס סיסמה");
            return;
        }

        try {
            const loginResponse = await axios.post(
                `${API_URL}/galleries/${id}/client-login`,
                { password: passwordInput.trim() }
            );

            const clientToken = loginResponse.data.accessToken;

            if (!clientToken) {
                setLoginError("לא התקבל טוקן התחברות מהשרת");
                return;
            }

            localStorage.setItem(`clientToken_${id}`, clientToken);

            const response = await axios.get(
                `${API_URL}/galleries/${id}/client-view`,
                {
                    headers: {
                        Authorization: `Bearer ${clientToken}`,
                    },
                }
            );

            const data = response.data;
            setGallery(data);
            setIsClientAuthenticated(true);

            setSelectedImageIds(
                data.images
                    ?.filter((image) => image.clientSelected)
                    .sort(
                        (a, b) =>
                            (a.selectionOrder || 0) -
                            (b.selectionOrder || 0)
                    )
                    .map((image) => image._id) || []
            );

            const notes = {};
            (data.images || []).forEach((image) => {
                if (image.clientNote) {
                    notes[image._id] = image.clientNote;
                } else if (image.clientNotes) {
                    notes[image._id] = image.clientNotes;
                }
            });
            setClientNotes(notes);

            if (forceLogin) {
                navigate(`/client/gallery/${id}`, { replace: true });
            }
        } catch (err) {
            console.error("Client login error:", err);
            setLoginError(
                err.response?.data?.message || "הסיסמה אינה נכונה"
            );
        }
    };

    const getSelectionColor = (imageId) => {
        if (mode !== "client") return null;

        const index = selectedImageIds.indexOf(imageId);
        if (index === -1) return null;

        const number = index + 1;
        const max = gallery?.maxSelections || 0;

        if (number <= max) return "green";
        if (number <= max + 3) return "orange";
        return "red";
    };

    const getSelectionColorText = (imageId) => {
        const color = getSelectionColor(imageId);

        if (color === "green") return "בחירה רגילה";
        if (color === "orange") return "בחירה נוספת ללא תשלום";
        if (color === "red") return "בחירה בתוספת תשלום";

        return "";
    };

    
const handleToggleSelectLocal = (imageId) => {
    setSelectedImageIds((previous) => {
        if (previous.includes(imageId)) {
            return previous.filter((selectedId) => selectedId !== imageId);
        }

        if (mode === "photographer") {
            return [...previous, imageId];
        }

        const newNumber = previous.length + 1;
        const max = gallery?.maxSelections || 0;

        if (newNumber === max + 1) {
            setSelectionMessage(
                `הגעת למכסה של ${max} תמונות. יש לך עוד 3 תמונות נוספות ללא תשלום.`
            );
        } else if (newNumber === max + 4) {
            setSelectionMessage(
                "בחרת גם את שלוש התמונות הנוספות ללא תשלום. מעכשיו כל תמונה נוספת כרוכה בתשלום."
            );
        }

        return [...previous, imageId];
    });
};


    const handleSendToClient = async () => {
        if (mode !== "photographer") return;

        if (selectedImageIds.length === 0) {
            alert("יש לבחור לפחות תמונה אחת לשליחה ללקוחה");
            return;
        }

        try {
            const token = localStorage.getItem("photographerToken");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.post(
                `${API_URL}/galleries/${id}/photographer-selection`,
                { selectedImageIds },
                config
            );

            await axios.post(
                `${API_URL}/galleries/${id}/send-to-client`,
                {},
                config
            );

            alert("הגלריה נשלחה בהצלחה ללקוחה");
            await initializeGallery();
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                    "אירעה שגיאה בשליחת הגלריה ללקוחה"
            );
        }
    };

    const handleSendToPhotographer = async () => {
        if (mode !== "client") return;

        if (selectedImageIds.length === 0) {
            alert("יש לבחור לפחות תמונה אחת");
            return;
        }

        try {
            const clientToken = localStorage.getItem(`clientToken_${id}`);

            await axios.post(
                `${API_URL}/galleries/${id}/client-selections`,
                {
                    selectedImageIds,
                    clientNotes,
                },
                {
                    headers: {
                        Authorization: `Bearer ${clientToken}`,
                    },
                }
            );

            alert("הבחירות נשלחו בהצלחה לצלמת");
            await initializeGallery();
        } catch (err) {
            console.error(err);

            if (err.response?.status === 401) {
                localStorage.removeItem(`clientToken_${id}`);
                setIsClientAuthenticated(false);
                return;
            }

            if (err.response?.status === 403) {
                alert("אין הרשאה לבצע פעולה זו");
                return;
            }

            alert(
                err.response?.data?.message ||
                    "אירעה שגיאה בשליחת הבחירות"
            );
        }
    };

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    };

    const handleDownloadImage = async (image) => {
        try {
            const response = await axios.get(image.imageUrl, {
                responseType: "blob",
            });

            downloadBlob(
                new Blob([response.data]),
                image.imageName || "image.jpg"
            );
        } catch (err) {
            console.error("Download image error:", err);
            window.open(image.imageUrl, "_blank");
        }
    };

    const handleDownloadEditedImage = async (image, withWatermark) => {
        try {
            const token = localStorage.getItem(`clientToken_${id}`);

            if (!token) {
                alert("נדרשת התחברות כדי להוריד את התמונה");
                setIsClientAuthenticated(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}/edited-image/${image._id}/download?watermark=${withWatermark}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            downloadBlob(
                new Blob([response.data]),
                image.imageName || "edited-image.jpg"
            );
        } catch (err) {
            console.error("שגיאה בהורדת התמונה:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem(`clientToken_${id}`);
                setIsClientAuthenticated(false);
                alert("אין הרשאה להוריד את התמונה");
                return;
            }

            alert("אירעה שגיאה בהורדת התמונה");
        }
    };

    const handleDownloadClientGalleryZip = async () => {
        try {
            setDownloadingZip(true);

            const token = localStorage.getItem(`clientToken_${id}`);

            if (!token) {
                alert("נדרשת התחברות כדי להוריד את התמונות");
                setIsClientAuthenticated(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}/client-gallery-download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            downloadBlob(
                new Blob([response.data], { type: "application/zip" }),
                `gallery-${id}.zip`
            );
        } catch (err) {
            console.error("Download client gallery ZIP error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                alert("אין הרשאה להוריד את התמונות");
                return;
            }

            alert("אירעה שגיאה בהורדת קובץ ה־ZIP");
        } finally {
            setDownloadingZip(false);
        }
    };

    const handleDownloadEditedZip = async (withWatermark) => {
        if (!gallery?.editedImages?.length) {
            alert("אין תמונות ערוכות להורדה");
            return;
        }

        try {
            setDownloadingZip(true);

            const token = localStorage.getItem(`clientToken_${id}`);

            if (!token) {
                alert("נדרשת התחברות כדי להוריד את התמונות");
                setIsClientAuthenticated(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}/edited-download?watermark=${withWatermark}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                }
            );

            downloadBlob(
                new Blob([response.data], { type: "application/zip" }),
                withWatermark
                    ? `edited-gallery-${id}-watermarked.zip`
                    : `edited-gallery-${id}-original.zip`
            );
        } catch (err) {
            console.error("Download edited ZIP error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem(`clientToken_${id}`);
                setIsClientAuthenticated(false);
                alert("ההתחברות פגה. יש להתחבר מחדש.");
                return;
            }

            alert("אירעה שגיאה בהורדת קובץ ה־ZIP");
        } finally {
            setDownloadingZip(false);
        }
    };

    if (loading) {
        return (
            <div className="gallery-view-status">
                <h2>טוען גלריה...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gallery-view-status gallery-view-status--error">
                <h2>{error}</h2>
            </div>
        );
    }

    if (mode === "client" && !isClientAuthenticated) {
        return (
            <div className="gallery-view-login">
                <form
                    onSubmit={handleClientLogin}
                    className="gallery-view-login-card"
                >
                    <div className="gallery-view-login-mark">G</div>

                    <h1 className="gallery-view-login-title">
                        כניסה לגלריה
                    </h1>

                    <p className="gallery-view-login-description">
                        הכניסי את הסיסמה שקיבלת מהצלמת
                    </p>

                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="סיסמה"
                        autoComplete="current-password"
                        className="gallery-view-login-input"
                    />

                    {loginError && (
                        <div className="gallery-view-login-error">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="gallery-view-login-submit"
                    >
                        כניסה לגלריה
                    </button>
                </form>
            </div>
        );
    }

    if (!gallery) {
        return (
            <div className="gallery-view-status">
                <h2>הגלריה לא נמצאה</h2>
            </div>
        );
    }

    const selectedCount = selectedImageIds.length;
    const maxSelections = gallery.maxSelections || 0;
    const editedImages = gallery.editedImages || [];

    return (
        <div className="gallery-view-page">
            <section className="gallery-view-panel">
                {mode === "photographer" && (
                    <button
                        onClick={() => navigate("/admin")}
                        className="gallery-view-button gallery-view-button--light gallery-view-back"
                    >
                        ← חזרה ללקוחות
                    </button>
                )}

                <p className="gallery-view-eyebrow">YOUR PRIVATE GALLERY</p>

                <h1 className="gallery-view-title">
                    הגלריה של {gallery.clientName || ""}
                </h1>

                <div className="gallery-view-divider" />

                {mode === "client" && !gallery.finalDelivered && (
                    <>
                        <div className="gallery-view-selection-count">
                            נבחרו <strong>{selectedCount}</strong> מתוך{" "}
                            <strong>{maxSelections}</strong> תמונות
                        </div>

                        {/* {selectionMessage && (
                            <div className="gallery-view-message">
                                {selectionMessage}
                            </div>
                        )} */}

                        <div className="gallery-view-legend">
                            <div className="gallery-view-legend-item">
                                <span
                                    className="gallery-view-legend-dot"
                                    style={{ background: "#22a06b" }}
                                />
                                1–{maxSelections} תמונות
                            </div>

                            <div className="gallery-view-legend-item">
                                <span
                                    className="gallery-view-legend-dot"
                                    style={{ background: "#d69a35" }}
                                />
                                3 תמונות נוספות ללא תשלום
                            </div>

                            <div className="gallery-view-legend-item">
                                <span
                                    className="gallery-view-legend-dot"
                                    style={{ background: "#c84b43" }}
                                />
                                תמונות נוספות בתוספת תשלום
                            </div>
                        </div>
                    </>
                )}

                {mode === "client" && gallery.finalDelivered && (
                    <p className="gallery-view-subtitle">
                        התמונות הערוכות שלך מוכנות לצפייה ולהורדה.
                    </p>
                )}

                {mode === "photographer" && (
                    <div className="gallery-view-selection-count">
                        נבחרו <strong>{selectedCount}</strong> תמונות לשליחה
                    </div>
                )}

                <div className="gallery-view-actions">
                    {mode === "photographer" && (
                        <button
                            onClick={handleSendToClient}
                            className="gallery-view-button gallery-view-button--gold"
                        >
                            שלחי את התמונות ללקוחה
                        </button>
                    )}

                    {mode === "client" && !gallery.finalDelivered && (
                        <button
                            onClick={handleSendToPhotographer}
                            className="gallery-view-button"
                        >
                            שלחי בחירות לצלמת
                        </button>
                    )}
                </div>
            </section>

            {/* התמונות הערוכות */}
            {mode === "client" && (
                <section className="gallery-view-panel">
                    <div className="gallery-view-section-heading">
                        <div>
                            <p className="gallery-view-eyebrow">
                                THE FINAL EDITS
                            </p>
                            <h2 className="gallery-view-section-title">
                                התמונות הערוכות
                            </h2>
                        </div>

                        <span className="gallery-view-count-badge">
                            {editedImages.length} תמונות
                        </span>
                    </div>

                    <div className="gallery-view-divider" />

                    {editedImages.length > 0 ? (
                        <>
                            <div className="gallery-view-actions gallery-view-actions--top">
                                <button
                                    onClick={() => handleDownloadEditedZip(true)}
                                    disabled={downloadingZip}
                                    className="gallery-view-button gallery-view-button--gold"
                                >
                                    {downloadingZip
                                        ? "מכין קובץ ZIP..."
                                        : "📦 ZIP עם watermark"}
                                </button>

                                <button
                                    onClick={() => handleDownloadEditedZip(false)}
                                    disabled={downloadingZip}
                                    className="gallery-view-button gallery-view-button--light"
                                >
                                    {downloadingZip
                                        ? "מכין קובץ ZIP..."
                                        : "📦 ZIP בלי watermark"}
                                </button>
                            </div>

                            <div className="gallery-view-grid gallery-view-grid--edited">
                                {editedImages.map((image, index) => (
                                    <article
                                        key={image._id || index}
                                        className="gallery-view-card"
                                    >
                                        <div
                                            className="gallery-view-image-wrap gallery-view-image-wrap--edited"
                                            onClick={() =>
                                                setSelectedImageModal(image)
                                            }
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {
                                                    setSelectedImageModal(image);
                                                }
                                            }}
                                        >
                                            <img
                                                src={
                                                    image.watermarkedImageUrl ||
                                                    image.imageUrl
                                                }
                                                alt={
                                                    image.imageName ||
                                                    `תמונה ${index + 1}`
                                                }
                                                className="gallery-view-image"
                                            />
                                        </div>

                                        <div className="gallery-view-card-content">
                                            <div className="gallery-view-image-name">
                                                {image.imageName ||
                                                    `תמונה ${index + 1}`}
                                            </div>

                                            <div className="gallery-view-card-actions">
                                                <button
                                                    onClick={() =>
                                                        handleDownloadEditedImage(
                                                            image,
                                                            false
                                                        )
                                                    }
                                                    title="הורדה ללא חותמת מים"
                                                    className="gallery-view-button"
                                                >
                                                    📥 הורדה
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDownloadEditedImage(
                                                            image,
                                                            true
                                                        )
                                                    }
                                                    title="הורדה עם חותמת מים"
                                                    aria-label="הורדת התמונה עם חותמת מים"
                                                    className="gallery-view-button gallery-view-button--light gallery-view-watermark-button"
                                                >
                                                    💧
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="gallery-view-empty">
                            <span className="gallery-view-empty-icon">✦</span>
                            <h3>התמונות הערוכות עדיין לא כאן</h3>
                            <p>
                                כשהצלמת תעלה את התמונות הערוכות, הן יופיעו כאן.
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* התמונות הרגילות */}
            {gallery.images?.length > 0 && (
                <section className="gallery-view-gallery-section">
                    <div className="gallery-view-section-heading gallery-view-section-heading--gallery">
                        <div>
                            <p className="gallery-view-eyebrow">
                                {mode === "photographer"
                                    ? "SELECT PHOTOS"
                                    : "YOUR SELECTION"}
                            </p>

                            <h2 className="gallery-view-section-title">
                                תמונות הגלריה
                            </h2>
                        </div>

                        {mode === "client" &&
                            gallery.allowClientDownload === true && (
                                <button
                                    onClick={handleDownloadClientGalleryZip}
                                    disabled={downloadingZip}
                                    className="gallery-view-button gallery-view-button--gold"
                                >
                                    {downloadingZip
                                        ? "מכין קובץ ZIP..."
                                        : "📦 הורדת כל התמונות כ־ZIP"}
                                </button>
                            )}
                    </div>

                    <div className="gallery-view-grid">
                        {gallery.images.map((image) => {
                            const isSelected = selectedImageIds.includes(
                                image._id
                            );
                            const selectionColor =
                                mode === "client"
                                    ? getSelectionColor(image._id)
                                    : null;
                            const selectionNumber =
                                selectedImageIds.indexOf(image._id) + 1;

                            return (
                                <article
                                    key={image._id}
                                    className={`gallery-view-card ${
                                        isSelected ? "is-selected" : ""
                                    }`}
                                >
                                    <div
                                        className="gallery-view-image-wrap"
                                        onClick={() =>
                                            setSelectedImageModal(image)
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                setSelectedImageModal(image);
                                            }
                                        }}
                                    >
                                        <img
                                            src={
                                                mode === "client"
                                                    ? image.watermarkedImageUrl ||
                                                      image.imageUrl
                                                    : image.imageUrl
                                            }
                                            alt={image.imageName || "תמונה"}
                                            className="gallery-view-image"
                                        />

                                        {mode === "client" && isSelected && (
                                            <div
                                                className="gallery-view-selected-heart"
                                                style={{
                                                    color:
                                                        selectionColor === "green"
                                                            ? "#22a06b"
                                                            : selectionColor ===
                                                              "orange"
                                                            ? "#d69a35"
                                                            : "#c84b43",
                                                }}
                                            >
                                                ♥
                                            </div>
                                        )}

                                        {mode === "client" && isSelected && (
                                            <div className="gallery-view-selection-number">
                                                בחירה #{selectionNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div className="gallery-view-card-content">
                                        <div className="gallery-view-image-name">
                                            {image.imageName || "תמונה"}
                                        </div>

                                        {mode === "client" &&
                                            !gallery.finalDelivered && (
                                                <textarea
                                                    value={
                                                        clientNotes[image._id] ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setClientNotes(
                                                            (previous) => ({
                                                                ...previous,
                                                                [image._id]:
                                                                    e.target.value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="הוסיפי הערה לתמונה..."
                                                    rows={3}
                                                    className="gallery-view-note"
                                                    aria-label={`הערה לתמונה ${
                                                        image.imageName || ""
                                                    }`}
                                                />
                                            )}

                                        {mode === "client" && isSelected && (
                                            <div
                                                className={`gallery-view-selection-label gallery-view-selection-label--${selectionColor}`}
                                            >
                                                {getSelectionColorText(
                                                    image._id
                                                )}
                                            </div>
                                        )}

                                        <div className="gallery-view-card-actions">
                                            <button
                                                onClick={() =>
                                                    handleToggleSelectLocal(
                                                        image._id
                                                    )
                                                }
                                                className={`gallery-view-button ${
                                                    isSelected
                                                        ? "gallery-view-button--gold"
                                                        : "gallery-view-button--light"
                                                }`}
                                            >
                                                {mode === "photographer"
                                                    ? isSelected
                                                        ? "✓ נבחרה ללקוחה"
                                                        : "בחרי ללקוחה"
                                                    : isSelected
                                                    ? "✓ נבחרה"
                                                    : "בחרי תמונה"}
                                            </button>

                                            {mode === "client" &&
                                                gallery.allowClientDownload ===
                                                    true && (
                                                    <button
                                                        onClick={() =>
                                                            handleDownloadImage(
                                                                image
                                                            )
                                                        }
                                                        className="gallery-view-button gallery-view-button--light"
                                                    >
                                                        📥 הורדה
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

{/* חלונית הודעה על מכסת התמונות */}
{selectionMessage && (
    <div
        className="gallery-view-notice-overlay"
        dir="rtl"
    >
        <div
            className="gallery-view-notice"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="gallery-notice-title"
            aria-describedby="gallery-notice-message"
        >
            <div className="gallery-view-notice-decoration">
                ✦
            </div>

            <h2 id="gallery-notice-title">
                {selectionMessage.includes("תשלום")
                    ? "בחירה בתוספת תשלום"
                    : "מכסת התמונות"}
            </h2>

            <div className="gallery-view-notice-divider">
                <span />
                ◆
                <span />
            </div>

            <p id="gallery-notice-message">
                {selectionMessage}
            </p>

            <button
                type="button"
                className="gallery-view-notice-confirm"
                onClick={() => setSelectionMessage("")}
                autoFocus
            >
                אישור
            </button>
        </div>
    </div>
)}

            {/* חלון תמונה מוגדלת */}
            {selectedImageModal && (
                <div
                    className="gallery-view-modal"
                    onClick={() => setSelectedImageModal(null)}
                    role="presentation"
                >
                    <div
                        className="gallery-view-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={
                                mode === "client"
                                    ? selectedImageModal.watermarkedImageUrl ||
                                      selectedImageModal.imageUrl
                                    : selectedImageModal.imageUrl
                            }
                            alt={selectedImageModal.imageName || "תמונה"}
                            className="gallery-view-modal-image"
                        />

                        <button
                            onClick={() => setSelectedImageModal(null)}
                            className="gallery-view-modal-close"
                            aria-label="סגירת התמונה"
                        >
                            ×
                        </button>

                    </div>
                </div>
            )}
            
            {mode === "client" && (
                <footer className="gallery-view-footer" dir="rtl">
                    פותח על ידי ©NF-0583270984 2026
                </footer>
            )}

        </div>
    );
};

export default GalleryView;