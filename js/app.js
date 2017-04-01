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

	// TODO: Replace this Subject with an Observable concatting together a bunch of action observables
	const actions$ = new Rx.Subject();

	const store$ = actions$.startWith(initial_state);

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
