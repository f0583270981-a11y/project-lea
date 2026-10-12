
import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
    return (
        <div className="layout-container">
            {/* תפריט ניווט עליון */}
            <nav className="layout-navbar">
                <h2 className="layout-title">
                    מערכת גלריות
                </h2>

                <div className="layout-nav-links">
                    <Link
                        to="/"
                        className="layout-home-link"
                    >
                        דף הבית
                    </Link>

                    {localStorage.getItem("photographerToken") && (
                        <Link
                            to="/admin"
                            className="layout-admin-link"
                        >
                           ניהול תמונות הלקוחות
                        </Link>
                    )}
                </div>
            </nav>

            {/* אזור הצגת העמודים */}
            <main className="layout-content">
                <Outlet />
            </main>

            {/* תחתית העמוד */}
            <footer className="layout-footer">
              פותח על ידי נעמה פרידמן 2026©
            </footer>
        </div>
    );
};

export default Layout;
