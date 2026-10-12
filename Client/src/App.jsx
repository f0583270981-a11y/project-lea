import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import GalleryView from "./galery/GalleryView";

import PhotographerDashboard from "./manger/PhotographerDashboard";
import CreateGallery from "./manger/CreateGallery";
import EditedGallery from "./manger/EditedGallery";
import Login from "./manger/Login";

import ClientSelections from "./galery/ClientSelections";
import PhotographerSelections from "./galery/PhotographerSelections";
import ProtectedRoute from "./ProtectedRoute";

function App() {
    return (
        <Router>
            <Routes>

                {/* גלריה של לקוחה - בלי Layout ובלי Navbar */}
                <Route
                    path="/client/gallery/:id"
                    element={<GalleryView mode="client" />}
                />

                {/* כל שאר האפליקציה */}
                <Route path="/" element={<Layout />}>

                    {/* דף הבית */}
                    <Route
                        index
                        element={
                            <div
                                style={{
                                    textAlign: "center",
                                    marginTop: "50px",
                                    fontFamily: "Arial, sans-serif"
                                }}
                            >
                                <h1>
                                    ברוכים הבאים למערכת הניהול והגלריות
                                </h1>

                                <p>
                                    בחרי קישור מתאים או היכנסי לגלריה האישית שלך דרך המייל.
                                </p>
                            </div>
                        }
                    />

                    {/* התחברות לצלמת */}
                    <Route
                        path="login"
                        element={<Login />}
                    />

                    {/* כל המסלולים של הצלמת דורשים התחברות */}
                    <Route element={<ProtectedRoute />}>

                        {/* גלריה במצב צלמת */}
                        <Route
                            path="gallery/:id"
                            element={<GalleryView mode="photographer" />}
                        />

                        {/* בחירות הלקוחה */}
                        <Route
                            path="gallery/:id/selections"
                            element={<ClientSelections />}
                        />

                        {/* התמונות שהצלמת בחרה */}
                        <Route
                            path="gallery/:id/photographer-selections"
                            element={<PhotographerSelections />}
                        />

                        {/* תמונות ערוכות */}
                        <Route
                            path="gallery/:id/edited"
                            element={<EditedGallery />}
                        />

                        {/* פאנל ניהול */}
                        <Route
                            path="admin"
                            element={<PhotographerDashboard />}
                        />

                        {/* יצירת גלריה */}
                        <Route
                            path="admin/create-gallery"
                            element={<CreateGallery />}
                        />

                    </Route>

                </Route>

            </Routes>
        </Router>
    );
}

export default App;