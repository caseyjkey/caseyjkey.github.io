import React from 'react';
import styles from '../styles/Search.module.css';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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

export default function BusinessDetails({ id }) {
    const [value, setValue] = React.useState(0);
    const [details, setDetails] = React.useState(null);
    const [detailsContainer, setDetailsContainer] = React.useState(null);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    let ENV, DETAILS_API_URI;
    React.useEffect(() => {
        ENV = window.location.hostname === ("127.0.0.1" || 'localhost') ? 'dev' : 'prod';
        DETAILS_API_URI =  ENV === 'dev' ? 'http://127.0.0.1:8080' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/details';
    })

    React.useEffect(() => {
        if (id && detailsContainer) { 
            console.log("ID", id);
            console.log('con', detailsContainer);
            (async () => {
                let dt = await openCard(id);
                console.log('yoas', dt);
                console.log('dasd', detailsContainer)
                //detailsContainer.appendChild(dt);
                setDetails(dt);
            })();
            console.log("yeet", details);
            
        }
    }, [id])

    const openCard = async (id) => {
        const response = await fetch(DETAILS_API_URI + '/details?' + new URLSearchParams({id: id}), {mode: 'cors'});
        const details = await response.json();
        console.log(details)

        let bodyDetails = ['location', 'categories', 'display_phone', 'price', 'hours', 'url', 'photos'];
        bodyDetails = Object.fromEntries(bodyDetails
            .filter(key => key in details && (Object.keys(details[key]).length || typeof details[key] == "boolean"))
            .map(key => [key, details[key]])
        );

        bodyDetails.location = bodyDetails.location.display_address.join(', ');
        bodyDetails.categories = bodyDetails.categories.map((obj) => obj.title).join(' | ');
        if (bodyDetails.hours)
            bodyDetails.hours = bodyDetails.hours[0].is_open_now ? 'Open Now' : 'Closed';
        
        const renameKeys = (obj, newKeys) => {
            const keyValues = Object.keys(obj).map(key => {
                const newKey = newKeys[key] || key;
                return { [newKey]: obj[key] };
            });
            return Object.assign({}, ...keyValues);
        }
        let newKeys = {
                'location': 'Address','hours': 'Status', 'categories': 'Category',
                'display_phone': 'Phone Number', 'price': 'Price'
            };
        bodyDetails = renameKeys(bodyDetails, newKeys);
            console.log(styles.card);
        let card = document.getElementById(styles.card);
        //card.innerHTML = '';
        let title = document.getElementById(styles.cardTitle);
        let cell = document.createElement('div');
        let section, text, link, photo;

        title.innerText = details.name;
        cell.setAttribute('id', styles.title);

        let businessDetails = document.getElementById(styles.details);
        businessDetails.innerHTML = '';

        for (let detail in bodyDetails) {
            cell = document.createElement('div');
            cell.setAttribute('id', styles[detail] ? styles[detail] : detail);
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
                    item.setAttribute('class', styles.photo);
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
                    text.setAttribute('class', bodyDetails[detail] === 'Closed' ? styles.closed : styles.open);
                cell.appendChild(section);
                cell.appendChild(text);
            }
            businessDetails.appendChild(cell);
        }

        card.style.visibility = 'visible';
        card.scrollIntoView();

        return businessDetails;
    }


    return (
        <div id={styles.card}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            <h3 id={styles.cardTitle}></h3>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#ffd73f' }}>
                    <Tabs id={styles.tabs} value={value} onChange={handleChange} aria-label="business card menu" variant="scrollable" allowScrollButtonsMobile>
                        <StyledTab label="Business details" {...a11yProps(0)} />
                        <StyledTab label="Map location" {...a11yProps(1)} />
                        <StyledTab label="Reviews" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                <div ref={node => setDetailsContainer(node)}>
                        <div id={styles.details}></div>
                </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    Item Two
                </TabPanel>
                <TabPanel value={value} index={2}>
                    Item Three
                </TabPanel>
            </Box>
        </div>
    );
}