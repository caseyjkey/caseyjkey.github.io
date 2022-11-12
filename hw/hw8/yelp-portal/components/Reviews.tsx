import React from 'react';
import styles from '../styles/Reviews.module.css';

export default function Reviews({ id }) {
    const [reviews, setReviews] = React.useState(null);

    const [REVIEWS_API_URI, setAPI] = React.useState('https://api-dot-next-yelp-shops.wl.r.appspot.com/reviews');
    React.useEffect(() => {
        let ENV = 'prod'; //["127.0.0.1", 'localhost'].some(url => window.location.hostname.includes(url)) ? 'dev' : 'prod';
        setAPI(ENV === 'dev' ? 'http://localhost:8081/reviews' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com/reviews');
    })

    React.useEffect(() => {
        if (id) {
            (async (id) => {
                const response = await fetch(REVIEWS_API_URI + '?' + new URLSearchParams({id: id}), {mode: 'cors'});
                const details = await response.json();
                let top3 = details.reviews.splice(0,3);
                setReviews(top3);
            })(id);
        }
    }, [id])
    if (!reviews) return (<></>);
    return (
        <div id={styles.reviews}>
            {reviews.map((review, idx) => (
                <div className={styles.review} key={idx}>
                    <div className={styles.name}>{review.user.name}</div>
                    <div className={styles.rating}>Rating: {review.rating}/5</div>
                    <div className={styles.text}>{review.text}</div>
                    <div className={styles.time}>{review.time_created.split()[0]}</div>
                </div>
            ))}
        </div>
    )
}