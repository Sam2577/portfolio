import React, {useState} from 'react';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import GitHubIcon from '@material-ui/icons/GitHub';

import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { Route, NavLink, HashRouter } from "react-router-dom";

// landingPage.js is the default dynamic content (route) in the Single Page App

export const theme = createMuiTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#CCD9E1',  //#322f20',
      // dark: will be calculated from palette.primary.main,
      //contrastText: '#ffffff'
    },
    secondary: {
      //light: '#988f2a',
      main: '#B1C4D2,' //'#988f2a',
      // dark: will be calculated from palette.secondary.main,
     // contrastText: '#fffff',
    },
    text: {
        primary: '#ffffff',
        secondary: '#000000'
    },
    background: {
        default: '#CCD9E1',
        paper: 'rgba(255,255,255, .4)' //'#CCD9E1'
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      "Cinzel",
      'Roboto',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    }
});

export const useStyles = makeStyles(() => ({ // makeStyles takes 'theme' by default (I removed it)
  icon: {
    marginRight: theme.spacing(2),
  },
  buttonBg: {
      backgroundColor: theme.palette.background.paper
  },
  heroContent: {
    //backgroundColor: theme.palette.background.paper,
    backgroundImage: 'url("hero4.png")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    height: '70vh',
    padding: theme.spacing(8, 0, 6),
  },
  hero2: {
    //backgroundColor: theme.palette.background.paper,
    backgroundImage: 'url("d1.svg")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    height: '70vh',
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '100%',
    height: '100%',
    width: 'auto'
  },
  cardContent: {
    backgroundColor: theme.palette.background.paper,
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  },
}));

const cards = [
    {
        id: 1,
        title: 'A Snake Game',
        description: `Made using React/Redux. Similar to the classic snake game, but I added some extra abilities. Multiple levels included.`,
        image: "snake.jpg",
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/Snake",
        buttonType: 'demoLink',
        demoLink:  "/snake"
    },
    {
        id: 2,
        title: 'News Site',
        description: `A news site made with React and CSS grid. The front end calls my REST api (using AWS API Gateway/Lambda function),
            and my API calls New York Times' API (in order to hide my api key from client side code)`,
        image: "theNews.jpg",
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/NewsApp",
        buttonType: 'demoLink',
        demoLink:  "/newsapp"
    },
    {
        id: 3,
        title: 'Tic Tac Toe',
        description: `Classic Tic Tac Toe. The computer chooses its next move by calling my REST API (hosted on AWS API Gateway/Lambda),
            which runs the minimax algorithm and returns its next move. Made with React.`,
        image: 'ticTacToe.png',
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/ttt",
        buttonType: 'demoLink',
        demoLink:  "/ttt"
    },
    {
        id: 4,
        title: 'News site 2',
        description: `A news site using Flexbox to allow for a mobile UI. On desktop, articles can be re-arranged using drag and drop. Includes custom image slideshow component.
            The front end calls my REST api (hosted on AWS API Gateway/Lambda function), and my API calls New York Times' API (in order to hide my api key from client side code)`,
        image: 'theNews2.jpg',
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/NewsAppFlex",
        buttonType: 'demoLink',
        demoLink:  "/newsappflex"
    },
    {
        id: 5,
        title: 'To Do',
        description: `Made with React. Text Input is in a "2-way data bind" with its display, so that display and state are alway in synch
            (characters show up in display as they are typed in the input field), and results are saved to local storage, so
            that the to do list persists as long as the browser history is not cleared.`,
        image: 'todo.jpg',
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/ttt",
        buttonType: 'handler',
        handler:  () => document.getElementById('todoButton').click()
    },
    {
        id: 6,
        title: 'Weather Component',
        description: `Calls openweathermap's API to get the temperature for Boulder, CO (returned in kelvin, which I translate to fahrenheit), a weather description, and an icon.
            I display these in the App Drawer component.` ,
        image: 'weather.jpg',
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/NewsAppFlex",
        buttonType: 'handler',
        handler: () => document.getElementById('mainMenuIcon').click()
    },
    {
        id: 7,
        title: 'Home Page',
        description: `(This page). Made with Material UI, but customized. I created a Menu Button/Menu component, "to do" button/component,
         and a "JoeSam" logo I made using greensock gsap animation that 'flies' onto the top of the page on page load (then 'flies' away). I also
         added some designs/art I made in Adobe Illustrator as two fixed backgrounds (one at top of page and other at the bottom)`,
        image: 'home.jpg',
        codeLink: "https://github.com/Sam2577/portfolio/tree/master/NewsAppFlex",
        buttonType: 'demoLink',
        demoLink: "/"
    }
];

