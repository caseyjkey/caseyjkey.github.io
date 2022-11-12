// Use MUI htmlFor autocomplete and tabs
// Bootstrap htmlFor everything else
import React from 'react'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import styles from '../styles/Bookings.module.css'

export default function Bookings() {
    let ENV, SEARCH_API_URI, DETAILS_API_URI;
    useEffect(() => {
        ENV = 'prod'; //window.location.hostname === ("127.0.0.1" || 'localhost') ? 'dev' : 'prod';
        SEARCH_API_URI = ENV === 'dev' ? 'http://localhost:8081' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com/search';
        DETAILS_API_URI =  ENV === 'dev' ? 'http://localhost:8081' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com/details';
    })

    const [reservations, setReservations] = React.useState([]);

    React.useEffect(() => {
        setReservations(
            JSON.parse(localStorage.getItem('reservations') || '[]')
        );
    }, []);
    const cancelReservation = (booking) => {
        let newReservations = reservations.filter((obj) => obj.name !== booking.name);
        localStorage.setItem('reservations', JSON.stringify(newReservations));
        setReservations(newReservations);
        window.alert("Reservation cancelled!")
    }

    return (
        <div className="ps-3 pe-3 pb-5">
            <Navbar page="bookings" />                
            {!reservations.length &&
                <div id={styles.noBookings} className="col-sm-1 col-lg-3">
                    No reservations to show
                </div>
            }
            {!!reservations.length && 
                <h3 className="pt-2 text-center">List of your reservations</h3>
            }
            <div id={styles.results} style={{display: reservations.length ? 'block' : 'none'}}>
                <table id={styles.table} style={{display: "table"}}>
                    <thead>
                        <tr>
                            <td>#</td>
                            <td>Business Name</td>
                            <td>Date</td>
                            <td>Time</td>
                            <td>E-mail</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                    {reservations && reservations.map((booking, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{booking.name}</td>
                            <td>{booking.date}</td>
                            <td>{booking.time}</td>
                            <td>{booking.email}</td>
                            <td onClick={() => cancelReservation(booking)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}