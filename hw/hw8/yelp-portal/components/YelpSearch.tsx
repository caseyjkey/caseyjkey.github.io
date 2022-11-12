import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import parse from 'autosuggest-highlight/parse'
import CircularProgress from '@mui/material/CircularProgress';
import styles from '../styles/Search.module.css'
import throttle from 'lodash.throttle';

const AUTOCOMPLETE_API_URI = 'https://api.yelp.com/v3/autocomplete';

interface ResultType {
    string;
}

const YelpSearch = ({term, setTerm}) => {
    let ENV, AUTOCOMPLETE_API_URI;
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly string[]>([]);
    const [open, setOpen] = React.useState(false);
    const loading = !!(open && !options.length && inputValue);

    if (typeof window !== 'undefined') {
        ENV = 'prod'; //window.location.hostname === "127.0.0.1" || 'localhost' ? 'dev' : 'prod';
        AUTOCOMPLETE_API_URI = ENV === 'dev' ? 'http://localhost:8081/autocomplete' : 'https://api-dot-next-yelp-shops.wl.r.appspot.com/autocomplete';
    }

    const memoFetch = React.useMemo(
        () => throttle( async (
                request: { term: string },
                callback: (results?: readonly string[]) => void,
            ) => {
                const response = await fetch(AUTOCOMPLETE_API_URI + '?' + new URLSearchParams(request), {mode: 'cors'});
                const details = await response.json();
                let results: string[] = details.categories.map((category) => category.title);
                results = results.concat(details.terms.map((term) => term.text));
                callback(results);
            },
            200,
            ), [AUTOCOMPLETE_API_URI]
    );

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(term ? [term] : []);
      return undefined;
    }

    memoFetch({ term: inputValue }, (results?: readonly string[]) => {
      if (active) {
        let newOptions: any = [];

        if (term) {
          newOptions = [term];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }
        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [term, inputValue, memoFetch]);

  return (
    <Autocomplete
        id={styles.search}
        filterOptions={(x) => x}
        options={options}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        loading={loading}
        loadingText={<CircularProgress id={styles.loading} color="inherit" size={"1.25em"} />}
        autoComplete
        freeSolo
        includeInputInList
        filterSelectedOptions
        value={term}
        onChange={(event: any, newValue: string | null) => {
            setOptions(newValue ? [newValue, ...options] : options);
            setTerm(newValue);
        }}
        onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            setTerm(newInputValue);
        }}
        renderInput={(params) => (
            <div ref={params.InputProps.ref}>
                <input required value={term} onChange={(evt) => setTerm(evt.target.value)} type="text" id={styles.search} name="term" {...params.inputProps} />
            </div>
        )}
        renderOption={(props, option) => {

            return (
                <li {...props}>
                    <Grid container alignItems="center">
                    <Grid item xs>
                        <span className={styles.option}>
                            {option}
                        </span>
                    </Grid>
                    </Grid>
                </li>
                );
        }}
    />
  );
};

export default YelpSearch