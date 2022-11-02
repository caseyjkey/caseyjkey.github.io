import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import parse from 'autosuggest-highlight/parse'
import throttle from 'lodash.throttle';

// This key was created specifically for the demo in mui.com.
// You need to create a new one for your application.
const GOOGLE_MAPS_API_KEY = 'AIzaSyC3aviU6KHXAjoSnxcw6qbOhjnFctbxPkE';
const AUTOCOMPLETE_API_URI = 'https://api.yelp.com/v3/autocomplete';


function loadScript(src: string, position: HTMLElement | null, id: string) {
    if (!position) {
    return;
    }

    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('id', id);
    script.src = src;
    position.appendChild(script);
}

const autocompleteService = { current: null };

interface MainTextMatchedSubstrings {
    offset: number;
    length: number;
}
interface StructuredFormatting {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}
interface ResultType {
    string;
}

export default function YelpSearch() {
    let ENV, AUTOCOMPLETE_API_URI;
    const [value, setValue] = React.useState<string | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly string[]>([]);
    const loaded = React.useRef(false);

    if (typeof window !== 'undefined') {
        loaded.current = true;
        ENV = window.location.hostname === "127.0.0.1" || 'localhost' ? 'dev' : 'prod';
        AUTOCOMPLETE_API_URI = ENV === 'dev' ? 'http://localhost:8081/autocomplete' : 'https://us-central1-local-shop-finder-363403.cloudfunctions.net/search';
    }

    const memoFetch = React.useMemo(
        () => throttle( async (
                request: { text: string },
                callback: (results?: readonly string[]) => void,
            ) => {
                console.log(AUTOCOMPLETE_API_URI + '?' + new URLSearchParams(request));
                const response = await fetch(AUTOCOMPLETE_API_URI + '?' + new URLSearchParams(request), {mode: 'cors'});
                const details = await response.json();
                let results: string[] = details.categories.map((category) => category.title);
                results = results.concat(details.terms.map((term) => term.text));
                console.log(results);
                callback(results);
            },
            200,
            ),
        [],
    );

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    memoFetch({ text: inputValue }, (results?: readonly string[]) => {
      if (active) {
        let newOptions: readonly ResultType[] = [];

        if (value) {
          newOptions = [value];
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
  }, [value, inputValue, memoFetch]);

  return (
    <Autocomplete
        id="term"
        filterOptions={(x) => x}
        options={options}
        autoComplete
        freeSolo
        includeInputInList
        filterSelectedOptions
        value={value}
        onChange={(event: any, newValue: string | null) => {
            setOptions(newValue ? [newValue, ...options] : options);
            setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
        }}
        renderInput={(params) => (
            <div ref={params.InputProps.ref}>
                <input type="text" id="term" name="term" {...params.inputProps} />
            </div>
        )}
        renderOption={(props, option) => {

            return (
                <li {...props}>
                    <Grid container alignItems="center">
                    <Grid item xs>
                        <span>
                            {option}
                        </span>
                    </Grid>
                    </Grid>
                </li>
                );
        }}
    />
  );
}