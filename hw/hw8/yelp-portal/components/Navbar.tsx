import React from "react";

export default function Navbar({ page }) {
    return (
        <nav className="navbar navbar-expand me-5">
            <div className="container-fluid">
                <div className="navbar-collapse collapse">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className={`nav-link btn ${page === 'search' ? 'active btn-outline' : ''}`} aria-current="page" href={page === 'search' ? '#' : '/search'}>Search</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link btn ${page === 'bookings' ? 'active btn-outline' : ''}`} href={page === 'bookings' ? '#' : '/bookings'}>My Bookings</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}