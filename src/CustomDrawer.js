import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import GridOnIcon from '@material-ui/icons/GridOn';
import GamesIcon from '@material-ui/icons/Games';
import LanguageIcon from '@material-ui/icons/Language';
import AppsIcon from '@material-ui/icons/Apps';
import CloseIcon from '@material-ui/icons/Close';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { NavLink} from "react-router-dom";

// this is the main menu icon, always available in upper left of page. It opens the CustomDrawer (side bar that displays all apps)
const CustomMenuIcon = props => {
    return(
        <IconButton id="mainMenuIcon" style={{
                zIndex: '5',
                position: 'fixed',
                top: '2px',
                left: '2%',
                borderRadius: '50%',
                margin: 'auto auto',
                backgroundColor:'rgba(0,0,0,.5)',
                backdropFilter: 'saturate(500%) blur(80px)',
                border: '3px solid black'
            }}
            /*
                clicking this button opens the drawer if it is closed (and closes it if it is open, but in my case the drawer obscures the button when open,
                so I provide the <CancelPresentationIcon /> within the CustomDrawer to close it.)
                this is accomplished by setting the drawerOpen boolean to NOT what is currently is, using "!props.drawerOpen"
            */
            onClick={() => props.setDrawerOpen(!props.drawerOpen)} edge="start" color="inherit" aria-label="menu">
          <AppsIcon style={{color:'white'}} fontSize="large"/>
        </IconButton>
    )
}

// these are the individual applications listed in the CustomDrawer sidebar.
const CustomListItem = props => {
    return(
        /*
        clicking any app listed (text or icon) should...
        1. close the sidebar with "props.setDrawerOpen(false)", and
        2. use NavLink component provided by react-router-dom to route to the chosen app.
        */
        <ListItem button onClick={() => props.setDrawerOpen(false)}> { /* step 1 (described above). Closes the sidebar. */}
            <ListItemIcon>
                <NavLink to={props.path} style={{ textDecoration: 'none', color: 'white' }}>
                    { props.icon }
                </NavLink>
            </ListItemIcon>

            <NavLink to={props.path} style={{ textDecoration: 'none', color: 'white' }}>
                <ListItemText primary={ props.text } secondary={ props.secondaryText }/>
            </NavLink>
        </ListItem>
    )
}

// this is the weather component, displayed at the bottom of the Custom Drawer sidebar.
// It displays info passed to it from parent (which was obtained by fetching data from openweathermap api)
const Weather = props => {
     const degreeIcon = String.fromCharCode(176);
     return(
         <List>
                { /* <ListItem>
                    <label for="zipCodeInput" style={{marginRight: '5px'}}>Enter Zip Code:</label>
                 <input type="text" name="zipCodeInput"/>
             </ListItem> */}
             <ListItem>
                 <ListItemText primary="Boulder, CO" />
                 <ListItemIcon>

                     {
                         props.weatherObject.icon ? <img src={`http://openweathermap.org/img/wn/${props.weatherObject.icon}@2x.png`} /> : "Loading..."
                     }

                 </ListItemIcon>

                     {
                         props.weatherObject.temp ?
                            <ListItemText primary={ props.weatherObject.temp + degreeIcon} secondary={props.weatherObject.description ? props.weatherObject.description : "Loading..." }/>
                        : "Loading..."
                     }

             </ListItem>
         </List>
     )
}

// CustomDrawer sidebar component, provided by Material-UI, but customized. I hold individual app info as objects in an array,
// then .map over the array in JSX, rendering each app info object as a CustomListItem.
const CustomDrawer = props => {

  // useState hook used to hold 'drawerOpen' boolean value, indicating weather the drawer sidebar is currently open or not.
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const padRight = { marginRight: '10px'};

  // the individual app info items, held as objects in an array.
  const appInfoList = [
      { path: "/", icon: <HomeIcon />, text: "Home", secondaryText: "for mobile/desktop" },
      { path: "/snake", icon: <GamesIcon />, text: "Snake Game", secondaryText: "for desktop" },
      { path: "/ttt", icon: <GridOnIcon />, text: "Tic Tac Toe", secondaryText: "for mobile/desktop" },
      { path: "/newsapp", icon: <LanguageIcon />, text: "News", secondaryText: "for desktop" },
      { path: "/newsappflex", icon: <LanguageIcon />, text: "News2", secondaryText: "for mobile/desktop" }
  ];

  const drawerWrapperStyles = {
      height: '100%',
      backgroundColor:'rgba(0,0,0,.2)',
      backdropFilter: 'saturate(180%) blur(20px)'
  }
  return (
        <React.Fragment>

              <CustomMenuIcon drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} >

                    {/*
                    a div is required here because if the "drawerWrapperStyles" styles are applied to the Drawer component above, then when the drawer is open
                    the whole screen is affected by the styles, not just the sidebar. (whole screen is blurred from "backdropFilter" style when drawer is open)
                    */}
                    <div id="drawerWrapper" style={drawerWrapperStyles} role="presentation">

                        <List style={{backgroundColor:'rgba(0,0,0,.3)'}}>
                            <ListItem >
                                <CancelPresentationIcon onClick={() => setDrawerOpen(false)} style={{position: 'absolute', padding: '5px', cursor: 'pointer'}} />
                                <Typography style={{margin: 'auto auto'}}>My Projects</Typography>
                            </ListItem>
                        </List>

                        <Divider />

                        <List> { appInfoList.map(appInfo => <CustomListItem {...appInfo} setDrawerOpen={setDrawerOpen} /> ) } </List>

                        <Divider />

                        <Weather weatherObject={props.weatherObject} />

                    </div>
              </Drawer>

        </React.Fragment>
    );
}

export default CustomDrawer;