const RaisedCard = (props) => {

    const [shadow, setShadow] = useState(0);

    return (
      <Card
        className={ props.classinfo }
        onMouseOver={ () => setShadow(10) }
        onMouseOut={ () => setShadow(0)}
        elevation={ shadow }>

            { props.children }

      </Card>
    );

}


const ContentCards = ({ classes }) => {
    return(
        cards.map((card) => (
          <Grid item key={card.id} xs={12} sm={6} md={4}>

            <RaisedCard classinfo={classes.card}>

              <CardMedia
                className={classes.cardMedia}
                image={ card.image }

            
              />
              <CardContent className={classes.cardContent}>
                <Typography color="textSecondary" gutterBottom variant="h5" component="h2">

                  {card.title}

                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>

                  {card.description}

                </Typography>
              </CardContent>

              <CardActions className={classes.cardContent}>


                {
                    card.buttonType === 'demoLink' ? // if card.buttonType is 'demoLink', render a Button with an href value (a local route)

                        <Button size="small" className={classes.buttonBg}>
                          <Typography> <NavLink to={card.demoLink} style={{textDecoration: 'none', color: 'black'}}>

                              View Demo</NavLink>

                          </Typography>
                        </Button>

                    : // if card.buttonType is NOT 'demoLink' (it is therefore 'handler'), render a Button with an onClick handler

                          <Button size="small" className={classes.buttonBg}>
                            <Typography onClick={card.handler} style={{textDecoration: 'none', color: 'black'}}>

                                View Demo

                            </Typography>
                          </Button>

                }

                <Button size="small" className={classes.buttonBg} href={card.codeLink} target="_blank">
                  <Typography color="textSecondary">

                      View Code

                      </Typography>
                </Button>

              </CardActions>

            </RaisedCard>

          </Grid>
        ))
    )

}

const LandingPage = () => {

    const classes = useStyles();

    return(
        <main>

              <div className={classes.heroContent}>

                    <Container maxWidth="xl">

                          <Typography component="h1" variant="h2" align="left" gutterBottom>

                            Joseph Samuel Walsh

                          </Typography>

                          <Typography variant="h5" align="left" paragraph>

                            A collection of my projects.

                          </Typography>

                          <div className={classes.heroButtons}>
                                <Grid container spacing={2} justify="left">
                                      <Grid item>
                                            <Button className={classes.buttonBg} style={{color: 'black'}} variant="outlined" href={"https://github.com/Sam2577/portfolio"} target="_blank">

                                              View My Github Account

                                            </Button>
                                      </Grid>

                               </Grid>
                          </div>

                    </Container>
              </div>


              <Container className={classes.cardGrid} maxWidth="md">
                    <Grid container spacing={4}>

                        <ContentCards classes={classes}/>

                    </Grid>
              </Container>

              <div className={classes.hero2}>
                    <Container maxWidth="xl">
                          <Typography component="h1" variant="h2" align="left" color="textPrimary" gutterBottom>

                          </Typography>
                          <Typography variant="h5" align="left" color="textSecondary" paragraph>

                          </Typography>
                    </Container>
              </div>
      </main>
    )

}
export default LandingPage;
