import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import CloseIcon from '@material-ui/icons/Close';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { NavLink} from "react-router-dom";

import ToDoApp from './todoApp';

const CustomMenuIcon = props => {
    return(
        <IconButton id="todoButton" style={{
                zIndex: '5',
                position: 'fixed',
                top: '2px',
                left: '25%',
                borderRadius: '50%',
                margin: 'auto auto',
                backgroundColor:'rgba(0,0,0,.5)',
                backdropFilter: 'saturate(500%) blur(80px)',
                border: '3px solid black'
            }}
            onClick={() => props.setDrawerOpen(!props.drawerOpen)} edge="start" color="inherit" aria-label="menu">
          <AssignmentTurnedInIcon style={{color:'white'}} fontSize="large"/>
        </IconButton>
    )
}


const CustomListItem = props => {
    return(
        <ListItem button onClick={() => props.setDrawerOpen(false)}>
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

// ToDoDrawer is the wrapper for the todo list. It handles putting the todo list
// on a sidebar drawer which can be opened with the CustomMenuIcon button always
// displayed at top of page. Drawer's open/closed state is held in state.
const ToDoDrawer = props => {

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const drawerWrapperStyles = {
      height: '100%',
      backgroundColor:'rgba(0,0,0,.2)',
      backdropFilter: 'saturate(180%) blur(20px)'
  }
  return (
        <React.Fragment>

              <CustomMenuIcon drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>

                  <div id="drawerWrapper" style={drawerWrapperStyles} role="presentation">

                      <CancelPresentationIcon onClick={() => setDrawerOpen(false)} style={{position: 'absolute', padding: '5px', cursor: 'pointer'}} />
                      <ToDoApp />

                  </div>

              </Drawer>

        </React.Fragment>
    );
}

export default ToDoDrawer;
