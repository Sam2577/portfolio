import React from 'react';
import { gsap } from 'gsap';


class Logo extends React.Component {
	componentDidMount(){
		let t1 = gsap.timeline({repeat: 0, delay: 0, repeatDelay: 1});
		gsap.to('#logoWrapper', {skewX: 20});
		//gsap.to('#logoBackground', {scale: 0, opacity: 1})
		// const reverseAnimation = () => {
		// 	setTimeout(() => { t1.reverse() }, 1000);
		// };
		t1.from('.logoBox', {
			delay: 1,
			duration: 3,
			x: -100,
			y: -100,
			scale: 0,
			rotate: 90,
			stagger: {
			  amount: 2,
			  grid: "auto",
			  from: "center"
		  }
		});
		t1.to('.logoBox', {
			delay: 1,
			duration: 6,
			x: -230,
			y: -100,
			scale: .4,
			rotate: 90,
			stagger: {
			  amount: 2,
			  grid: "auto",
			  from: "center"
			}
		});

	}
	render(){
		const rows = 7, cols = 14, size = 10;
		return(
			<div style={{display: 'flex', position: 'fixed', top: '0', left: '10%', zIndex: '3'}} id="logoWrapper">
			{
				[...new Array(rows)].map( (row, i) => {
						const coordinates = [ '1,1', '1,2', '1,3', '2,2', '3,2', '4,2', '4,1', '3,1', // coordinates for "J"
							'2,3', '2,4', '3,3', '3,4', '4,3', '4,4', // "O"
							'2,5', '2,6', '3,5', '3,6', '4,5', '4,6', // "E"
							'1,7', '1,8', '2,7', '2,8', '3,7', '3,8', '4,7', '4,8', '5,7', '5,8', // "S"
							'3,9', '3,10', '4,9', '4,10', '5,9', '5,10', // "A"
							'3,11', '3,12', '3,13', '4,11', '4,12', '4,13', '5,11', '5,12', '5,13' // "M"
						];
						// '#ffc857', // yellow
						// '#119da4', // turqoise-ish
						// '#19647e' // light blue-ish
						const colors = ['#1f2041', // dark purple
										'#4b3f72', // blue
									];
						let current = -1;

						return (
							<React.Fragment>

								{
									[...new Array(cols)].map((col, j) => {
										if ( !coordinates.includes( `${i},${j}`) ) return;
										current += 1;
										if (current === colors.length){ current = 0 };

										return (
											<div key={`${i},${j}`} id={`logo${i}_${j}`}
												className='logoBox'
												style={{ backgroundColor: `${colors[current]}`, position: 'absolute', top:`${i * size}px`,
												left:`${j * size}px`, width: `${size}px`, height:`${size}px`,
													boxSizing: 'border-box', boxShadow: '3px 4px 4px rgba(0,0,0,.3)',}}>
											</div>
										)
									})
								}

							{ /*<div id='logoBackground' style={{position: 'absolute', left: '100px', top: '50px', borderRadius: '50%', height: '50px', width: '50px'}}></div>*/ }
							</React.Fragment>
						)

					} )
			  }
			</div>
		)
	}
}
export default Logo;
