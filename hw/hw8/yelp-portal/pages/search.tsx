// Use MUI htmlFor autocomplete and tabs
// Bootstrap htmlFor everything else
import React from 'react'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import YelpSearch from '../components/YelpSearch'
import BusinessCard from '../components/BusinessCard'
import styles from '../styles/Search.module.css'
import {Loader} from '@googlemaps/js-api-loader';

const IP_INFO_TOKEN = "7c62390b3fc18d";

export default function Search() {
    const [API_URI, setAPI] = React.useState('https://api-dot-next-yelp-shops.wl.r.appspot.com');
    useEffect(() => {
        let ENV = 'prod'; //["127.0.0.1", "localhost"].some((url) => window.location.hostname.includes(url)) ? 'dev' : 'prod';
        setAPI(ENV === 'dev' ? 'http://localhost:8081' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com');
    })

    const [card, setCard] = React.useState(null);
    const [shops, setShops] = React.useState(null);
    const table = React.useRef(null);
    const radiusInput = React.useRef(null);
    const [term, setTerm] = React.useState('');
    const [radius, setRadius] = React.useState(10);
    const [location, setLocation] = React.useState('');
    const [checked, setChecked] = React.useState(false); 
    const [select, setSelect] = React.useState("all");
    const [searched, setSearched] = React.useState(false);

    const showResults = async () => {
        let shops = await getShops();
        if (!!!shops) return false;
        setShops(await getShops());
    }

    let sorted = false;
    const sortTable = (event) => {
        let sortBy = event.target.innerText;
        if (sortBy.includes('Image')) return;

        let headerIdx = {
            'No.': 0,
            'Business Name': 2,
            'Rating': 3,
            'Distance (miles)': 4
        };
        let table, rows, switching, i, x, y, shouldSwitch;
        table = document.querySelector('table');
        switching = true;
        let sorter = sorted ? (a, b) => a > b : (a, b) => a < b;
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName('td')[headerIdx[sortBy]];
                y = rows[i + 1].getElementsByTagName('td')[headerIdx[sortBy]];
                let numbers = ['No.', 'Rating', 'Distance (miles)'];
                if (numbers.includes(sortBy)) {
                    if (sorter(parseFloat(x.innerHTML), parseFloat(y.innerHTML))) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (sorter(x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase())) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
        sorted = !sorted;
    } 

    const getShops = async () => {
        setRadius(parseFloat(radiusInput.current.value));
        if (missingInputs()) return null;
        setCard(null);

        const args = await getArgs();
        const response = await fetch(API_URI + '/search?' + new URLSearchParams(args), {mode: 'cors'});
        const shops = (await response.json()).businesses;
        return shops;
    }

    const missingInputs = () => {
        let requiredInputs = [term, radius, !checked ? location : true];
        
        if (requiredInputs.some((input) => !!!input))
            return true;

        return false;
    }

    const getArgs = async () => {
        let form = document.querySelector('form');

        let data = getData(form) as any;

        let milesAsMeters = radius * 1609.34;
        milesAsMeters = milesAsMeters > 40000 ? 40000 : milesAsMeters;
        data.radius = Math.trunc(milesAsMeters);

        let latlng = await getLatLng(location);
        delete data.location;
        data = {...data, ...latlng};

        return data
    }

    function getData(form) {
        var formData = new FormData(form);
        return Object.fromEntries(formData)
    }

    const getLatLng = async (location) => {
        let autodetect = checked;
        let coords, response, latlng = null;
        if (!autodetect) {
            try {
                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
                });
                let latlng = loader.load().then(async () => {
                    const google = window.google;
                    if(google.maps) {
                        const geocoder = new google.maps.Geocoder();    
                        response = await geocoder.geocode({address: location});
                        latlng = response.results[0].geometry.location;
                        latlng = [latlng.lat(), latlng.lng()];
                        latlng = {'latitude': latlng[0], 'longitude': latlng[1]};
                        return latlng;
                    }
                });
                return await latlng;
            } catch (e) {
                console.error(e);
                return location
            }
        } else {
            coords = (await getLocation()).split(',').map(parseFloat);
            latlng = {'latitude': coords[0], 'longitude': coords[1]};
            return latlng;
        }
    }

    const getLocation = async () => {
        let location = null;
        try {
            let response = await fetch(`https://ipinfo.io/json?token=${IP_INFO_TOKEN}`);
            location = (await response.json()).loc;
        } catch (e) {
            console.error(e);
        }
        return location;
    }


    function clearFields() {
        setTerm('');
        setRadius(10);
        setSelect("all");
        setLocation('');
        setChecked(true);
        setCard(false);
        setSearched(false);
        setShops(null);
    }

    function checkCheckbox() {
        setLocation('');
        setChecked(!checked);
    };

    return (
        <div className="ps-3 pe-3 pb-5">
            <Navbar page="search" />
            <div className="ms-auto me-auto d-flex flex-column col-sm-8 col-md-6 align-items-center ms-3 me-3 mt-5" id={styles.form}>
                <div className="my-4" id={styles.header}>
                    <h1>Business search</h1>
                </div>
                <div className='' id={styles.body}>
                    <form onSubmit={e => e.preventDefault()}>
                        <div className="row">
                            <label htmlFor="term"  className="">
                                Keyword<span>*</span>
                            </label>
                            < br />
                            <YelpSearch term={term} setTerm={setTerm} />
                        </div>
                        <div className={"row pt-4"}>
                            <div className="col-12 col-sm-12 col-md-6 pb-4">
                                <label htmlFor="radius"  className="p-0">
                                    Distance
                                </label>
                                <br />
                                <input required={!checked} className="w-100" type="text" id="radius" name="radius" ref={radiusInput} defaultValue="10" />
                            </div>
                            <div className="col-12 col-sm-12 col-md-5 pb-4">
                                <label htmlFor="category" className="">Category<span>*</span></label>
                                <br />
                                <select className="w-100" name="categories" id={styles.select} value={select} onChange={(evt) => setSelect(evt.target.value)}>
                                    <option value="all">Default</option>
                                    <option value="arts">Arts & Entertainment</option>
                                    <option value="health">Health & Medical</option>
                                    <option value="hotelstravel">Hotels & Travel</option>
                                    <option value="food">Food</option>
                                    <option value="professional">Professional Services</option>
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="location"  className="">Location<span>*</span>
                                </label>
                                < br />
                                <input required={!checked} className="w-100" type="text" name="location" id='location' value={location} disabled={checked} onChange={(evt) => setLocation(evt.target.value)} />
                            </div>
                        </div>
                    <label id={styles.autoDetect} htmlFor="auto-detect">
                        <input onChange={checkCheckbox} checked={checked} id="auto-detect" type="checkbox" /><span>Auto-detect my location</span>
                    </label>
                    <div className='container d-flex align-items-center justify-content-center'>
                        <button type="submit" onClick={showResults} id={styles.submit} className={`btn btn-danger ${styles.button} me-4`}>Submit</button>
                        <button type="button" onClick={clearFields} id="clear"  className={`btn btn-primary ${styles.button}`}>Clear</button>
                    </div>
                    </form>
                </div>

            </div>
            <div id={styles.results} >
                {card 
                    ? <BusinessCard id={card} setCard={setCard} />
                    : shops?.length 
                    ? (
                        <table ref={table} id={styles.table}>
                            <thead>
                                <tr>
                                    {['No.', 'Image', 'Business Name', 'Rating', 'Distance (miles)'].map((header, idx) => (
                                        <td key={idx} onClick={sortTable}>{header}</td>                        
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...shops].splice(0,10).map((shop, idx) => {
                                    const { id, image_url, name, rating, distance } = shop;
                                    const miles = (parseFloat(distance) / 1609).toFixed(0);
                                    return (
                                        <tr key={idx} onClick={() => setCard(id)}>
                                            <td>{idx + 1}</td>
                                            <td><img src={image_url}></img></td>
                                            <td>{name}</td>
                                            <td>{rating}</td>
                                            <td>{miles}</td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    ) : searched && <div id={styles.noRecords}>No results available</div>        
                }
            </div>
        </div>
    )
}