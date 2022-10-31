// Use MUI htmlFor autocomplete and tabs
// Bootstrap htmlFor everything else
import React from 'react'
import { useEffect } from 'react'
import Geocode from "react-geocode"
import Navbar from '../components/Navbar'
import YelpSearch from '../components/YelpSearch'
import styles from '../styles/Search.module.css'

Geocode.setApiKey("AIzaSyAJbN4SHchsN1orl43lWy5fGb0AXMks-Qs");
const IP_INFO_TOKEN = "7c62390b3fc18d";



export default function Search() {
    let ENV, SEARCH_API_URI, DETAILS_API_URI;
    useEffect(() => {
        ENV = window.location.hostname === ("127.0.0.1" || 'localhost') ? 'dev' : 'prod';
        SEARCH_API_URI = ENV === 'dev' ? 'http://127.0.0.1:8081' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/search';
        DETAILS_API_URI =  ENV === 'dev' ? 'http://127.0.0.1:8080' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/details';
    })

    const [card, setCard] = React.useState(null);

    const showResults = async () => {
        let shops = await getShops();
        console.log(shops)
        if (!shops) return; 

        let table = document.querySelector('table'),
            th = document.querySelector('thead'),
            tb = document.querySelector('tbody'),
            tr, td, cell = null,
            noRecords = document.getElementById(styles.noRecords) || document.createElement('div');


        if (shops.length === 0) {
            table.innerHTML = ''
            let results = document.getElementById(styles.results);
            noRecords.innerText = 'No results available';
            noRecords.setAttribute('id', styles.noRecords);
            results.insertBefore(noRecords, results.firstChild);
            results.scrollIntoView();
            return;
        } else {
            noRecords.style.display = 'none';
            table.style.display = 'table';
        }

        if (!th) {    
            let th = table.createTHead(),
                tr = th.insertRow(),
                headers = ['No.', 'Image', 'Business Name', 'Rating', 'Distance (miles)'];
        
            for (let header of headers) {
                td = tr.insertCell();
                cell = document.createTextNode(header);
                td.addEventListener('click', sortTable);
                td.appendChild(cell);
            }
        }

        if (tb) tb.remove();
        tb = table.createTBody();
        for (let idx in shops) {
            const { id, image_url, name, rating, distance } = shops[idx];
            const tr = tb.insertRow();
            tr.addEventListener('click', async () => await openCard(id));
            let td = tr.insertCell();
            td.appendChild(document.createTextNode(`${parseInt(idx) + 1}`));
            td = tr.insertCell();
            const img = document.createElement('img');
            img.src = image_url;
            td.appendChild(img);
            td = tr.insertCell();
            td.appendChild(document.createTextNode(`${name}`));
            td = tr.insertCell();
            td.appendChild(document.createTextNode(`${rating}`));
            td = tr.insertCell();
            let miles = (parseFloat(distance) / 1609).toFixed(0);
            td.appendChild(document.createTextNode(`${miles}`));
        }

        table.scrollIntoView();

        return;
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
        if (missingInputs()) return null;

        const args = await getArgs();
        console.log(SEARCH_API_URI + '/search?' + new URLSearchParams(args));
        const response = await fetch(SEARCH_API_URI + '/search?' + new URLSearchParams(args), {mode: 'cors'});
        const shops = (await response.json()).businesses;
        return shops;
    }

    const missingInputs = () => {
        let requiredInputs = ["term", "radius", "location"],
            autodetect = document.querySelector('input[type="checkbox"]').checked;

        let missingInput, hasValue = false,
            tooltips = null;
        for (const [i, input] of requiredInputs.entries()) {
            tooltips = document.querySelectorAll(`span.${styles.tooltip}`);
            hasValue = !!(document.getElementById(input).value);
            if (!autodetect && !hasValue && !missingInput) {
                missingInput = true;
                tooltips[i].style.visibility = "visible";
            } else {
                tooltips[i].style.visibility = "hidden";
            }
        }

        return missingInput;
    }

    const getArgs = async () => {
        let form = document.querySelector('form');

        form = getData(form);

        let milesAsMeters = form.radius * 1609.34;
        milesAsMeters = milesAsMeters > 40000 ? 40000 : milesAsMeters;
        form.radius = parseInt(milesAsMeters);

        let latlng = await getLatLng(form.location);
        if (latlng) delete form.location

        form = latlng ? { ...form, ...latlng} : form;

        return form
    }

    function getData(form) {
        var formData = new FormData(form);
        return Object.fromEntries(formData)
    }

    const getLatLng = async () => {
        let autodetect = document.querySelector('input[type="checkbox"]').checked;
        let location, response, latlng = null;
        if (!autodetect) {
            location = document.getElementById('location').value;
            try {
                response = await Geocode.fromLatLng(location[0], location[1]);
                console.log(location, response)
            } catch (e) {
                console.error(e);
            }
            latlng = response.results[0].geometry.location;
            latlng = [latlng.lat(), latlng.lng()];
        } else {
            location = await getLocation();
            latlng = location.split(',').map(parseFloat);
        }
        latlng = {'latitude': latlng[0], 'longitude': latlng[1]};
        return latlng;
    }

    const getLocation = async () => {
        let location = null;
        try {
            let response = await fetch(`https://ipinfo.io/json?token=${IP_INFO_TOKEN}`);
            location = (await response.json()).loc;
            console.log(location, response)
        } catch (e) {
            console.error(e);
        }
        return location;
    }


    function clearFields() {
        document.getElementById('term').value = '';
        document.getElementById('radius').value = 10;
        document.getElementById('select').selectedIndex = 0;
        let location = document.getElementById('location');
        location.value = '';
        autodetect.checked = false;
        location.removeAttribute('disabled');
        document.querySelector('table').innerHTML = '';
        let card = document.getElementById('card');
        card.innerHTML = '';
        card.style.visibility = 'hidden';
    }

    function checkCheckbox() {
        console.log(`span.${styles.tooltip}:last-child`)
        let location = document.getElementById('location'),
            autodetect = document.getElementById('auto-detect');
        if (autodetect.checked) {
            location.value = "";
            location.setAttribute('disabled', 'disabled');
            document.querySelector(`span.${styles.tooltip}:last-child`).style.visibility = "hidden";
        } else {
            location.removeAttribute('disabled');
        }
    };

    return (
        <div className="ps-3 pe-3">
            <Navbar page="search" />
            <div className="ms-auto me-auto d-flex flex-column col-sm-8 col-md-6 align-items-center ms-3 me-3 mt-5" id={styles.form}>
                <div className="mt-4" id={styles.header}>
                    <h1>Business search</h1>
                </div>
                <div className='' id={styles.body}>
                    <form>
                        <label htmlFor="term"  className="">
                            Keyword<span>*</span>
                        </label>
                        < br />
                        <YelpSearch />
                        <span className={`${styles.tooltip} ${styles.top}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  className={`bi ${styles.biExclamationSquare}`} viewBox="0 0 16 16">
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                            </svg>
                            Please fill out this field.
                        </span>
                        < br />
                        <div className={styles.middle} id={styles.left}>
                            <label htmlFor="radius"  className="">
                                Distance
                            </label>
                            < br />
                            <input defaultValue="10" type="text" id="radius" name="radius" />
                        </div>
                        <div className={styles.middle} id={styles.right}>
                            <label htmlFor="category">Category<span>*</span></label>< br />
                            <select name="categories" id={styles.select}>
                                <option defaultValue="all">Default</option>
                                <option defaultValue="arts">Arts & Entertainment</option>
                                <option defaultValue="health">Health & Medical</option>
                                <option defaultValue="hotelstravel">Hotels & Travel</option>
                                <option defaultValue="food">Food</option>
                                <option defaultValue="professional">Professional Services</option>
                            </select>
                        </div>
                        < br />
                        <label htmlFor="location"  className="">Location<span>*</span>
                        </label>
                        <span className={`${styles.tooltip} ${styles.top}`} id={styles.distanceTooltip}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  className={`bi ${styles.biExclamationSquare}`} viewBox="0 0 16 16">
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                            </svg>
                            Please fill out this field.
                        </span>
                        < br />
                        <input type="text" name="location" id='location' />
                        <span className={`${styles.tooltip} ${styles.top}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  className={`bi ${styles.biExclamationSquare}`} viewBox="0 0 16 16">
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                            </svg>
                            Please fill out this field.
                        </span>
                    </form>
                    <label id={styles.autoDetect} htmlFor="auto-detect">
                        <input onChange={checkCheckbox} id="auto-detect" type="checkbox" /><span>Auto-detect my location</span>
                    </label>
                    <div className='container d-flex align-items-center justify-content-center'>
                        <button onClick={showResults} id={styles.submit} className={`btn btn-danger ${styles.button} me-4`}>Submit</button>
                        <button onClick={clearFields} id="clear"  className={`btn btn-primary ${styles.button}`}>Clear</button>
                    </div>
                </div>

            </div>
            <div id={styles.results}>
                <table id={styles.table}>
                </table>
            </div>

        </div>
    )
}