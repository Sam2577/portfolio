import React, { useState, useEffect, useRef } from 'react';
import './the.css';

// VerticalLayout is a wrapper, which exists only to display its children vertically (display: flex / flexFlow: 'column nowrap'),
// and to center those children horizontally and vertically ( alignItems: 'center', justifyContent: 'center')
const VerticalLayout = (props) => {
    const theStyle = {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center'
    }
    return(
        <div style={theStyle}>
            { props.children }
        </div>
    )
}

// article component that aligns its content vertically (using flexbox)
const RegularVertical = props => {
    const articleStyles = {
        fontSize: '15px',
        flex: '0 1 auto',
        color: 'black',
        margin: '10px',
        padding: '10px',
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
    const imgStyles = {
        flex: '0 1 auto',
        width: '200px',
        height: 'auto',
        boxShadow: '3px 3px 3px',
        border: '1px solid black'
    }
    const headlineStyles = {
        flex: '0 1 auto',
        fontSize: '20px',
        padding: '10px 0',
        borderTop:'1px solid black',
        margin: '10px'
    }
    const articleDescriptionStyles = {
        flex: '0 1 auto',
        padding: '5px'
    }
    const buttonWrapperStyles = {
        flex: '0 1 auto',
        padding: '5px',
        textDecoration: 'none',
        cursor: 'pointer'
    }
    return(
        <article style={articleStyles}>

            <img src={ props.image } style={imgStyles} />

            <span style={headlineStyles}>
                { props.headline }
            </span>

            <span style={articleDescriptionStyles}>
                {props.article}
            </span>

            <div onClick={() => window.open(props.url)} style={buttonWrapperStyles}>
                <button>Go To Article</button>
            </div>

        </article>
    )

}

// article component that holds its content vertically, but smaller than 'RegularVertical' component, and holds no picture
const SmallNoPic = props => {
    const articleStyles = {
        fontSize: '15px',
        flex: '0 1 auto',
        padding: '5px',
        color: 'black',
        margin: '5px',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
    const headlineStyles = {
        flex: '0 1 auto',
        padding: '5px 0',
        borderTop:'1px solid black'
    }
    const buttonWrapperStyles = {
        flex: '0 1 auto',
        padding: '5px',
        textDecoration: 'none',
        cursor: 'pointer'
    }
    return(
        <article style={articleStyles}>

            <span style={headlineStyles}>
                { props.headline }
            </span>

            <div onClick={() => window.open(props.url)} style={buttonWrapperStyles}>
                <button>Go To Article</button>
            </div>

        </article>
    )
}

// article component that holds its content vertically, and includes a picture.
const SmallWithPic = props => {
    const articleStyles = {
        fontSize: '15px',
        flex: '0 1 auto',
        padding: '5px',
        color: 'black',
        margin: '5px',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
    const imgStyles = {
        flex: '0 1 auto',
        width: '200px',
        height: 'auto',
        boxShadow: '3px 3px 3px'
    }
    const headlineStyles = {
        flex: '0 1 auto',
        padding: '5px 0'
    }
    const buttonWrapperStyles = {
        flex: '0 1 auto',
        padding: '5px',
        textDecoration: 'none',
        cursor: 'pointer'
    }
    return(
        <article style={articleStyles}>

            <img src={ props.image } style={imgStyles} />

            <span style={headlineStyles}>
                { props.headline }
            </span>

            <div onClick={() => window.open(props.url)} style={buttonWrapperStyles}>
                <button>Go To Article</button>
            </div>

        </article>
    )
}

// AWS API Gateway/Lambda GET request handler code (HIDES MY KEY FROM CLIENT SIDE CODE):
//
// const axios = require('axios');
// exports.handler = async (event) => {
//     let response = await axios.get('https://api.nytimes.com/svc/topstories/v2/home.json?api-key=[MY KEY HERE]');
//     return response.data.results.map( item => ( {
//             img: item.multimedia[0].url,
//             title: item.title,
//             text: item.abstract,
//             url: item.url
//         } )
//     );
// };


// NewsApp fetches articles from my AWS API Gateway/Lambda api, which itself fetches them from the New York Times API
// This way I can hide my API key on the AWS Lambda function associated with my API endpoint.
// Content display as a css grid (defined in associated "the.css" file)
const NewsApp = () => {

    const [content, setContent] = useState([]);
    const [fetchError, setFetchError] = useState(false);

    // useEffect hook fetches articles once component has mounted, asyncronously.
    useEffect( () => {
        fetch('https://zj7t9ky9c3.execute-api.us-west-1.amazonaws.com/prod')
        .then(response => response.json())
        .then(json => {

            setContent( json.map( (item, i) => (
                    {
                        id: `${i}`,
                        image: item.img,
                        headline: item.title,
                        article: item.text,
                        url: item.url
                    }
                ) )
            )
         })
        .catch(error => setFetchError(true));
    }, []); // empty dependency list, so runs on mount only


    if (!content.length){
        // if content array has no length, either the page is still loading or there was an error.
        if (fetchError){
            return <div><h1>Error Fetching Data, Refresh Page To Try Again</h1></div>
        }
        return <div><h1>Loading...</h1></div>
    }
    // content has a length (we have content)...
    return(
      <div className="wrapper">

          <div className="base a">
              <RegularVertical {...content[1]} />
          </div>

          <div className="base b">
              <VerticalLayout>
                  <SmallNoPic {...content[2]} />
                  <SmallNoPic {...content[10]} />
                  <SmallNoPic {...content[11]} />
                  <SmallNoPic {...content[12]} />
                  <SmallNoPic {...content[19]} />
              </VerticalLayout>
          </div>

          <div className="base c">
              <RegularVertical {...content[3]} />
          </div>

          <div className="base d">
              <SmallWithPic {...content[4]} />
          </div>

          <div className="base e">
              <RegularVertical {...content[5]} />
          </div>

          <div className="base f">
              <RegularVertical {...content[6]} />
          </div>

          <div className="base g">
              <SmallWithPic {...content[7]} />
          </div>

          <div className="base h">
              <RegularVertical {...content[8]} />
          </div>

          <div className="base i">
              <SmallWithPic {...content[9]} />
          </div>

          <div className="base j">
              <VerticalLayout>
                  <SmallWithPic {...content[13]} />
                  <SmallWithPic {...content[14]} />
                  <SmallWithPic {...content[15]} />
                  <SmallWithPic {...content[16]} />
                  <SmallWithPic {...content[17]} />
                  <SmallWithPic {...content[18]} />

              </VerticalLayout>
          </div>

      </div>
  )
}

export default NewsApp;
