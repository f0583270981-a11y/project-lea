
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    useParams,
    useNavigate
} from "react-router-dom";

import "./PhotographerSelections.css";
import { API_URL } from "../config";
//const API_URL = "http://localhost:2005/api";

const PhotographerSelections = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gallery, setGallery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadGallery();
    }, [id]);

    const loadGallery = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("photographerToken");

            if (!token) {
                setError("אין הרשאה. יש להתחבר כצלמת.");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_URL}/galleries/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setGallery(response.data);

        } catch (err) {
            console.error(
                "Error loading photographer selections:",
                err
            );

            setError(
                err.response?.data?.message ||
                "אירעה שגיאה בטעינת התמונות"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="photographer-selections-message">
                <h2>טוען את התמונות...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="photographer-selections-message">
                <h2 className="photographer-selections-error">
                    {error}
                </h2>
            </div>
        );
    }

    if (!gallery) {
        return (
            <div className="photographer-selections-message">
                <h2>הגלריה לא נמצאה</h2>
            </div>
        );
    }

    const selectedImages = (gallery.images || []).filter(
        (image) => image.photographerSelected === true
    );

    return (
        <div className="photographer-selections-page">

            {/* כותרת העמוד */}
            <div className="photographer-selections-header">

                <button
                    className="photographer-selections-back"
                    onClick={() => navigate("/admin")}
                >
                    <span>←</span>
                    חזרה ללקוחות
                </button>

                <div className="photographer-selections-eyebrow">
                    GALLERY COLLECTION
                </div>

                <h1 className="photographer-selections-title">
                    התמונות שנבחרו ללקוחה
                </h1>

                <h2 className="photographer-selections-client">
                    {gallery.clientName}
                </h2>

                <div className="photographer-selections-divider" />

                <div className="photographer-selections-count">
                    סך הכול נבחרו
                    <strong>{selectedImages.length}</strong>
                    תמונות
                </div>

            </div>

            {/* מצב שבו עדיין לא נבחרו תמונות */}
            {selectedImages.length === 0 && (
                <div className="photographer-selections-empty">
                    <h2>
                        עדיין לא נבחרו תמונות ללקוחה
                    </h2>
                </div>
            )}

            {/* גלריית התמונות */}
            {selectedImages.length > 0 && (
                <div className="photographer-selections-grid">

                    {selectedImages.map((image, index) => (
                        <div
                            key={image._id}
                            className="photographer-selections-card"
                        >
                            <img
                                src={image.imageUrl}
                                alt={image.imageName || "תמונה"}
                                className="photographer-selections-image"
                            />

                            <div className="photographer-selections-card-content">

                                <div className="photographer-selections-image-name">
                                    {image.imageName}
                                </div>

                                <div className="photographer-selections-image-number">
                                    תמונה #{index + 1}
                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default PhotographerSelections;
