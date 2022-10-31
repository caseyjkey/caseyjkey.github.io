import React from 'react';
import styles from '../styles/Search.module.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default BusinessDetails() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    };

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
            console.log(styles.card);
        let card = document.getElementById(styles.card);
        card.innerHTML = '';
        let title = document.createElement('h3');
        let cell = document.createElement('div');
        let section, text, link, photo;

        title.innerText = details.name;
        cell.appendChild(title);
        cell.setAttribute('id', styles.title);
        card.appendChild(cell);
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
            card.appendChild(cell);
        }

        card.style.visibility = 'visible';
        card.scrollIntoView();
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Item One" {...a11yProps(0)} />
                <Tab label="Item Two" {...a11yProps(1)} />
                <Tab label="Item Three" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <div id={styles.card}>
                </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
                Item Two
            </TabPanel>
            <TabPanel value={value} index={2}>
                Item Three
            </TabPanel>
        </Box>
    );
}