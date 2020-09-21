import React from 'react';
import Typography from '@material-ui/core/Typography';


// ImageComp displays images as divs with background images.
// Since we allow for drag drop of entire components, BUT DONT want
// the individual images inside the components to be dragged,
// we turn off their default behaviour of allowing themselves to be
// dragged with the draggable="false" property, and disallow dragover
// on them by implementing "dragover" method (html drap/drop api) where
// we preventDefault on them.
class ImageComp extends React.Component {
    constructor(props){
        super(props);
        //this.dragover = this.dragover.bind(this);
    }
    // dragover(event){
    //     //event.preventDefault()
    // };
    render(){
        return(
            <div
                draggable="false"
                onDragOver={this.dragover}
                style={ {
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${this.props.image})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100%', // using "cover" stretches the images in some cases, "100%" here refers to width(no 2nd number provided, so height="auto")
                } }>
            </div>
        )
    }
}

// ArticleComp components are flex items as well as flex containers that have flex children displayed
// vertically ( an image, a headline, and a text description of the article).
// They can be drag/dropped into a new order (using flexbox "order" property), so they
// implement html drag/drop api methods "dragstart", "dragover", "dragleave", and "drop"
class ArticleComp extends React.Component{
    constructor(props){
        super(props);
        this.dragstart = this.dragstart.bind(this);
        this.dragover = this.dragover.bind(this);
        this.drop = this.drop.bind(this);
		this.dragleave = this.dragleave.bind(this);
        this.animationHasEnded = this.animationHasEnded.bind(this);
        this.articleRef = React.createRef();
        this.state = { order: `${this.props.order}`, className: "article" };
    };
    // drag/drop api allows for transfering some info between dragged/dropped items,
    // using "event.dataTransfer", so when a component begins to be dragged, it saves its
    // id there, so that it can be retrieved by the article that it gets dropped onto.
    // ( so that they can swap flexbox "order" numbers).
    // dragstart also adds an event listener to this dragged article, because once the user drops
    // the dragged article onto another article, that other article will query the dom for the current
    // article (being dragged), then have it dispatch a "dropped" custom event that includes the other
    // article's flexbox order number.
    // To summarize: the dragged article passes its info using the "event.dataTranser" method,
    // and the other article passes its info back by dispatching a "dropped" event from the dragged article,
    // so that they can swap flexbox "order" properties.
    dragstart(event) {
        event.dataTransfer.setData("draggedItemId", this.articleRef.current.id);//event.target.id);
        const handler = (event) => {
            this.setState({ order: event.detail.savedOrder, className: "article" });
            this.articleRef.current.removeEventListener('dropped', handler, false);
        }
        this.articleRef.current.addEventListener('dropped', handler, false);
        // const target = event.target;
        // setTimeout(() => { target.style.display = 'none'}, 0);
    }
    // remove the default "no dragging here" icon using preventDefault, then add a red dotted border
    // to the item to show that dragging here is allowed.
    dragover(event){
		event.preventDefault();
		this.articleRef.current.style.border = '2px dotted red';
	 }
     // if user drags over an article, but doesnt drop it there, we need to remove its red dotted border,
     // and give it its original border back
	 dragleave(event){
		 this.articleRef.current.style.border = '2px solid black';
	 }
     // on drop, we need to..
     // 1. give this item its original border back (replacing red dotted border),
     // 2. get the id of the article being dragged onto this article,
     // 3. query the dom for the dragged article
     // 4. save off our current flexbox order so that after we change it, we can send the original id in the custom event
     // 5. set our state with our new flexbox order number/ re-render with it since state has changed.
     //    (also set our className to "article" as that causes the "pop in" animation to occur).
     // 6. dispatch the custom 'dropped' event on the dragged article, which it is also listening for,
     //    so that it can change its state/re-render.
    drop(event) {
        //event.preventDefault();
		this.articleRef.current.style.border = '2px solid black';
        const id = event.dataTransfer.getData("draggedItemId");
        const element = document.getElementById(id);
        const savedOrder = this.state.order;
        this.setState({ order: element.style.order, className: "article" });
        element.dispatchEvent(new CustomEvent('dropped', { bubbles: false, detail: { savedOrder } }));
    }
    // remove className so that className can be reapplied (& animation re-run) next time it is involved in swapping flexbox order
    animationHasEnded(){
        this.setState({ className: ""});
    }
    render(){
        const articleStyles = {
            display: 'flex',
			flex: '1',
			order: this.state.order, // saved as state so that component re-renders when it changes
			flexFlow: 'column nowrap',
			border: '2px solid black',
            justifyContent: 'center',
			alignItems: 'center',
			minWidth: '250px',
            maxWidth: '350px',
			height: '350px',
            borderRadius: '5px',
			backgroundColor: 'white',
            overflow: 'hidden', // keeps child image square corners from 'pointing out' over the rounded corners of this element
            margin: '10px'
        }
        const contentStyles = {
			justifyContent: 'center',
			maxHeight: '200px',
            padding: '5px 5px',
            backgroundColor: 'rgba(177, 196, 210, .3)'
		};
        return(
            <article
				ref={this.articleRef}
				id={this.props.order}
				className={this.state.className}
				draggable="true"
	            onAnimationEnd={this.animationHasEnded}
				onDragStart={this.dragstart}
				onDrop={this.drop}
				onDragOver={this.dragover}
				onDragLeave={this.dragleave}
				style={articleStyles}>

                    <ImageComp image={this.props.image} />

                    <Typography style={{padding: '0 5px'}}>
                        {this.props.headline}
                    </Typography>

	                <div style={contentStyles}>
                        <Typography variant="body2">
                            <i style={{cursor: 'pointer', padding: '5px'}} onClick={() => window.open(this.props.url)} className="far fa-newspaper fa-2x"></i>
                            {this.props.article}
                        </Typography>
                    </div>



            </article>
        )
    }
}

export default ArticleComp;
