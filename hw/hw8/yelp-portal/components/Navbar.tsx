import React from "react";

export default function Navbar({ page }) {
    return (
        <nav className="navbar navbar-expand me-5">
            <div className="container-fluid">
                <div className="navbar-collapse collapse">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className={`nav-link btn btn-outline ${page === 'search' ? 'active' : ''}`} aria-current="page" href={page === 'search' ? '#' : '/search'}>Search</a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${page === 'bookings' ? 'active' : ''}`} href={page === 'bookings' ? '#' : '/bookings'}>Bookings</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}