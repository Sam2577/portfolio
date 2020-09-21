import React from 'react';
import { gsap } from 'gsap';
import Typography from '@material-ui/core/Typography';

// the PhotoSlider component is a 'slideshow' component to display photos/text, with buttons to slide to next/previous photos
class PhotoSlider extends React.Component {
    constructor(props){
        super(props);
        this.sliderRef = React.createRef();
        this.triggerSlideLeft = this.triggerSlideLeft.bind(this);
        this.triggerSlideRight = this.triggerSlideRight.bind(this);

        this.state = {
            photoIndex: 0 // index of currently displayed photo
        };
    }
    // slide component into screen from top on mount, using gsap
	componentDidMount(){
		let t1 = gsap.timeline({repeat: 0, delay: 0, repeatDelay: 1});
		t1.from('#photoSlider', {
			duration: 1,
			y: -500,
			ease: 'power1'
		});
	}
    // causes photo to slide left (handler for clicking "arrow right" icon)
    triggerSlideLeft(){
        // verify that the photo index is less than the index of the last item (cant slide left if photo is last photo)
        if (this.state.photoIndex < this.props.content.length - 1){

            const animationEndHandler = () => {                                 // 3. once slide left animation has ended...
                this.setState( (prevState) => {                                 // 4. set state to increment photo index (causes re-render with new photo), (do this in
                    return { photoIndex: prevState.photoIndex + 1 }             //    handler because we need to wait until slide animation has finished before changing photo)
                } );
                this.sliderRef.current.className = "popIn";                     // 5. the new photo will use the 'popIn' animation
                this.sliderRef.current.removeEventListener('animationend', animationEndHandler, false); // 6. make sure to remove the listener when done.
            }
            this.sliderRef.current.addEventListener('animationend', animationEndHandler, false);  // 1. listen for 'animationend' event on slider ref
            this.sliderRef.current.className = 'animateLeft';                                     // 2. animate slider ref to slide left
        }
    }
    // causes photo to slide right (handler for "arrow left" icon's onClick)
    triggerSlideRight(){
        // verify that the photo index is greater that zero (cant slide right if photo is first photo)
        if (this.state.photoIndex > 0){

            const animationEndHandler = () => {                                 // 3. once slide right animation has ended...
                this.setState( (prevState) => {                                 // 4. set state to decrement photo index (causes re-render with new photo), (do this in
                    return { photoIndex: prevState.photoIndex - 1 }             //    handler because we need to wait until slide animation has finished before changing photo)
                } );
                this.sliderRef.current.className = "popIn";                     // 5. the new photo will use the 'popIn' animation
                this.sliderRef.current.removeEventListener('animationend', animationEndHandler, false) // 6. make sure to remove the listener when done.
            }
            this.sliderRef.current.addEventListener('animationend', animationEndHandler, false);  // 1. listen for 'animationend' event on slider ref
            this.sliderRef.current.className = 'animateRight';                                    // 2. animate slider ref to slide right
        }
    }
    // creates the circles displayed under the slider photo, that tell user which photo they are on,
    // and react to clicks by taking user to photo associated with that circle. This could also be its own component.
	createBookmarkCircles(numCircles){
		const handleClick = (event) => {

            // each circle has a custom html data-attribute that holds it's index (which is also the index of the photo it is associated with)
			const id = Number(event.target.dataset.circleid); // get the index of the circle that was clicked on (aka its 'circleid' data-attribute)

			const animationEndHandler = () => {                                 // 3. once fadeOut animation has ended...
				this.setState( { photoIndex: id }  );                           // 4. set state for photo index to be equal to circleid index of circle that was clicked
                this.sliderRef.current.className = "popIn"                      // 5. the new photo will use the 'popIn' animation
				this.sliderRef.current.removeEventListener('animationend', animationEndHandler, false);
			}
			this.sliderRef.current.addEventListener('animationend', animationEndHandler, false); // 1. listen for 'animationend' event on slider ref
            this.sliderRef.current.className = 'fadeOut'                                         // 2. animate 'fadeOut' on slider ref
		}
        // create an array consisting of range of numbers (up to number given in 'numCircles' parameter), then iterate over them (over their indexes, tehcnically)
        // 1. if the index we are currently iterating over is equal to the current phot index, return a FILLED in circle
        // 2. else create a non-filled in circle
		return [...new Array(numCircles)].map(( _, index ) => {
			if (index == this.state.photoIndex){
				return(
                    <i
                        data-circleid={index}
                        className="fas fa-circle"
                        onClick={handleClick}
                        style={{cursor: 'pointer', color: 'white'}}>
                    </i>
                )
			}
			return(
                <i
                    data-circleid={index}
                    className="far fa-circle"
                    onClick={handleClick}
                    style={{cursor: 'pointer', color: 'white'}}>
                </i>
            )
		} );
	}
    render(){
        // create flex container to position its (less than 100% width) flex child in the center
        const sliderWrapperStyles = {
            display: 'flex',
            width: '100%',
            justifyContent: 'center'
        }
        const sliderStyles = {
            // position: 'relative': contain the absolutely positioned icons to this container. (position: 'absolute' would also
            // accomplish this, but then the articles below it dont recognize its space and move over it to the top of the page)
            position: 'relative',
            display: 'flex',
            flexFlow: 'column nowrap', // slider childre (photo element, text element) need to line up VERTICALLY
            width: '80%',              // give app margins
            minWidth: '250px',
            boxShadow: '3px 3px 10px rgba(0,0,0,.5)',
            border: '3px solid white',
			borderRadius: '10px',
            overflow: 'hidden', // keep the inner photo element from flowing out of this container
        }
        const photoContainerStyles = {
                display:'flex',
                alignItems: 'center',
                maxHeight: '250px'
                // "overflow: hidden" NOT set here because I allow  the image height to overflow here,
                // and let the parent element (id="slider") contain it. This, along with the text container having less than 1 opacity,
                // means the image can be slightly seen under the text container.
            }
		const buttonLeftStyles = {
            position: 'absolute', // position item independently of its siblings (but relative to slider since slider is 'position: relative')
            left: '5px',
			backdropFilter: 'saturate(180%) blur(20px)',
			backgroundColor: 'rgba(255,255,255,0.7)',
			borderRadius: '5px',
			border: '2px solid white',
			cursor: 'pointer',
			padding: '5px'
		}
		const buttonRightStyles = {
            position: 'absolute', // position item independently of its siblings (but relative to slider since slider is 'position: relative')
            right: '5px',
			backdropFilter: 'saturate(180%) blur(20px)',
			backgroundColor: 'rgba(255,255,255,0.7)',
			borderRadius: '5px',
			border: '2px solid white',
			cursor: 'pointer',
			padding: '5px'
		}
		const imgStyles = {
            width: '100%',
            height: 'auto'
        }
        const photoTextStyles = {
            display: 'flex',
            flexFlow: 'column nowrap',
            flex: '1 2 auto',
            padding: '10px',
            overflow: 'hidden',
            backgroundColor: 'rgba(177, 196, 210, .9)'
        }
        const articleIconStyles = {
            cursor: 'pointer',
            padding: '5px'
        }
        const bookmarCircleStyles = {
            display: 'flex',
            flexFlow: 'row wrap',
            flex: '0 1 auto',
            justifyContent: 'flex-start',
            opacity: '.5'
        }
        return (
            <div id="sliderWrapper" style={sliderWrapperStyles}>

                    <div id="slider" ref={this.sliderRef} style={sliderStyles} className="">

                            <div id="photoContainer" style={photoContainerStyles}>

                                    <i
                                        className="fas fa-chevron-left fa-2x"
                                        onClick={this.triggerSlideRight}
                                        style={buttonLeftStyles}>
                                    </i>

                                    <img
                                        src={this.props.content[this.state.photoIndex].image}
                                        draggable="false"
                                        style={imgStyles}
                                    />

                                    <i
                                        className="fas fa-chevron-right fa-2x"
                                        onClick={this.triggerSlideLeft}
                                        style={buttonRightStyles}>
                                    </i>
                            </div>

        					<div id="photoText" style={photoTextStyles}>

                                    <Typography>
                                        {this.props.content[this.state.photoIndex].headline}
                                    </Typography>

                                    <Typography variant="body2">

                                        <i
                                            style={articleIconStyles}
                                            onClick={() => window.open(this.props.content[this.state.photoIndex].url)}
                                            className="far fa-newspaper fa-2x">
                                        </i>

                                        {this.props.content[this.state.photoIndex].article}

                                    </Typography>

                                    <div style={bookmarCircleStyles}>
                                        { this.createBookmarkCircles(this.props.content.length) }
                                    </div>
        					</div>
                    </div>
            </div>
        )
    }
}

export default PhotoSlider;
