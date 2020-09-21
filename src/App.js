// React
import React, {useState, useEffect} from 'react';
import { Route, NavLink, HashRouter } from "react-router-dom";

// Material-UI
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

// My Components
import Logo from './logo';
import CustomDrawer from './CustomDrawer';
import SnakeGame from './Snake/game.js';
import NewsApp from './NewsApp/newsApp';
import NewsAppFlex from './NewsAppFlex/newsAppFlex';
import TicTacToe from './ttt/ttt';
import LandingPage, { useStyles, theme } from './landingPage';
import ToDoDrawer from './ToDo/ToDo';

// CSS
import './index.css';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/Sam2577">
        JSW
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const App = () => {

  const classes = useStyles();
  const [ weatherObject, setWeatherObject ] = useState({});

  // useEffect hook fetches openweathermap data on mount
  useEffect( () => {

      const kelvinToFaren = kelvin => {
          return Math.trunc(((kelvin - 273.15) * (9 / 5) + 32 ));
      }
      // call my AWS API Gateway/Lambda weather API
      fetch('https://r36ewau9x9.execute-api.us-east-1.amazonaws.com/prod')
      .then(response => response.json() )
      .then(json => {
          // set state once weather data is received so that component will re-render with it
          setWeatherObject( {
                // ternary assignments just in case any data is not present in the returned json
                temp: json.body.main ? kelvinToFaren(Number(json.body.main.temp)) : '',
                description: json.body.weather ? json.body.weather[0].description : '',
                icon: json.body.weather ? json.body.weather[0].icon : ''
              }
          );
      })
    .catch(error => console.log('Error fetching news api data:', error) );
}, []); // empty dependency list so useEffect runs on mount only

  return (
    <React.Fragment>

     { /* <CssBaseline /> */ }

      <ThemeProvider theme={theme}>

            { /*  All react-router-dom <NavLink> and <Route> components need to exist in the <HashRouter>  */ }
            <HashRouter>

                { /* the "frame" of the Single Page App. These items stay static throughout all pages/routes */ }
                <CustomDrawer weatherObject={weatherObject}/>
                <ToDoDrawer />
                <Logo />
                <img style={{ position:'absolute', top:'5px', left: '45%', height: '60px', marginRight: '25px', zIndex: '3' }} src="robin.svg"/>


                { /*
                    the dynamic content of the Single Page App, determined by route (which user selects by clicking a <NavLink>
                    (which exist in the CustomDrawer (sidebar) component)
                */ }
                     <div id="mainContent" style={{display: 'flex', justifyContent: 'center', width: '100%', marginTop: '5%'}}>
                         <Route exact path="/" component={LandingPage}/>
                         <Route exact path="/newsapp" component={NewsApp}/>
                         <Route exact path="/newsappflex" component={NewsAppFlex}/>
                         <Route exact path="/snake" component={SnakeGame}/>
                         <Route exact path="/ttt" component={TicTacToe}/>
                     </div>

            </HashRouter>

              <footer className={classes.footer}>
                <Typography variant="h6" align="center" gutterBottom>
                  Joseph Samuel Walsh
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    Images on card components are from {' '}
                    <Link color="inherit" href="https://www.freepik.com/">
                      freepik.com
                    </Link>
                </Typography>
                <Copyright />
             </footer>

      </ThemeProvider>

    </React.Fragment>
  );
}

export default App;
