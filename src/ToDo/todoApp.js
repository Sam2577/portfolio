import React from 'react';

const ToDoHeader = () => {
	const wrapperStyles = {
		display: 'flex',
		border: '2px solid white',
		boxShadow: '3px 4px 4px black',
		width: '100%',
	}
	const leftPaneStyles = {
		flex: '1',
		backgroundColor: 'lightgreen',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '5px'
	}
	const rightPaneStyles = {
		display: 'flex',
		flexFlow: 'column nowrap',
		margin: '0 20px'
	}
	const mainTextStyles = {
		margin: '0 auto',
		fontWeight: 'bold',
		color: 'black',
		fontFamily: "'Permanent Marker', cursive, sans-serif",
		fontSize: '2em'
	}
	const subtextStyles = {
		fontFamily: "sans-serif",
		fontSize: '.7em'
	}
	return(
		<section id='todoHeader' style={wrapperStyles}>

			<div id="todoLeftPane" style={leftPaneStyles}>
					<i className="far fa-check-square fa-4x"></i>
			</div>

			<div id="todoRightPane" style={rightPaneStyles}>
					<div style={mainTextStyles}> To Do </div>
					<div style={subtextStyles}> clearing browser history clears list </div>
			</div>

		</section>
	)

}

const ToDoForm = props => {

	const todoFormStyles = {
		width: '100%',
		display: 'flex',
		flexFlow: 'column nowrap',
		alignItems: 'center'
	}
	const submitButtonStyles = {
		borderRadius: '2px',
		border: '1px solid gray',
		width: '100%',
		padding: '10px',
		margin: '5px'
	}
	const inputRefStyles = {
		boxSizing: 'border-box',
		borderRadius: '2px',
		border: '1px solid gray',
		width: '100%',
		padding: '10px',
		margin: '10px'
	}
	// input element is kept in a 2-way data bind with state (state.currentText)
	// by setting it's value property to that state, and including the onChange
	// property that points to a handler from the same scope as state, which sets
	// the state to the same value as the input value.
	return(
			<form onSubmit={props.handleSubmit} style={todoFormStyles}>

				<input ref={props.inputRef}
					value={props.currentText}
					onChange={props.handleOnChange}
					style={inputRefStyles}
					placeholder='Enter Something To Do...'>
				</input>

				<button type='submit' style={submitButtonStyles}>Add Task</button>

			</form>
	)
}

// the current todo item display is kept in a 2-way data bind by (in addition to
// the state/input element bind described above) setting its displayed value equal
// to the current state (state.currentText, passed down as props.currentText).
const ToDoTextElement = (props) => {
	const theStyle = {
		position: 'relative',
		fontFamily: "'Permanent Marker', cursive, sans-serif",
		borderBottom: '1px dotted #ccc',
		width: '100%',
		fontSize: '1em',
		color: 'black'
	}
	const iconStyles = {
		padding: '5px',
		marginRight: '10px'
	}
	// done button is included for all items already in the state.todo list,
	// but not for the current text item being created. This is determined by
	// passing in a props.displayDoneButton value for the current todo items.
	return(
		<div style={{display: 'flex'}}>

			<div style={theStyle}>
				<i style={iconStyles} class="far fa-check-square"></i>
				<div class="lines"></div>
				{props.currentText}
			</div>

			{
				props.displayDoneButton ?
					<button onClick={props.handleDoneButton}>
						done.
					</button>
			    : null
		  	}

		</div>
	)
}

const ToDoList = props => {
	const todoListStyles = {
		backgroundColor: '#f5f5f5',
		display: 'flex',
		flexFlow: 'column nowrap'
	}
	// current todo item (being typed in by user) is bound to state.currentText
	// and has no done button as it is not complete yet (no "displayDoneButton"
	// prop is passed to it).
	return(
		<section id="todoList" style={todoListStyles}>
			{
				props.todo.map( (itemText, index) => {
					return <ToDoTextElement
								key={index}
								id={`todo${index}`}
								displayDoneButton
								handleDoneButton={props.handleDoneButton}
								currentText={itemText}
							/>
					}
				)
			}
			<ToDoTextElement currentText={props.currentText} />
		</section>
	)
}

class ToDoApp extends React.Component {
	constructor(props){
		super(props);
		this.inputRef = React.createRef();
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
		this.handleDoneButton = this.handleDoneButton.bind(this);

		const initialToDo = window.localStorage.getItem('todo') ? JSON.parse(window.localStorage.getItem('todo')): [];
		this.state = { todo:  initialToDo, currentText: '' };
	}
	// handleOnChange sets current state to value currently held in the input
	// element, and is updated on every key press (because it is re-rendered since
	// state changes).
	handleOnChange(event){
		this.setState( { currentText: this.inputRef.current.value } );
	}
	// handleSubmit appends the current text item onto the saved todo list
	// (technically a complete overwrite of todo, not an append though)
	// that list is then set as a JSON parsable string value (JSON.stringify)
	// and saved to local storage. Finally, this updated todo is saved to state
	// (state.todo), and the currentText field is reset to blank/empty.
	handleSubmit(event){
		event.preventDefault();
		const newToDo = [...this.state.todo, this.state.currentText ];
		window.localStorage.setItem('todo', JSON.stringify(newToDo));
		this.setState({ currentText: '', todo: newToDo } );
	}
	componentDidMount(){
		this.inputRef.current.focus();
	}
	// handleDoneButton is passed to the todo list display, so that it has access
	// to resetting state without the item being removed (removing the item
	// by filtering it out). the updated todo list is saved to local state.todo
	// and local storage.
	handleDoneButton(event){
		const textToRemove = event.target.parentNode.children[0].textContent;
		const newToDo = this.state.todo.filter( todoItem => todoItem !== textToRemove);
		this.setState( { todo: newToDo } );
		window.localStorage.setItem('todo', JSON.stringify(newToDo));
	}
    render(){
		const wrapperStyles = {
			display: 'flex',
			flexFlow: 'column nowrap',
			padding: '10px',
			marginTop: '25px'
		}
        return(
            <div id="todoWrapper" style={wrapperStyles}>

				<ToDoHeader />

				<ToDoForm
					inputRef={this.inputRef}
					currentText={this.state.currentText}
					handleSubmit={this.handleSubmit}
					handleOnChange={this.handleOnChange}
				/>

				<ToDoList
					todo={this.state.todo}
					currentText={this.state.currentText}
					handleDoneButton={this.handleDoneButton}
				/>


			</div>
        )
    }
}

export default ToDoApp;
