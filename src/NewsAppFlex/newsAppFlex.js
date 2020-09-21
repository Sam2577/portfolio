import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import './App.css';

//import Logo from './logo';
import PhotoSlider from './photoSlider';
import ArticleComp from './articleComp';


// ArticleRoot holds all articles (wrapper). It aligns them in flexible rows using flexFlow: 'row wrap'
// the article data is passed to it (in props) as a content array, which it uses .map on to render articles.
// Dragging/Dropping of articles is based on their Flexbox 'order' property, which is given an initial
// value here but changes on drag/drop
class ArticleRoot extends React.Component {
    constructor(props){
        super(props);
    }
	componentDidMount(){
		let t1 = gsap.timeline({repeat: 0, delay: 0, repeatDelay: 1});
		t1.from('#articalRoot', {
			duration: 1,
			y: 500,
			ease: 'power1'
		});
	}
    render(){
        return (
            <div id="articalRoot"
				style={{
					display: 'flex',
                    justifyContent: 'center',
					flexFlow: 'row wrap',
					flex: '1 1 auto',
					alignContent: 'center',
					fontSize: '.8em',
                    margin: '10px'
				}}>
                 { this.props.content.map((item, i) => <ArticleComp key={i + 1} order={i + 1} {...item}/> ) }
            </div>
        )
    }
}

// content wrapper that displays its children vertially ('flexFlow: "column nowrap"'), and gives itself left/right margins.
class VerticalLayoutWrapper extends React.Component {
	render(){
		return (
			<div style={{ margin: '0 10%', display: 'flex', flex: '1', flexFlow: 'column nowrap'}}>{this.props.children}</div>
		)
	}
}

// NewsApp fetches articles from my AWS API Gateway/Lambda api, which itself fetches them from the New York Times API
// This way I can hide my API key on the AWS Lambda function associated with my API endpoint.
// fetches articles asyncronously using useEffect hook. Conditional rendering displays loading notification while
// articles are being fetched. Holds articles as state so we can re-render with them once received.
const NewsAppFlex = () => {

    const [state, setState] = useState([]);
    const [fetchError, setFetchError] = useState(false);

    useEffect( () => {

        fetch('https://zj7t9ky9c3.execute-api.us-west-1.amazonaws.com/prod')
        .then(response => response.json())
        .then(json => {
            //console.log('json:', json);
            setState(json.map( (item, i) => ( { id: `${i}`, image: item.img, headline: item.title, article: item.text, url: item.url } ) ) )
         })
        .catch(error => setFetchError(true) ); // if error occurs, set state accordingly so that component will re-render with error notification

    }, []); // [] = run on component mount only

    // if state array has no items, then either we are still loading or there was an error
    if (!state.length){
        if (fetchError){
            return <div><h1>Error Fetching Data, Refresh Page To Try Again</h1></div>
        }
        return <div><h1>Loading...</h1></div>
    }
    return(
		<React.Fragment>
			<VerticalLayoutWrapper>
				<PhotoSlider content={state} />
				<ArticleRoot content={state} />
			</VerticalLayoutWrapper>
		</React.Fragment>
	)
}

export default NewsAppFlex;
