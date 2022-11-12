import React from 'react'
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from 'react-bootstrap/Button';
import styles from '../styles/Search.module.css';


interface IReservation {
    name: string;
    email: string | boolean;
    date: string;
    time: string;
}

export default function ReservationModal({ open, handleClose, details, setButton }) {
    const [reservation, setReservation] = React.useState<IReservation>({
        name: details.name,
        email: '',
        date: '',
        time: ''
    });
    const [time, setTIme] = React.useState({hours: NaN, minutes: NaN});
    const [badForm, setBadForm] = React.useState(false); 
    
    function handleForm(evt) {
        console.log('form', reservation)
        evt.preventDefault();
        let [email, date, hours, minutes] = (Array.from(evt.target).map((field: any) => field.value));
        let name = details.name;
        let time = hours + ':' + minutes;
        setReservation({name, email, date, time});
        if (email && !validEmail(email)) {
            console.log('emai')
            setReservation({...reservation, email: false});
            return;
        }
        if (email && date && hours && minutes) {
            console.log('yo', reservation)
            setBadForm(false);
            let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
            reservations.push({name, email, date, time});
            localStorage.setItem('reservations', JSON.stringify(reservations));
            setButton(true);
            window.alert('Reservation created!');
            handleClose();
        } else {
            setBadForm(true);
        }
    }

    function validEmail(email: string): boolean {
        let re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    return (
        <Modal 
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            className="ms-3 me-3"
        >
            <Box id={styles.modal} className="col-md-5">
                <h2 id="parent-modal-title">Reservation form</h2>
                <h3 id="parent-modal-description">{details.name}</h3>
                <form onSubmit={handleForm}>
                    <label htmlFor="email">Email</label>
                    <div id={styles.date} className={`input-group d-flex ${((badForm && !reservation.email) || reservation.email === false) ? styles.error : ''}`}>
                        <input 
                            
                            type="text" 
                            id="email"
                            className={`${((badForm && !reservation.email) || reservation.email === false) ? `border-end-0 ${styles.error}` : ''}`}
                        >
                        </input>
                        {((badForm && !reservation.email) || reservation.email === false) && 
                            <span className={`input-group-text bg-transparent ${badForm ? styles.error : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                                </svg>
                            </span>
                        }
                    </div>
                    {((badForm && !reservation.email) && reservation.email !== false) && 
                        <span className={styles.error}>Email is required</span>
                    }
                    {reservation.email === false &&
                        <span className={styles.error}>Email must be a valid email address</span>
                    }


                    <label htmlFor="date">Date</label>
                    <div id={styles.date} className={`input-group d-flex ${badForm ? styles.error : ''}`}>
                        <input 
                            type="date" 
                            id="date"
                            min={new Date().toISOString().split('T')[0]}
                            className={`${badForm && !reservation.date ? `border-end-0 ${styles.error}` : ''}`}
                            
                        ></input>
                        {badForm && !reservation.date && 
                            <span className={`input-group-text bg-transparent ${badForm ? styles.error : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                                    </svg>
                            </span>
                        }
                    </div>
                    {badForm && !reservation.date && 
                        <span className={styles.error}>{badForm} {!reservation.date} Date is required</span>
                    }
                    <label htmlFor="hours">Time</label>
                    <div id={styles.time} className="d-flex">
                        <div id={styles.hours} className={`input-group d-flex ${badForm && !reservation.time ? styles.error : ''}`}>
                            <select  
                                id="hours"
                                name="hours"
                                className={`${badForm && !reservation.time.split(':')[0].length ? styles.error : ''}`}
                            >
                                <option value=""></option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                                <option value="13">13</option>
                                <option value="14">14</option>
                                <option value="15">15</option>
                                <option value="16">16</option>
                                <option value="17">17</option>
                            </select>
                            <span className={`${badForm && !reservation.time.split(':')[0].length ? styles.error : ''} input-group-text bg-transparent`}>
                            {badForm && !reservation.time.split(':')[0].length && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                                </svg>
                            )}
                            </span>
                        <span id={badForm && !reservation.time.split(':')[0].length ? styles.hourError : ''}>:</span>
                            <select name="minutes" className={`input-group d-flex ${styles.minutes} ${badForm && !reservation.time.split(':')[1].length ? styles.error : ''}`}>
                                <option value=""></option>
                                <option value="00">00</option>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="45">45</option>
                            </select>
                            <span className={`${styles.minutes} ${badForm && !reservation.time.split(':')[1].length ? styles.error : ''} input-group-text bg-transparent`}>
                            {badForm && !reservation.time.split(':')[1].length && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                                </svg>
                            )}
                            </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className={`${styles.clock} bi bi-clock`} id={badForm && !reservation.time.split(':')[1].length ? styles.clockError : ''} viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>

                        </div>
                    </div>
                    <Button type="submit" variant="danger">Submit</Button>
                </form>
                <div id={styles.footer}>
                    <Button variant="dark" onClick={handleClose}>Close</Button>
                </div>
            </Box>
        </Modal>
    );
}