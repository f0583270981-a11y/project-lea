
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './CreateGallery.css';

// const CreateGallery = () => {
//     const [clientName, setClientName] = useState('');
//     const [clientEmail, setClientEmail] = useState('');
//     const [maxSelections, setMaxSelections] = useState('');
//     const [images, setImages] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();

//     // טיפול בבחירת הקבצים מהמחשב
//     const handleFileChange = (e) => {
//         setImages(Array.from(e.target.files));
//     };

//     // שליחת הטופס לשרת ליצירת הגלריה
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (
//             !clientName ||
//             !clientEmail ||
//             maxSelections === '' ||
//             images.length === 0
//         ) {
//             alert('נא למלא את כל שדות החובה ולצרף תמונות');
//             return;
//         }

//         const formData = new FormData();
//         formData.append('clientName', clientName);
//         formData.append('clientEmail', clientEmail);
//         formData.append('maxSelections', maxSelections);

//         // הוספת התמונות תחת השם images
//         images.forEach((image) => {
//             formData.append('images', image);
//         });

//         try {
//             setLoading(true);

//             const token = localStorage.getItem('photographerToken');

//             const response = await axios.post(
//                 'http://localhost:2005/api/galleries',
//                 formData,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                         Authorization: `Bearer ${token}`
//                     }
//                 }
//             );

//             const { newGallery, clientPassword } = response.data;

//             alert(
//                 `הגלריה נוצרה בהצלחה! סיסמת הלקוחה היא: ${clientPassword}`
//             );

//             navigate(`/gallery/${newGallery._id}`);
//         } catch (error) {
//             console.error(
//                 'שגיאה ביצירת הגלריה:',
//                 error.response?.data || error.message
//             );

//             alert(
//                 error.response?.data?.message ||
//                 'שגיאה ביצירת הגלריה'
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="create-gallery-page">
//             <header className="create-gallery-header">
//                 <h2>יצירת גלריה חדשה ללקוחה</h2>
//                 <p>
//                     מלאי את פרטי הלקוחה והעלי את התמונות לגלריה.
//                 </p>
//             </header>

//             <div className="create-gallery-card">
//                 <form
//                     onSubmit={handleSubmit}
//                     className="create-gallery-form"
//                 >
//                     <div className="create-gallery-field">
//                         <label htmlFor="clientName">
//                             שם הלקוחה:
//                         </label>

//                         <input
//                             id="clientName"
//                             type="text"
//                             value={clientName}
//                             onChange={(e) =>
//                                 setClientName(e.target.value)
//                             }
//                             required
//                         />
//                     </div>

//                     <div className="create-gallery-field">
//                         <label htmlFor="clientEmail">
//                             אימייל הלקוחה:
//                         </label>

//                         <input
//                             id="clientEmail"
//                             type="email"
//                             value={clientEmail}
//                             onChange={(e) =>
//                                 setClientEmail(e.target.value)
//                             }
//                             required
//                         />
//                     </div>

//                     <div className="create-gallery-field">
//                         <label htmlFor="maxSelections">
//                             מספר בחירות מקסימלי ללקוחה:
//                         </label>

//                         <input
//                             id="maxSelections"
//                             type="number"
//                             value={maxSelections}
//                             onChange={(e) =>
//                                 setMaxSelections(e.target.value)
//                             }
//                             required
//                         />
//                     </div>

//                     <div className="create-gallery-field">
//                         <label htmlFor="galleryImages">
//                             צרפי תמונות לגלריה:
//                         </label>

//                         <input
//                             id="galleryImages"
//                             className="create-gallery-file-input"
//                             type="file"
//                             multiple
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             required
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="create-gallery-submit"
//                     >
//                         {loading ? 'יוצר גלריה...' : 'צור גלריה'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateGallery;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateGallery.css';
import { API_URL } from '../config';

const CreateGallery = () => {
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [maxSelections, setMaxSelections] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // טיפול בבחירת הקבצים מהמחשב
    const handleFileChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    // שליחת הטופס לשרת ליצירת הגלריה
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !clientName ||
            !clientEmail ||
            maxSelections === '' ||
            images.length === 0
        ) {
            alert('נא למלא את כל שדות החובה ולצרף תמונות');
            return;
        }

        const formData = new FormData();
        formData.append('clientName', clientName);
        formData.append('clientEmail', clientEmail);
        formData.append('maxSelections', maxSelections);

        // הוספת התמונות תחת השם images
        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            setLoading(true);

            const token = localStorage.getItem('photographerToken');

            const response = await axios.post(
                `${API_URL}/galleries`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const { newGallery, clientPassword } = response.data;

            alert(
                `הגלריה נוצרה בהצלחה! סיסמת הלקוחה היא: ${clientPassword}`
            );

            navigate(`/gallery/${newGallery._id}`);
        } catch (error) {
            console.error(
                'שגיאה ביצירת הגלריה:',
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                'שגיאה ביצירת הגלריה'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-gallery-page">
            <header className="create-gallery-header">
                <h2>יצירת גלריה חדשה ללקוחה</h2>
                <p>
                    מלאי את פרטי הלקוחה והעלי את התמונות לגלריה.
                </p>
            </header>

            <div className="create-gallery-card">
                <form
                    onSubmit={handleSubmit}
                    className="create-gallery-form"
                >
                    <div className="create-gallery-field">
                        <label htmlFor="clientName">
                            שם הלקוחה:
                        </label>

                        <input
                            id="clientName"
                            type="text"
                            value={clientName}
                            onChange={(e) =>
                                setClientName(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="create-gallery-field">
                        <label htmlFor="clientEmail">
                            אימייל הלקוחה:
                        </label>

                        <input
                            id="clientEmail"
                            type="email"
                            value={clientEmail}
                            onChange={(e) =>
                                setClientEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="create-gallery-field">
                        <label htmlFor="maxSelections">
                            מספר בחירות מקסימלי ללקוחה:
                        </label>

                        <input
                            id="maxSelections"
                            type="number"
                            value={maxSelections}
                            onChange={(e) =>
                                setMaxSelections(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="create-gallery-field">
                        <label htmlFor="galleryImages">
                            צרפי תמונות לגלריה:
                        </label>

                        <input
                            id="galleryImages"
                            className="create-gallery-file-input"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="create-gallery-submit"
                    >
                        {loading ? 'יוצר גלריה...' : 'צור גלריה'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGallery;

