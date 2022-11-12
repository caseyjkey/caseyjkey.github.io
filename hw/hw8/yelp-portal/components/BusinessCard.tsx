import React from 'react';
import styles from '../styles/Search.module.css';
import cardStyles from '../styles/Card.module.css';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Carousel from 'react-bootstrap/Carousel';
import Maps from './Map';
import Reviews from './Reviews';
import ReservationModal from './ReservationModal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: Object;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, sx, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={sx}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface StyledTabProps {
  label: string;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(() => ({
  '&.MuiTab-root': { minWidth: '15em'},
  '&.Mui-selected': {
    color: 'black',
  },
}));

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BusinessDetails({ id, setCard }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [value, setValue] = React.useState(0);
    const [details, setDetails] = React.useState(null);
    const [reservation, setReservation] = React.useState(false);
    const [transition, setTransition] = React.useState(false);
    const cancelReservation = () => {
        let reservations = JSON.parse(localStorage.getItem('reservations'));
        reservations = reservations.filter((obj) => obj.name !== details.name);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        window.alert("Reservation cancelled!");
        setReservation(false);
    }

    const cardRef = React.useRef(null);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const [DETAILS_API_URI, setAPI] = React.useState('https://api-dot-next-yelp-shops.wl.r.appspot.com');
    React.useEffect(() => {
        let ENV = 'prod'; //["127.0.0.1", "localhost"].some((url) => window.location.hostname.includes(url)) ? 'dev' : 'prod';
        setAPI(ENV === 'dev' ? 'http://localhost:8081' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com');
        //if (details.name) cardRef.current.scrollIntoView();
        if (details)
            setReservation(
                JSON.parse(localStorage.getItem('reservations') || '[]').some((item) => {
                    return item.name == details.name;
                })
            );
    })

    React.useEffect(() => {
        if (id)
            (async () => setDetails(await openCard(id)))();            
    }, [id])

    const openCard = async (id) => {
        const response = await fetch(DETAILS_API_URI + '/details?' + new URLSearchParams({id: id}), {mode: 'cors'});
        const details = await response.json();

        let keys = ['name', 'location', 'coordinates', 'categories', 'display_phone', 'price', 'hours', 'url', 'photos'];
        let bodyDetails = Object.fromEntries(keys
            .filter(key => key in details && (Object.keys(details[key]).length || typeof details[key] == "boolean"))
            .map(key => [key, details[key]])
        );

        bodyDetails.location = bodyDetails.location.display_address.join(', ');
        bodyDetails.categories = bodyDetails.categories.map((obj) => obj.title).join(' | ');
        if (bodyDetails.hours)
            bodyDetails.hours = bodyDetails.hours[0].is_open_now ? 'Open Now' : 'Closed';

        return bodyDetails;
    }

    if (!details) return (<></>);

    enum Details {
        location = "Address",
        categories = "Category",
        display_phone = "Phone Number",
        price = "Price",
        hours = "Status",
        url = "More Info"
    };
    
    return (
        <div id={styles.card} className="col-md-6 col-sm-8" ref={cardRef}>
            <svg onClick={() => setCard(false)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            <h3 id={styles.cardTitle}>{details.name}</h3>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#ffd73f' }}>
                    <Tabs id={styles.tabs} value={value} onChange={handleChange} aria-label="business card menu" variant="scrollable" allowScrollButtonsMobile>
                        <StyledTab label="Business details" {...a11yProps(0)} />
                        <StyledTab label="Map location" {...a11yProps(1)} />
                        <StyledTab label="Reviews" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0} sx={{p: 3}}>
                    <div id={styles.details}>
                        <div className="container">
                            <div className='row'>
                                {details.location ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.location}</h3>
                                        <p>
                                            {details.location}
                                        </p>
                                    </div> ) : ''}
                                {details.display_phone ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.display_phone}</h3>
                                        <p>
                                            {details.display_phone}
                                        </p>
                                    </div>
                                ) : '' }
                            </div>
                            <div className="row">
                                {details.hours ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.hours}</h3>
                                        <p className={details.hours === 'Closed' ? styles.closed : styles.open}>
                                            {details.hours}
                                        </p>
                                    </div>
                                ) : '' }
                                {details.categories ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.categories}</h3>
                                        <p>
                                            {details.categories}
                                        </p>
                                    </div>
                                ) : '' }
                            </div>
                            <div className='row'>
                                {details.price ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.price}</h3>
                                        <p>
                                            {details.price}
                                        </p>
                                    </div>
                                ) : '' }
                                {details.url ? (
                                    <div className="pt-3 col-12 col-sm-12 col-md-6">
                                        <h3>{Details.url}</h3>
                                        <a href={details.url} rel='noreferrer noopener' target='_blank'>
                                            Business details
                                        </a>
                                    </div>
                                ) : '' }
                            </div>
                        </div>
                        <div id={styles.reserve}>
                            <Button 
                                onClick={reservation ? cancelReservation : handleOpen} 
                                variant={reservation ? "primary" : "danger"}
                            >
                                {reservation ? ("Cancel Reservation") : ("Reserve Now")}
                            </Button>
                            <ReservationModal 
                                details={details} 
                                open={open} 
                                handleClose={handleClose} 
                                setButton={setReservation}
                            />
                        </div>
                        <div id={styles.socials}>
                            Share on:
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check ${details.name} on Yelp. ${details.url}`)}?url=${encodeURI(details.url)}`} target='_blank' rel='noopener noreferrer'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#1DA1F2" className="bi bi-twitter" viewBox="0 0 16 16">
                                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                                    </svg>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(details.url)}`} target='_blank' rel='noopener noreferrer'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#3b5998" viewBox="0 0 24 24">
                                        <path rx="3" ry="3" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                                    </svg>
                                </a>
                        </div>
                        <div id={styles.photos}>
                            <Carousel 
                                variant="dark" 
                                indicators={false} 
                                interval={transition ? 5000 : null}
                                onSelect={() => setTransition(true)}
                                onSlid={() => setTransition(true)}
                                onSlide={() => setTransition(true)}
                            >
                                {details.photos.map((url, i) => (
                                    <Carousel.Item key={i}>
                                        <img 
                                            className={`d-block ${styles.photo}`}
                                            src={url}
                                        /> 
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel value={value} index={1} sx={{p: 3}}>
                    <Maps lat={details.coordinates.latitude} lng={details.coordinates.longitude} />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <Reviews id={id} />
                </TabPanel>
            </Box>
        </div>
    );
}