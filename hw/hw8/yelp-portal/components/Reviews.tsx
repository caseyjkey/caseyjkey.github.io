import React from 'react';
import styles from '../styles/Reviews.module.css';

export default function Reviews({ id }) {
    const [reviews, setReviews] = React.useState(null);

    let ENV, REVIEWS_API_URI;
    React.useEffect(() => {
        console.log(window.location.hostname);
        ENV = ["127.0.0.1", 'localhost'].some(url => window.location.hostname.includes(url)) ? 'dev' : 'prod';
        console.log(ENV)
        REVIEWS_API_URI = ENV === 'dev' ? 'http://localhost:8081/reviews' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/details';
    })

    React.useEffect(() => {
        if (id) {
            (async (id) => {
                console.log('fetch', REVIEWS_API_URI + '?' + new URLSearchParams(id));
                const response = await fetch(REVIEWS_API_URI + '?' + new URLSearchParams({id: id}), {mode: 'cors'});
                const details = await response.json();
                console.log("sent", details);
                let top3 = details.reviews.splice(0,3);
                console.log('top', top3)
                setReviews(top3);
                console.log(reviews);
            })(id);
            console.log('rev', reviews);
        }
    }, [id])
    if (!reviews) return (<></>);
    return (
        <div id={styles.reviews}>
            {reviews.map((review) => (
                <div className={styles.review}>
                    <div className={styles.name}>{review.user.name}</div>
                    <div className={styles.rating}>Rating: {review.rating}/5</div>
                    <div className={styles.text}>{review.text}</div>
                    <div className={styles.time}>{review.time_created.split()[0]}</div>
                </div>
            ))}
        </div>
    )
}