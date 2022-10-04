const ENV = window.location.hostname === "127.0.0.1" ? 'dev' : 'prod';
const SEARCH_API_URI = ENV === 'dev' ? 'http://127.0.0.1:8081' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/search';
const DETAILS_API_URI =  ENV === 'dev' ? 'http://127.0.0.1:8080' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/details';
const IP_INFO_TOKEN = "7c62390b3fc18d";

const showResults = async () => {
    let shops = await getShops();
    if (!shops) return; 

    let table = document.querySelector('table'),
        th = document.querySelector('thead'),
        tb = document.querySelector('tbody'),
        tr, td, cell = null;

    if (shops.length === 0) {
        table.innerHTML = ''
        tr = table.insertRow();
        td = tr.insertCell();
        td.appendChild(document.createTextNode('No record has been found'));
        td.style.height = '1em';
        table.style.marginTop = '50px';
        table.scrollIntoView();
        return;
    }

    if (!th) {    
        th = table.createTHead(),
        tr = th.insertRow(),
        headers = ['No.', 'Image', 'Business Name', 'Rating', 'Distance (miles)'];
    
        for (header of headers) {
            td = tr.insertCell();
            cell = document.createTextNode(header);
            td.addEventListener('click', sortTable);
            td.appendChild(cell);
        }
    }

    if (tb) tb.remove();
    tb = table.createTBody();
    for (idx in shops) {
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
        let miles = (parseFloat(distance) / 1609).toFixed(2);
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


const openCard = async (id) => {
    const response = await fetch(DETAILS_API_URI + '/details?' + new URLSearchParams({id: id}), {mode: 'cors'});
    const details = await response.json();
    console.log(details)

    let bodyDetails = ['hours', 'categories', 'location', 'display_phone', 'transactions', 'price', 'url', 'photos'];
    bodyDetails = Object.fromEntries(bodyDetails
        .filter(key => key in details && (Object.keys(details[key]).length || typeof details[key] == "boolean"))
        .map(key => [key, details[key]])
    );

    bodyDetails.location = bodyDetails.location.display_address.join(', ');
    bodyDetails.categories = bodyDetails.categories.map((obj) => obj.title).join(' | ');
    if (bodyDetails.hours)
        bodyDetails.hours = bodyDetails.hours[0].is_open_now ? 'Open Now' : 'Closed';
    if (bodyDetails.transactions)
        bodyDetails.transactions = bodyDetails.transactions.map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(', ');
    
    const renameKeys = (obj, newKeys) => {
        const keyValues = Object.keys(obj).map(key => {
            const newKey = newKeys[key] || key;
            return { [newKey]: obj[key] };
        });
        return Object.assign({}, ...keyValues);
    }
    let newKeys = {
            'hours': 'Status', 'categories': 'Category', 'display_phone': 'Phone Number',
            'location': 'Address', 'display_phone': 'Phone Number',
            'transactions': 'Transactions Supported', 'price': 'Price'
        };
    bodyDetails = renameKeys(bodyDetails, newKeys);

    let card = document.getElementById('card');
    card.innerHTML = '';
    let title = document.createElement('h3');
    let cell = document.createElement('div');
    let section, text, link, photo;

    title.innerText = details.name;
    cell.appendChild(title);
    cell.setAttribute('id', 'title');
    card.appendChild(cell);
    for (detail in bodyDetails) {
        cell = document.createElement('div');
        cell.setAttribute('id', detail);
        section = document.createElement('h3');
        text = document.createElement('p');

        if (detail === 'photos') {
            let item;
            for (const [i, url] of bodyDetails[detail].entries()) {
                text.innerText = 'Photo ' + (i + 1);
                photo = document.createElement('img');
                photo.setAttribute('src', url);
                item = document.createElement('div');
                item.appendChild(photo);
                item.appendChild(text);
                item.setAttribute('class', 'photo');
                cell.appendChild(item);
                text = document.createElement('p');
            }
        } else if (detail === 'url') {
            section.innerText = 'More Info';
            link = document.createElement('a');
            link.innerText = 'Yelp';
            link.setAttribute('href', bodyDetails[detail]);
            link.setAttribute('rel', 'noreferrer noopener');
            link.setAttribute('target', '_blank');
            cell.appendChild(section);
            cell.appendChild(link);
        } else {
            section.innerText = detail;
            text.innerText = bodyDetails[detail];
            if (detail === 'Status') 
                text.setAttribute('class', bodyDetails[detail] === 'Closed' ? 'closed' : 'open');
            cell.appendChild(section);
            cell.appendChild(text);
        }
        card.appendChild(cell);
    }

    card.style.visibility = 'visible';
    card.scrollIntoView();
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
    if (autodetect) {
        requiredInputs = [];
    }

    let missingInput, hasValue = false,
        tooltips = null;
    for (const [i, input] of requiredInputs.entries()) {
        tooltips = document.querySelectorAll('span.tooltip');
        hasValue = !!document.getElementById(input).value;
        if (!hasValue && !missingInput) {
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
    const geocoder = new google.maps.Geocoder();
    let autodetect = document.querySelector('input[type="checkbox"]').checked;
    let location, response, latlng = null;
    if (!autodetect) {
        location = document.getElementById('location').value;
        try {
            response = await geocoder.geocode({ address: location });
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
    let response = null;
    try {
        response = await fetch(`https://ipinfo.io/json?token=${IP_INFO_TOKEN}`);
    } catch (e) {
        console.error(e);
    }
    let location = await response.json();
    return location.loc;
}

let submitButton = document.getElementById('submit');
submitButton.addEventListener('click', showResults);

let clearButton = document.getElementById('clear');
clearButton.addEventListener('click', clearFields);

let autodetect = document.querySelector('input[type="checkbox"]');
autodetect.addEventListener('change', checkCheckbox);
checkCheckbox();


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
    let location = document.getElementById('location');
    if (autodetect.checked) {
        location.value = "";
        location.setAttribute('disabled', 'disabled');
        document.querySelector(`span.tooltip:last-child`).style.visibility = "hidden";
    } else {
        location.removeAttribute('disabled');
    }
};