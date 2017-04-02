(function (window) {
	'use strict';

	const TODOS_CREATE = "TODOS_CREATE";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DESTROY = "TODO_DESTROY";

	const initial_state = {
		todos: [
			{ 
				description: "Build a FRP todo demo",
				completed: false
			}
		]
	};

	const interval$ = Rx.Observable.interval(1000);
	const val$ = Rx.Observable.of(TODOS_CREATE, TODO_CHANGE, TODO_DESTROY);
	const actions$ =  Rx.Observable.zip(val$, interval$, (val, i) =>  { return { type: val } });

	const reducer = (state, action) => {
		console.log("REDUCING");

		switch (action.type) {
			case TODOS_CREATE:
				const new_todo = { 
					description: "I'm a new todo!",
					completed: false
				};
				state.todos.push(new_todo);
				return state;

			case TODO_CHANGE:
				state.todos[0].description = "I'm changed!";
				return state;

			case TODO_DESTROY:
				state.todos.pop();
				return state;

			default:
				// no-op
				return state;
		}
	};

	const store$ = actions$.scan(reducer, initial_state).startWith(initial_state);

	const e = h.default;
	const patch = snabbdom.init([]);
	const container = document.getElementById("mytodo");

	const renderer = (previous_dom, state) => {
		console.log("RENDER STATE");

		const todos_dom = state.todos.map((todo) => e("li#todo", todo.description));
		const current_dom =
			e("div#todos", [
				e("ul", todos_dom)
			]);

		patch(previous_dom, current_dom);

		return current_dom;
	};

	store$.scan(renderer, container).subscribe((val) => { "no-op" });
})(window);
