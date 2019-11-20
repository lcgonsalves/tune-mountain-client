
/**
 * Defines handled transitions.
 * @type {{}}
 */
const TransitionEnums = {
    "IN": "IN",
    "OUT": "OUT"
};

/**
 * Defines default emissions for a transition subject.
 * @type {{in: Transition.in, out: Transition.out}}
 */
const Transition = {
    "in": subject => {
        if (subject) {
            subject.next({
                "position": TransitionEnums.IN
            });
        } else console.error("Invalid subject!");
    },
    "out": subject => {
        if (subject) {
            subject.next({
                "position": TransitionEnums.OUT
            });
        } else console.error("Invalid subject!");
    }
};

export {
    TransitionEnums,
    Transition
};