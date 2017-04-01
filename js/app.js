(function (window) {
	'use strict';

	const initial_state = {
		todos: [
			{ 
				description: "Build a FRP todo demo",
				completed: false
			}
		]
	};

	const action$ = new Rx.Subject();

	const store$ = action$.startWith(initial_state);

	const reducer = (state, action) => {
		// no-op
		return state;
	};

	const renderer = (state) => {
		console.log("RENDER STATE");
		console.dir(state);

		
	};

	store$.scan(reducer).subscribe(renderer)

})(window);
